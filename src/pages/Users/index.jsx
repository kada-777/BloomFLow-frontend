import { useCallback, useEffect, useState } from "react";
import { Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { getApiError } from "../../services/api";
import { userService } from "../../services/userService";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
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

      <div className="search-card">
        <div className="search-input">
          <Search size={20} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari email, role, cabang..."
            aria-label="Cari pengguna"
          />
        </div>
      </div>

      {pageError && (
        <div className="user-page-alert" role="alert">
          <span>{pageError}</span>
          <button className="text-button" type="button" onClick={loadData}>Coba lagi</button>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div className="user-page-state">Memuat data pengguna...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="user-page-state">Belum ada pengguna yang cocok.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>PENGGUNA</th>
                <th>ROLE</th>
                <th>CABANG</th>
                <th>LOGIN TERAKHIR</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="avatar">{getInitials(user)}</div>
                      <div className="user-name">
                        <strong>{getDisplayEmail(user)}</strong>
                        <small>{user.id ? `ID #${user.id}` : ""}</small>
                      </div>
                    </div>
                  </td>
                  <td><span className="role-pill">{roleLabels[user.role] || user.role}</span></td>
                  <td>{user.branch?.name || (user.role === "STAFF_BRANCH" ? "-" : "Head Office")}</td>
                  <td>-</td>
                  <td><span className={`status ${user.isActive ? "active" : "inactive"}`}>{user.isActive ? "Aktif" : "Nonaktif"}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" type="button" onClick={() => openEditForm(user)}>
                        <Pencil size={16} /> Edit
                      </button>
                      {user.isActive && (
                        <button className="delete-btn" type="button" onClick={() => openDeleteDialog(user)}>
                          <Trash2 size={16} /> Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
