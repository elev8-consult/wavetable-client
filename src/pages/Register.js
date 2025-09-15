import React, { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ username, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <div className="auth-title">Register</div>
        {error && <div className="auth-error">{error}</div>}
        <input
          className="auth-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <select
          className="auth-input"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <button className="auth-btn" type="submit">Register</button>
        <Link className="auth-link" to="/login">Already have an account? Login</Link>
      </form>
    </div>
  );
}
