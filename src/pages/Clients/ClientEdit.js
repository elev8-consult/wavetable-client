import React, { useEffect, useState } from 'react';
import { getClientById, updateClient } from '../../api/clients';
import MainLayout from '../../components/MainLayout';
import { useNavigate, useParams } from 'react-router-dom';

export default function ClientEdit() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getClientById(id)
      .then(res => setForm(res.data))
      .catch(() => setError('Failed to load client'));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await updateClient(id, form);
      navigate('/clients');
    } catch (err) {
      setError('Failed to update client');
    }
  };

  if (!form) return <MainLayout>Loading...</MainLayout>;

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Edit Client</h2>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="form-input" />
        <select name="type" value={form.type} onChange={handleChange} className="form-select">
          <option value="individual">Individual</option>
          <option value="student">Student</option>
          <option value="company">Company</option>
        </select>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="form-input" />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="form-input" />
        <input name="age" placeholder="Age" value={form.age} onChange={handleChange} className="form-input" />
        <input name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} className="form-input" />
        <input name="contactPerson" placeholder="Contact Person" value={form.contactPerson} onChange={handleChange} className="form-input" />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="form-textarea" />
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Update</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/clients')}>Cancel</button>
        </div>
      </form>
    </MainLayout>
  );
}
