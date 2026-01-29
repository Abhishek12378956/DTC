import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement forgot password API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast('Password reset link sent to your email', 'success');
    } catch (error) {
      showToast('Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
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
          <Button type="submit" isLoading={loading} className="w-full">
            Send Reset Link
          </Button>
          <div className="text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-800">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

