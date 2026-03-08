import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as api from '@/api';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    try {
      setLoading(true);
      const { data } = await api.forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link generated!');
      console.log('DEMO ONLY - Reset Token:', data.token); // For easier testing without email
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--theme-bg)]">
        <Card className="w-full max-w-md border-none bg-white shadow-2xl rounded-[32px] overflow-hidden">
          <CardContent className="pt-12 pb-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 italic tracking-tight">Check your email</h2>
              <p className="text-gray-500">We've sent a password reset link to <br/> <span className="font-semibold text-gray-900">{email}</span></p>
            </div>
            <div className="pt-4">
              <Link to="/login">
                <Button className="w-full h-14 rounded-2xl bg-black hover:bg-black/90 text-white font-bold uppercase tracking-widest text-xs">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--theme-bg)]">
      <div className="w-full max-w-md space-y-8">
        <Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
        </Link>

        <Card className="border-none bg-white shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="pt-10 pb-2 px-8">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold text-black italic tracking-tighter uppercase whitespace-pre-line">
              Forgot {"\n"}Password?
            </CardTitle>
            <CardDescription className="text-gray-500 font-medium uppercase tracking-widest text-[10px] pt-2">
              No worries, we'll send you reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="name@hotel.com" 
                    className="h-14 pl-12 bg-gray-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-black hover:bg-black/90 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-black/10"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
