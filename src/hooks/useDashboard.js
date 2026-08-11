import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getApiError } from "../services/api";
import { dashboardService } from "../services/dashboardService";

export const FLOWER_STATUSES = [
  { key: "FRESH", label: "Fresh", color: "#6e8b6b" },
  { key: "GRADE_C", label: "Grade C", color: "#c99a3d" },
  { key: "DAMAGED", label: "Damaged", color: "#c75c5c" },
];

const EMPTY_RESOURCES = {
  branches: [],
  farms: [],
  headOfficeInventory: [],
  branchInventory: [],
  dailySales: [],
  receivings: [],
};

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBranchRows(resources, role, branchId) {
  if (role === "STAFF_BRANCH") {
    return resources.branchInventory.flatMap((entry) =>
      (entry.lots || []).map((lot) => ({
        branchId,
        branchName: "My Branch",
        quantity: lot.quantity,
        flowerStatus: lot.flowerStatus,
      }))
    );
  }

  return resources.branchInventory.map((entry) => ({
    branchId: entry.branchId,
    branchName: entry.branchName,
    quantity: entry.quantity,
    flowerStatus: entry.flowerStatus,
  }));
}

function getSelectedRows(rows, selectedBranch) {
  if (selectedBranch === "all") return rows;
  return rows.filter((row) => String(row.branchId) === String(selectedBranch));
}

function buildFlowerStatus(rows) {
  return FLOWER_STATUSES.map((status) => ({
    ...status,
    value: rows
      .filter((row) => row.flowerStatus === status.key)
      .reduce((total, row) => total + toNumber(row.quantity), 0),
  }));
}

function normalizeActivities(resources) {
  const receivingActivities = resources.receivings.map((entry) => ({
    id: `receiving-${entry.id}`,
    type: "Receiving",
    title: entry.farm?.name || "Receiving completed",
    detail: `${entry._count?.items || 0} flower item(s) received`,
    date: entry.receivedDate,
  }));

  const salesActivities = resources.dailySales.map((entry) => ({
    id: `sale-${entry.id}`,
    type: "Daily sales",
    title: entry.branch?.name || "Daily sales submitted",
    detail: `${entry._count?.items || 0} flower item(s) reported`,
    date: entry.salesDate,
  }));

  return [...receivingActivities, ...salesActivities]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 8);
}

function normalizeError(error) {
  return getApiError(error, "Unable to load this dashboard data.");
}

export function useDashboard() {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  const [resources, setResources] = useState(EMPTY_RESOURCES);
  const [resourceErrors, setResourceErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  useEffect(() => {
    let isCurrent = true;
    const requests = {
      dailySales: dashboardService.getDailySales,
    };

    if (role === "STAFF_BRANCH") {
      requests.branchInventory = dashboardService.getMyBranchInventory;
    } else {
      requests.branches = dashboardService.getBranches;
      requests.farms = dashboardService.getFarms;
      requests.headOfficeInventory = dashboardService.getHeadOfficeInventory;
      requests.branchInventory = dashboardService.getBranchInventory;
      requests.receivings = dashboardService.getReceivings;
    }

    setLoading(true);

    Promise.allSettled(
      Object.entries(requests).map(async ([key, request]) => [key, await request()])
    ).then((results) => {
      if (!isCurrent) return;

      const nextResources = { ...EMPTY_RESOURCES };
      const nextErrors = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const [key, value] = result.value;
          nextResources[key] = toArray(value);
        } else {
          const resourceKey = Object.keys(requests)[results.indexOf(result)];
          nextErrors[resourceKey] = normalizeError(result.reason);
        }
      });

      setResources(nextResources);
      setResourceErrors(nextErrors);
      setLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [refreshKey, role]);

  const branches = resources.branches;
  const branchRows = normalizeBranchRows(resources, role, user?.branchId);
  const selectedRows = getSelectedRows(branchRows, selectedBranch);
  const selectedBranchExists = selectedBranch === "all"
    || branches.some((branch) => String(branch.id) === String(selectedBranch));

  useEffect(() => {
    if (role === "STAFF_BRANCH" || !selectedBranchExists) setSelectedBranch("all");
  }, [role, selectedBranchExists]);

  return {
    data: {
      branches,
      summary: {
        totalBranches: resourceErrors.branches ? null : resources.branches.length,
        totalFarms: resourceErrors.farms ? null : resources.farms.length,
        headOfficeStock: resourceErrors.headOfficeInventory
          ? null
          : resources.headOfficeInventory.reduce((total, entry) => total + toNumber(entry.totalAvailable), 0),
        totalBranchStock: resourceErrors.branchInventory
          ? null
          : selectedRows
            .filter((row) => row.flowerStatus === "FRESH" || row.flowerStatus === "GRADE_C")
            .reduce((total, row) => total + toNumber(row.quantity), 0),
        forecastHarvested: null,
        flowersInTransit: null,
      },
      flowerStatus: buildFlowerStatus(selectedRows),
      activities: normalizeActivities(resources),
    },
    loading,
    error: Object.keys(resourceErrors).length ? "Some dashboard data could not be loaded." : null,
    resourceErrors,
    selectedBranch,
    setSelectedBranch,
    refresh,
    isBranchStaff: role === "STAFF_BRANCH",
  };
}
