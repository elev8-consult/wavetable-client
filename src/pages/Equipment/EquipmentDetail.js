import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getEquipmentById } from '../../api/equipment';
import { useParams } from 'react-router-dom';

export default function EquipmentDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    getEquipmentById(id).then(res => setItem(res.data));
  }, [id]);

  if (!item) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">{item.name}</h2>
        <div>
          <a className="btn btn-ghost" href={`/equipment/${item._id}/edit`}>Edit</a>
        </div>
      </div>
      <div>Type: {item.type}</div>
      <div>Status: {item.status}</div>
    </MainLayout>
  );
}
