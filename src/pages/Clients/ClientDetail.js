import React, { useEffect, useState } from 'react';
import { getClientById } from '../../api/clients';
import MainLayout from '../../components/MainLayout';
import { useParams, Link } from 'react-router-dom';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getClientById(id)
      .then(res => setClient(res.data))
      .catch(() => setError('Failed to load client'));
  }, [id]);

  if (error) return <MainLayout><div style={{ color: 'red' }}>{error}</div></MainLayout>;
  if (!client) return <MainLayout>Loading...</MainLayout>;

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">{client.name}</h2>
        <div>
          <Link to={`/clients/${client._id}/edit`} className="btn btn-ghost">Edit</Link>
        </div>
      </div>
      <div>Type: <b>{client.type}</b></div>
      <div>Email: {client.email}</div>
      <div>Phone: {client.phone}</div>
      <div>Age: {client.age}</div>
      <div>Company Name: {client.companyName}</div>
      <div>Contact Person: {client.contactPerson}</div>
      <div>Notes: {client.notes}</div>
    </MainLayout>
  );
}
