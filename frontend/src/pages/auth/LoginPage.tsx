import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showToast('Login successful', 'success');
      
      navigate('/');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex flex-col items-center">
            <img 
              src="https://www.itcpspd.com/images/itc-logo.svg" 
              alt="ITC Logo" 
              className="h-28 w-auto mb-8" 
            />
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
              Training Calendar Management System
            </h2>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email address"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" isLoading={loading} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

