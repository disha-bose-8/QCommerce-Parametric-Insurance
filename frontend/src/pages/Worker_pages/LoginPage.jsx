import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // Clean the phone number (remove spaces/dashes if any)
    const cleanPhone = phoneNumber.trim();

    // HACKATHON MOCK LOGIC
    if (cleanPhone === "9999999999" && password === "admin123") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("isLoggedIn", "true");
      navigate('/admin');
    } 
    else if (cleanPhone === "8888888888" && password === "worker123") {
      localStorage.setItem("role", "worker");
      localStorage.setItem("isLoggedIn", "true");
      navigate('/dashboard');
    } 
    else {
      alert("Invalid Credentials!\n\nAdmin: 9999999999 / admin123\nWorker: 8888888888 / worker123");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>

        <div className="login-header">
          <div className="brand-logo">
            <Shield size={40} color="#00ff88" />
          </div>
          <h1>Secure Login</h1>
          <p>Enter your details to access QShield</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {/* PHONE NUMBER INPUT */}
          <div className="input-group">
            <label>Phone Number</label>
            <div className="field-wrapper">
              <span className="prefix">+91</span>
              <Phone size={18} className="icon" />
              <input
                type="tel"
                placeholder="98765 43210"
                maxLength="10"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div className="input-group">
            <label>Password</label>
            <div className="field-wrapper">
              <Lock size={18} className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            Verify & Enter
          </button>
        </form>

        <div className="login-footer">
          <p>New to QShield? <span onClick={() => navigate('/register')}>Register Now</span></p>
        </div>
      </div>
    </div>
  );
}