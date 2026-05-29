// src/pages/AdminLoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { adminLogin } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setAdmin = useAdminAuthStore((state) => state.setAdmin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await adminLogin(email, password);
      // response should contain { success, admin, token }
      setAdmin(response.admin, response.token);
      navigate('/admin/deposits', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-admin-bg">
      <div className="card p-8 w-full max-w-md">
        <h1 className="font-heading font-bold text-2xl text-white text-center mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-loss text-sm">{error}</p>}
          <Button type="submit" variant="gold" className="w-full" loading={loading}>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}