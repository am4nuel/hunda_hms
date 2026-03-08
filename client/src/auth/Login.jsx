import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '@/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, User, Lock, ArrowRight, ShieldCheck, Fingerprint, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      if (profile.user?.role === 'hotel_admin') {
        navigate('/hotel-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.identifier.trim()) {
      setError('Please enter your email or username.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.login(formData);
      localStorage.setItem('profile', JSON.stringify(data));
      
      const role = data.user?.role;
      if (role === 'hotel_admin') {
        navigate('/hotel-dashboard');
      } else if (role === 'admin') {
        navigate('/');
      } else {
        // Fallback for unknown roles
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--theme-bg)] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--theme-primary)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--theme-primary)]/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border-none p-0 overflow-hidden shadow-2xl rounded-[2.5rem] bg-[var(--theme-bg)] ring-1 ring-white/10 relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-50" />
        
        <CardHeader className="p-10 pb-6 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-[2rem] bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-2xl shadow-[var(--theme-primary)]/40 ring-4 ring-[var(--theme-primary)]/10">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-3xl font-black uppercase tracking-tighter">
              Access Portal
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 italic">
              Property Management Node v2.0
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="px-10 space-y-6">
            {error && (
              <div className="p-4 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/20 rounded-2xl text-center flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}
            
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Identity Identifier</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300">
                  {isEmail(formData.identifier) ? (
                    <Mail className="h-4 w-4 text-[var(--theme-primary)]" />
                  ) : formData.identifier.length > 0 ? (
                    <User className="h-4 w-4 text-[var(--theme-primary)]" />
                  ) : (
                    <Fingerprint className="h-4 w-4 opacity-20" />
                  )}
                </div>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="Email or Username"
                  required
                  onChange={handleChange}
                  className="bg-foreground/5 border-[var(--theme-border)] rounded-2xl pl-12 pr-4 py-6 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all border-none"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Access Secret</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20 group-focus-within:opacity-100 group-focus-within:text-[var(--theme-primary)] transition-all" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                  className="bg-foreground/5 border-[var(--theme-border)] rounded-2xl pl-12 pr-12 py-6 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all border-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--theme-primary)] transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-10 pt-4 flex flex-col space-y-6">
            <button 
                type="submit" 
                className="group relative w-full bg-[var(--theme-primary)] hover:opacity-90 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-[var(--theme-primary)]/30 active:scale-[0.98] border border-white/10 flex items-center justify-center gap-3 overflow-hidden" 
                disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Initialising...
                </>
              ) : (
                <>
                  Establish Connection
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="text-center">
              <Link to="/forgot-password">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 hover:text-[var(--theme-primary)] cursor-pointer transition-all duration-300">
                  Forgot Access Credentials?
                </span>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
