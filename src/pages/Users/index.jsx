import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { getApiError } from "../../services/api";
import { userService } from "../../services/userService";
import ActionButtons from "../../components/common/ActionButtons/ActionButtons";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import GenericDataTable from "../../components/common/GenericDataTable/GenericDataTable";
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
  return getDisplayEmail(user)
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

function matchesSearch(user, searchTerm) {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return true;
  return [
    user.email,
    user.role,
    roleLabels[user.role],
    user.branch?.name,
  ].filter(Boolean).some((value) => value.toLowerCase().includes(query));
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
      setUsers(normalizeList(usersResult.value));
    } else {
      setPageError(getApiError(usersResult.reason, "Pengguna gagal dimuat."));
    }

    if (branchesResult.status === "fulfilled") {
      setBranches(normalizeList(branchesResult.value));
    } else {
      setPageError((current) => current || getApiError(branchesResult.reason, "Cabang gagal dimuat."));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      setFormError(getApiError(error, "Perubahan pengguna gagal disimpan."));
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
      setDeleteError(getApiError(error, "Pengguna gagal dinonaktifkan."));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => matchesSearch(user, searchTerm));

  const columns = [
    {
      key: "email",
      label: "PENGGUNA",
      render: (user) => (
        <div className="user-info">
          <div className="avatar">{getInitials(user)}</div>
          <div className="user-name">
            <strong>{getDisplayEmail(user)}</strong>
            <small>{user.id ? `ID #${user.id}` : ""}</small>
          </div>
        </div>
      ),
    },
    { key: "role", label: "ROLE", render: (user) => <span className="role-pill">{roleLabels[user.role] || user.role}</span> },
    { key: "branch", label: "CABANG", render: (user) => user.branch?.name || (user.role === "STAFF_BRANCH" ? "-" : "Head Office") },
    { key: "lastLogin", label: "LOGIN TERAKHIR", render: () => "-" },
    { key: "isActive", label: "STATUS", render: (user) => <span className={`status ${user.isActive ? "active" : "inactive"}`}>{user.isActive ? "Aktif" : "Nonaktif"}</span> },
  ];

  return (
    <div className="user-page">
      <div className="page-header">
        <div>
          <h1>Manajemen Pengguna</h1>
          <p>Kelola akses dan peran staf operasional di seluruh cabang</p>
        </div>
        <button className="add-btn" type="button" onClick={openCreateForm}>
          <UserPlus size={18} />
          Tambah Pengguna
        </button>
      </div>

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Cari email, role, cabang..." ariaLabel="Cari pengguna" />

      <ActionNotice message={pageError} tone="error" onAction={loadData} onClose={() => setPageError("")} />

      <GenericDataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="Belum ada pengguna yang cocok."
        renderActions={(user) => (
          <ActionButtons
            onEdit={() => openEditForm(user)}
            onDelete={user.isActive ? () => openDeleteDialog(user) : undefined}
          />
        )}
      />

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
        title="Hapus Pengguna?"
        message={deleteError || "Pengguna akan dinonaktifkan dan tidak dapat mengakses aplikasi lagi."}
        confirmText="Hapus"
        cancelText="Batal"
        danger
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
        submitting={deleteSubmitting}
      />
    </div>
  );
}
