// Author: Nathaniel Serrano
// Description: A reusable paginated and sortable table component.
import { useState, useMemo } from "react";

const PaginatedTable = ({ data, columns, rowsPerPage, currentPage, setCurrentPage, onRowClick }) => {
    // const [page, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        return sortConfig.direction === "asc"
          ? aVal.toString().localeCompare(bVal.toString())
          : bVal.toString().localeCompare(aVal.toString());
      }
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentRows = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white/10 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
        <thead className="bg-white/10 text-slate-300">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="p-4 cursor-pointer select-none hover:text-white"
                onClick={() => requestSort(col.key)}
              >
                <div className="flex items-center justify-center gap-1">
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row, idx) => (
            <tr key={idx} 
            onClick={() => onRowClick && onRowClick(row)}
             className="hover:bg-white/20 cursor-pointer transition text-center">
              {columns.map((col) => (
                <td key={col.key} className="p-4 border-t border-white/10">
                  {row[col.key] ?? ""}
                </td>
              ))}
            </tr>
          ))}
          {currentRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="p-4 text-slate-300 text-center">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4 text-slate-300">
  <button
    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
    disabled={currentPage === 1}
    className="px-3 py-1 rounded-md bg-white/10 border border-white/10 disabled:opacity-40 hover:bg-white/20"
  >
    Prev
  </button>

  <span className="text-white/80">
    Page {currentPage} of {totalPages}
  </span>

  <button
    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-3 py-1 rounded-md bg-white/10 border border-white/10 disabled:opacity-40 hover:bg-white/20"
  >
    Next
  </button>
</div>

        )}
    </div>
  );
};

export default PaginatedTable;
