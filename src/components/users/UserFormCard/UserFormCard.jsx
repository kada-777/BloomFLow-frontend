import { useEffect, useState } from "react";
import { Building2, KeyRound, Mail, Save, UserPlus, X } from "lucide-react";
import Modal from "../../common/Modal/Modal";
import "./UserFormCard.css";

const roles = [
  ["SUPERADMIN", "Super Admin"],
  ["STAFF_HEAD_OFFICE", "Head Office"],
  ["STAFF_BRANCH", "Branch Staff"],
];

function getFormState(mode, initialData) {
  return {
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "STAFF_HEAD_OFFICE",
    branchId: initialData?.branchId ? String(initialData.branchId) : "",
    isActive: initialData?.isActive ?? true,
    mode,
  };
}

export default function UserFormCard({
  open,
  mode,
  initialData,
  branches,
  onSubmit,
  onClose,
  submitting = false,
  error,
}) {
  const [form, setForm] = useState(() => getFormState(mode, initialData));
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(getFormState(mode, initialData));
      setFieldErrors({});
    }
  }, [open, mode, initialData]);

  const isCreate = mode === "create";
  const isBranchRole = form.role === "STAFF_BRANCH";

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: field === "role" && value !== "STAFF_BRANCH" ? value : value,
      ...(field === "role" && value !== "STAFF_BRANCH" ? { branchId: "" } : {}),
    }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email wajib diisi.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = "Gunakan format email yang valid.";
    if (isCreate && !form.password) nextErrors.password = "Password awal wajib diisi.";
    if (!form.role) nextErrors.role = "Role wajib dipilih.";
    if (isBranchRole && !form.branchId) nextErrors.branchId = "Cabang wajib dipilih untuk Branch Staff.";
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    const payload = {
      role: form.role,
      branchId: isBranchRole ? Number(form.branchId) : null,
    };

    if (isCreate) {
      payload.email = form.email.trim().toLowerCase();
      payload.password = form.password;
    } else {
      payload.isActive = form.isActive;
      if (form.password) payload.password = form.password;
    }

    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      labelledBy="user-form-title"
    >
      <form className="user-form-card" onSubmit={handleSubmit} noValidate>
        <header className="user-form-header">
          <div className="user-form-heading">
            <span className="user-form-eyebrow">USER ACCESS</span>
            <h2 id="user-form-title">{isCreate ? "Tambah Pengguna Baru" : "Edit Pengguna"}</h2>
            <p>{isCreate ? "Buat akun staf baru" : "Perbarui informasi pengguna"}</p>
          </div>
          <button className="user-form-close" type="button" onClick={onClose} disabled={submitting} aria-label="Tutup dialog">
            <X size={20} />
          </button>
        </header>

        <div className="user-form-body">
          {error && <div className="user-form-error" role="alert">{error}</div>}

          <label className="user-form-field">
            <span>Email Kantor</span>
            <div className="user-form-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                disabled={!isCreate || submitting}
                placeholder="nama@bloomflow.id"
                autoComplete="email"
              />
            </div>
            {!isCreate && <small>Email tidak dapat diubah.</small>}
            {fieldErrors.email && <em>{fieldErrors.email}</em>}
          </label>

          <label className="user-form-field">
            <span>{isCreate ? "Password Awal" : "Password Baru"}</span>
            <div className="user-form-input-wrap">
              <KeyRound size={18} />
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                disabled={submitting}
                placeholder={isCreate ? "Masukkan password awal" : "Kosongkan jika tidak diubah"}
                autoComplete={isCreate ? "new-password" : "new-password"}
              />
            </div>
            {fieldErrors.password && <em>{fieldErrors.password}</em>}
          </label>

          <label className="user-form-field">
            <span>Role</span>
            <select value={form.role} onChange={(event) => updateField("role", event.target.value)} disabled={submitting}>
              {roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {fieldErrors.role && <em>{fieldErrors.role}</em>}
          </label>

          <div className="user-form-grid">
            <label className="user-form-field">
              <span><Building2 size={15} /> Cabang</span>
              <select value={form.branchId} onChange={(event) => updateField("branchId", event.target.value)} disabled={!isBranchRole || submitting}>
                <option value="">{isBranchRole ? "Pilih cabang" : "Tidak berlaku"}</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
              {fieldErrors.branchId && <em>{fieldErrors.branchId}</em>}
            </label>

            <label className="user-form-field">
              <span>Status</span>
              <select value={form.isActive ? "active" : "inactive"} onChange={(event) => updateField("isActive", event.target.value === "active")} disabled={submitting}>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </label>
          </div>
        </div>

        <footer className="user-form-footer">
          <button className="user-form-secondary" type="button" onClick={onClose} disabled={submitting}>Batal</button>
          <button className="user-form-primary" type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : isCreate ? <><UserPlus size={17} /> Buat Akun</> : <><Save size={17} /> Simpan Perubahan</>}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
