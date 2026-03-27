import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Phone, Lock, User, MapPin } from 'lucide-react';
import './RegisterPage.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zone: '',
    platform: '',
    password: '',
  });

  const handleRegister = (e) => {
    e.preventDefault();
    // Mock registration - navigate to dashboard
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="register-page">
      <div className="register-content">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>

        <div className="register-header">
          <div className="register-logo">
            <Shield size={48} />
          </div>
          <h1>Create Account</h1>
          <p>Register to start protecting your income</p>
        </div>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <Phone size={20} className="input-icon" />
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <div className="input-wrapper">
              <MapPin size={20} className="input-icon" />
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                required
              >
                <option value="">Select your platform</option>
                <option value="uber">Uber</option>
                <option value="ola">Ola</option>
                <option value="swiggy">Swiggy</option>
                <option value="zomato">Zomato</option>
                <option value="dunzo">Dunzo</option>
                <option value="porter">Porter</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="zone">Zone</label>
            <div className="input-wrapper">
              <MapPin size={20} className="input-icon" />
              <input
                id="zone"
                name="zone"
                type="text"
                placeholder="e.g., South Delhi, Andheri West"
                value={formData.zone}
                onChange={handleChange}
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
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-register">
            Register
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account?</p>
          <button className="link-button" onClick={() => navigate('/login')}>
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}
