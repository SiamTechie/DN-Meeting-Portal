import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { loginUser, registerUser } from '../services/auth';
import { User } from '../types';
import { Language, translations } from '../locales';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  lang: Language;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, lang }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const t = (key: string) => {
    // Basic translations since we might not have all keys in locales
    if (lang === "th") {
      if (key === "Login") return "เข้าสู่ระบบ";
      if (key === "Register") return "สมัครสมาชิก";
      if (key === "Email") return "อีเมล";
      if (key === "Password") return "รหัสผ่าน";
      if (key === "Name") return "ชื่อ-นามสกุล";
      if (key === "Submit") return mode === "login" ? "เข้าสู่ระบบ" : "ลงทะเบียน";
      if (key === "Toggle") return mode === "login" ? "ยังไม่มีบัญชี? สมัครเลย" : "มีบัญชีแล้ว? เข้าสู่ระบบ";
    }
    return key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        const user = await loginUser(email, password);
        onLoginSuccess(user);
        onClose();
      } else {
        if (!name.trim()) throw new Error("Name is required");
        const user = await registerUser(email, password, name);
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#000000]/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-outline-variant/50"
        >
          {/* Header */}
          <div className="bg-primary/5 p-6 border-b border-outline-variant/30 text-center relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-on-surface-variant hover:bg-outline-variant/30 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-black text-on-surface">
              {t(mode === "login" ? "Login" : "Register")}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              DN Meeting Portal
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">{t("Name")}</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">{t("Email")}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">{t("Password")}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-wait"
              >
                {isLoading ? "..." : t("Submit")}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm text-primary font-medium hover:underline cursor-pointer"
              >
                {t("Toggle")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
