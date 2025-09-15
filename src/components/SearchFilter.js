import React from 'react';
import './ui.css';

export default function SearchFilter({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="dt-filter">
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      {value && <button className="clear-btn" onClick={() => onChange('')} aria-label="Clear search">Clear</button>}
    </div>
  );
}
