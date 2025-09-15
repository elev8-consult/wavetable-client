import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getEquipmentById, updateEquipment } from '../../api/equipment';
import { useParams, useNavigate } from 'react-router-dom';

export default function EquipmentEdit() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEquipmentById(id).then(res => setItem(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateEquipment(id, item);
    navigate('/equipment');
  };

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (!item) return <MainLayout><div>Not found</div></MainLayout>;

    return (
      <MainLayout>
        <div className="page-header">
          <h2 className="page-title">Edit Equipment</h2>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <input className="form-input" value={item.name || ''} onChange={e => setItem({ ...item, name: e.target.value })} placeholder="Name" />
          <input className="form-input" value={item.type || ''} onChange={e => setItem({ ...item, type: e.target.value })} placeholder="Type" />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/equipment')}>Cancel</button>
          </div>
        </form>
      </MainLayout>
    );
}
