import React from 'react';
import './ui.css';

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  const prev = () => { if (page > 1) onPageChange(page - 1); };
  const next = () => { if (page < totalPages) onPageChange(page + 1); };

  return (
    <div className="dt-pagination" role="navigation" aria-label="Pagination">
      <button onClick={prev} className={page === 1 ? 'disabled' : ''} aria-disabled={page === 1}>Prev</button>
      {pages.map(p => (
        <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)} aria-current={p === page ? 'page' : undefined}>{p}</button>
      ))}
      <button onClick={next} className={page === totalPages ? 'disabled' : ''} aria-disabled={page === totalPages}>Next</button>
    </div>
  );
}
