import { EmptyState, PageHeader } from "../../components/ui";
import "./user.css";
import { Search, UserPlus, Pencil, Trash2 } from "lucide-react";

const users = [
  {
    id: 1,
    initials: "AK",
    name: "Arinda Kusuma",
    email: "arinda@floranusa.id",
    role: "Operations Manager",
    branch: "Jakarta Pusat",
    lastLogin: "2026-08-05 09:14",
    status: "Aktif",
  },
  {
    id: 2,
    initials: "RP",
    name: "Rizky Pratama",
    email: "rizky@floranusa.id",
    role: "Branch Manager",
    branch: "Bandung",
    lastLogin: "2026-08-05 08:45",
    status: "Aktif",
  },
  {
    id: 3,
    initials: "DS",
    name: "Dewi Santika",
    email: "dewi@floranusa.id",
    role: "Inventory Staff",
    branch: "Jakarta Pusat",
    lastLogin: "2026-08-04 17:30",
    status: "Aktif",
  },
];

export default function UserManagement() {
  return (
    <div className="user-page">

      <div className="page-header">

        <div>
          <h1>Manajemen Pengguna</h1>
          <p>Kelola akses dan peran staf operasional di seluruh cabang</p>
        </div>

        <button className="add-btn">
          <UserPlus size={18} />
          Tambah Pengguna
        </button>

      </div>

      <div className="search-card">
        <div className="search-input">

          <Search size={20} color="#9E8D6B" />

          <input
            type="text"
            placeholder="Cari nama, email, role..."
          />

        </div>
      </div>

      <div className="table-card">

        <table>

          <thead>

            <tr>
              <th>PENGGUNA</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>CABANG</th>
              <th>LOGIN TERAKHIR</th>
              <th>STATUS</th>
              <th></th>
            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr key={user.id}>

                <td>

                  <div className="user-info">

                    <div className="avatar">
                      {user.initials}
                    </div>

                    <span>{user.name}</span>

                  </div>

                </td>

                <td>{user.email}</td>

                <td>
                  <span className="role-pill">
                    {user.role}
                  </span>
                </td>

                <td>{user.branch}</td>

                <td>{user.lastLogin}</td>

                <td>
                  <span className="status active">
                    {user.status}
                  </span>
                </td>

                <td>

                  <div className="action-buttons">

                    <button className="edit-btn">
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button className="delete-btn">
                      <Trash2 size={16} />
                      Hapus
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
