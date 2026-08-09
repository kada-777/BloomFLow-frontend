import "./GenericDataTable.css";

export default function GenericDataTable({
  columns,
  data,
  loading,
  emptyMessage = "Belum ada data.",
  rowKey = (row) => row.id,
  renderActions,
  className = "table-card",
}) {
  return (
    <div className={`generic-data-table ${className}`}>
      {loading ? (
        <div className="generic-table-state">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="generic-table-state">{emptyMessage}</div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.key}>{column.label}</th>)}
              {renderActions && <th aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : row[column.key] ?? "-"}
                  </td>
                ))}
                {renderActions && <td>{renderActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
