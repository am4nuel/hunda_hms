import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as api from '@/api';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      await api.resetPassword({ token, newPassword: formData.newPassword });
      setCompleted(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--theme-bg)]">
        <Card className="w-full max-w-md border-none bg-white shadow-2xl rounded-[32px] overflow-hidden">
          <CardContent className="pt-12 pb-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-sm border border-green-100">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 italic tracking-tight uppercase">Success!</h2>
              <p className="text-gray-500 font-medium">Your password has been updated securely. You can now log in with your new credentials.</p>
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full h-14 rounded-2xl bg-black hover:bg-black/90 text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-black/10"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--theme-bg)]">
      <Card className="w-full max-w-md border-none bg-white shadow-2xl rounded-[32px] overflow-hidden">
        <CardHeader className="pt-10 pb-2 px-8">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white mb-6">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold text-black italic tracking-tighter uppercase whitespace-pre-line">
            Reset {"\n"}Password
          </CardTitle>
          <CardDescription className="text-gray-500 font-medium uppercase tracking-widest text-[10px] pt-2">
            Create a new secure password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 6 characters" 
                  className="h-14 pl-12 pr-12 bg-gray-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-black"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Repeat your password" 
                  className="h-14 pl-12 bg-gray-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-black"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-black hover:bg-black/90 text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-black/10"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
