import React, { useState } from 'react';
import { createClient } from '../../api/clients';
import MainLayout from '../../components/MainLayout';
import { useNavigate } from 'react-router-dom';

export default function ClientCreate() {
  const [form, setForm] = useState({ name: '', type: 'individual', email: '', phone: '', age: '', companyName: '', contactPerson: '', notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await createClient(form);
      navigate('/clients');
    } catch (err) {
      setError('Failed to create client');
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Add Client</h2>
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
          <button className="btn btn-primary" type="submit">Create</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/clients')}>Cancel</button>
        </div>
      </form>
    </MainLayout>
  );
}
