import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, User, Lock } from 'lucide-react';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  // Changed state from 'phone' to 'username'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // UPDATED CREDENTIALS CHECK
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("role", "admin");
      navigate('/admin'); 
    } 
    else if (username === "worker" && password === "worker123") {
      localStorage.setItem("role", "worker");
      navigate('/dashboard');
    } 
    else {
      alert("Invalid credentials. Try: admin/admin123 or worker/worker123");
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>

        <div className="login-header">
          <div className="login-logo">
            <Shield size={48} />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to your QShield account</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              {/* Changed Phone icon to User icon */}
              <User size={20} className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-login">
            Login
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <button className="link-button" onClick={() => navigate('/register')}>
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}