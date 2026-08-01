import { PageHeader, StatusBadge } from "../../components/ui";
const users = [
  ["Alya Nirmala", "Super Admin", "Operations", "Today, 08:42"],
  ["Dina Pratiwi", "Branch Staff", "Kemang", "Today, 08:16"],
  ["Raka Putra", "Head Office", "Supply Planning", "Yesterday, 17:02"],
  ["Maya Sari", "Quality Inspector", "Quality Control", "Yesterday, 14:28"],
];
export default function Users() {
  return (
    <>
      <PageHeader
        title="Team & permissions"
        subtitle="Manage access across BloomFlow operations"
        action="+ Invite user"
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th>Last login</th>
              <th>Permissions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u[0]}>
                <td className="avatar-cell">
                  <b>
                    {u[0]
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                  </b>
                  {u[0]}
                </td>
                <td>{u[1]}</td>
                <td>{u[2]}</td>
                <td>{u[3]}</td>
                <td>Role-based access</td>
                <td>
                  <StatusBadge>{i === 3 ? "Pending" : "Active"}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
