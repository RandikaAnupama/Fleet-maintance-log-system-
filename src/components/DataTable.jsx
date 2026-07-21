export default function DataTable({ columns, rows, emptyMessage = "No records found." }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-5 text-muted">{emptyMessage}</td></tr>
          ) : rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
