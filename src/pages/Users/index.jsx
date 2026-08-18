import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { getApiError } from "../../services/api";
import { userService } from "../../services/userService";
import ActionButtons from "../../components/common/ActionButtons/ActionButtons";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import GenericDataTable from "../../components/common/GenericDataTable/GenericDataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import UserFormCard from "../../components/users/UserFormCard/UserFormCard";
import "./user.css";

const roleLabels = {
  SUPERADMIN: "Super Admin",
  STAFF_HEAD_OFFICE: "Head Office",
  STAFF_BRANCH: "Branch Staff",
};

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function getDisplayEmail(user) {
  return user.email || "-";
}

function getInitials(user) {
  return (
    getDisplayEmail(user)
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function matchesSearch(user, searchTerm) {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return true;
  return [user.email, user.role, roleLabels[user.role], user.branch?.name]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query));
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError("");

    const [usersResult, branchesResult] = await Promise.allSettled([
      userService.list(),
      userService.listBranches(),
    ]);

    if (usersResult.status === "fulfilled") {
      setUsers(normalizeList(usersResult.value.data));
      setPagination(usersResult.value.pagination);
    } else {
      setPageError(getApiError(usersResult.reason, "Unable to load users."));
    }

    if (branchesResult.status === "fulfilled") {
      setBranches(normalizeList(branchesResult.value));
    } else {
      setPageError(
        (current) =>
          current || getApiError(branchesResult.reason, "Unable to load branches."),
      );
    }

    setLoading(false);
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (pagination?.totalPages && page > pagination.totalPages) setPage(pagination.totalPages);
  }, [page, pagination]);

  const updateSearchTerm = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingUser(null);
    setFormError("");
  };

  const handleFormSubmit = async (payload) => {
    setFormSubmitting(true);
    setFormError("");

    try {
      if (editingUser) {
        await userService.update(editingUser.id, payload);
      } else {
        await userService.create(payload);
      }
      closeForm();
      await loadData();
    } catch (error) {
      setFormError(getApiError(error, "Unable to save user changes."));
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDeleteDialog = (user) => {
    setDeletingUser(user);
    setDeleteError("");
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setDeletingUser(null);
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleteSubmitting(true);
    setDeleteError("");

    try {
      await userService.update(deletingUser.id, { isActive: false });
      closeDeleteDialog();
      await loadData();
    } catch (error) {
      setDeleteError(getApiError(error, "Unable to deactivate the user."));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => matchesSearch(user, searchTerm));

  const columns = [
    {
      key: "email",
       label: "USER",
      render: (user) => (
        <div className="user-info">
          <div className="avatar">{getInitials(user)}</div>
          <div className="user-name">
            <strong>{getDisplayEmail(user)}</strong>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "ROLE",
      render: (user) => (
        <span className="role-pill">{roleLabels[user.role] || user.role}</span>
      ),
    },
    {
      key: "branch",
       label: "BRANCH",
      render: (user) =>
        user.branch?.name ||
        (user.role === "STAFF_BRANCH" ? "-" : "Head Office"),
    },
    {
      key: "isActive",
       label: "STATUS",
      render: (user) => (
        <span className={`status ${user.isActive ? "active" : "inactive"}`}>
           {user.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="user-page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage operational staff access and roles across all branches</p>
        </div>
        <button className="add-btn" type="button" onClick={openCreateForm}>
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={updateSearchTerm}
        placeholder="Search email, role, or branch..."
        ariaLabel="Search users"
      />

      <ActionNotice
        message={pageError}
        tone="error"
        onAction={loadData}
        onClose={() => setPageError("")}
      />

      <GenericDataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No matching users found."
        renderActions={(user) => (
          <ActionButtons
            onEdit={() => openEditForm(user)}
            onDelete={user.isActive ? () => openDeleteDialog(user) : undefined}
          />
        )}
      />
      <Pagination pagination={pagination} onPageChange={setPage} disabled={loading} />

      <UserFormCard
        open={formOpen}
        mode={editingUser ? "edit" : "create"}
        initialData={editingUser}
        branches={branches}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        submitting={formSubmitting}
        error={formError}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete User?"
        message={
          deleteError ||
          "The user will be deactivated and will no longer be able to access the application."
        }
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
        submitting={deleteSubmitting}
      />
    </div>
  );
}
