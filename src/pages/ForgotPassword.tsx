import React, { useState } from 'react';
import { resetUserPassword } from '../services/authService';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetUserPassword(email);
      setMessage('ลิงก์สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว โปรดตรวจสอบกล่องข้อความ');
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้ โปรดลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center relative p-4">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-100/70 rounded-full blur-[140px] opacity-70"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-stone-200/60 rounded-full blur-[160px] opacity-65"></div>
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[180px] opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-outline-variant/50">
        {/* Header */}
        <div className="bg-primary/5 p-6 border-b border-outline-variant/30 text-center">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-black text-on-surface">
            ลืมรหัสผ่าน
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            กรุณากรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100 font-medium text-center">
                {message}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant ml-1">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? "กำลังส่ง..." : "ส่งอีเมลยืนยัน"}
            </button>
            
            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm text-primary font-medium hover:underline cursor-pointer"
              >
                <ArrowLeft size={16} className="mr-1" />
                กลับไปหน้าหลัก
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
