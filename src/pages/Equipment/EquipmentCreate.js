import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { addEquipment } from '../../api/equipment';
import { useNavigate } from 'react-router-dom';

export default function EquipmentCreate() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addEquipment({ name, type });
    navigate('/equipment');
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Add Equipment</h2>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <input className="form-input" value={type} onChange={e => setType(e.target.value)} placeholder="Type" />
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Create</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/equipment')}>Cancel</button>
        </div>
      </form>
    </MainLayout>
  );
}
