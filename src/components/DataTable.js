import React from 'react';
import './ui.css';

export default function DataTable({ columns, data }) {
  return (
    <div className="dt-wrapper">
  <div style={{ overflowX: 'auto' }}>
  <table className="dt-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="dt-empty">No results</td>
            </tr>
          )}
          {data.map(row => (
            <tr key={row._id} className="dt-row">
              {columns.map(col => (
                <td key={col.key} data-label={col.label}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
