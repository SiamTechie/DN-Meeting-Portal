import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  verifyPasswordResetCode, 
  confirmPasswordReset, 
  applyActionCode 
} from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "motion/react";
import { Lock, Mail, CheckCircle, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

export function AuthAction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode"); // 'resetPassword' or 'verifyEmail'
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState<"verifying" | "resetForm" | "success" | "error">("verifying");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus("error");
      setErrorMsg("ลิงก์ไม่ถูกต้องหรือหมดอายุการใช้งาน / Invalid or expired action link.");
      return;
    }

    if (mode === "verifyEmail") {
      // Auto-apply verification code
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("success");
        })
        .catch((err) => {
          setStatus("error");
          setErrorMsg(getErrorMessage(err.code));
        });
    } else if (mode === "resetPassword") {
      // Verify reset code first to check validity and fetch user's email
      verifyPasswordResetCode(auth, oobCode)
        .then((userEmail) => {
          setEmail(userEmail);
          setStatus("resetForm");
        })
        .catch((err) => {
          setStatus("error");
          setErrorMsg(getErrorMessage(err.code));
        });
    } else {
      setStatus("error");
      setErrorMsg("ไม่สนับสนุนโหมดการทำรายการนี้ / Unsupported action mode.");
    }
  }, [mode, oobCode]);

  // Handle auto-redirect countdown on success
  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login");
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth/expired-action-code":
        return "ลิงก์นี้หมดอายุการใช้งานแล้ว โปรดขอลิงก์ใหม่ / This link has expired. Please request a new one.";
      case "auth/invalid-action-code":
        return "รหัสลิงก์ไม่ถูกต้องหรือเคยใช้งานไปแล้ว / The link code is invalid or has already been used.";
      case "auth/user-disabled":
        return "บัญชีผู้ใช้ถูกระงับ / This user account has been disabled.";
      case "auth/user-not-found":
        return "ไม่พบข้อมูลผู้ใช้นี้ในระบบ / User not found.";
      case "auth/weak-password":
        return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร / Password should be at least 6 characters.";
      default:
        return "เกิดข้อผิดพลาดไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง / An unexpected error occurred. Please try again.";
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    if (newPassword !== confirmPassword) {
      setErrorMsg("รหัสผ่านไม่ตรงกัน / Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร / Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFF] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[150px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-outline-variant/60 rounded-3xl shadow-[0_12px_40px_rgba(99,16,163,0.06)] overflow-hidden"
      >
        {/* Card Header Branding */}
        <div className="bg-[#6310a3]/5 p-6 border-b border-outline-variant/35 text-center">
          <div className="w-12 h-12 bg-[#6310a3] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md border border-white/10">
            <span className="material-symbols-outlined text-[24px]">meeting_room</span>
          </div>
          <h1 className="font-display font-black text-lg text-[#6310a3] uppercase tracking-wide">DN CENTER</h1>
          <p className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-widest mt-0.5">Meeting Portal</p>
        </div>

        {/* Card Content State Router */}
        <div className="p-6 md:p-8">
          {status === "verifying" && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#6310a3] mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display font-bold text-[#6310a3] text-sm">กำลังตรวจสอบข้อมูลรายการ...</h3>
                <p className="text-xs text-on-surface-variant">Validating action code, please wait...</p>
              </div>
            </div>
          )}

          {status === "resetForm" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-10 h-10 bg-indigo-50 text-[#6310a3] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-on-surface text-base">ตั้งรหัสผ่านใหม่</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Reset password for <strong>{email}</strong></p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100/60 leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">
                    รหัสผ่านใหม่ / New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-[#6310a3] outline-hidden bg-[#FCFCFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">
                    ยืนยันรหัสผ่านใหม่ / Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-[#6310a3] outline-hidden bg-[#FCFCFF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#6310a3] text-white rounded-xl font-bold hover:bg-[#6310a3]/90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกรหัสผ่านใหม่ / Save New Password"}
              </button>
            </form>
          )}

          {status === "success" && (
            <div className="text-center py-4 space-y-6">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-7 h-7" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-black text-on-surface text-base">ทำรายการสำเร็จเรียบร้อย!</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {mode === "resetPassword" 
                    ? "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว / Password has been reset successfully." 
                    : "ยืนยันอีเมลของคุณสำเร็จแล้ว / Your email has been verified successfully."}
                </p>
              </div>

              <div className="p-4 bg-[#6310a3]/5 rounded-2xl border border-[#6310a3]/10">
                <p className="text-xs text-[#6310a3] font-semibold">
                  ระบบกำลังนำทางท่านไปหน้าล็อกอินภายใน {countdown} วินาที...
                </p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Redirecting to login page in {countdown}s...
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-[#6310a3] text-white rounded-xl font-bold hover:bg-[#6310a3]/90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                เข้าสู่ระบบทันที / Go to Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-4 space-y-5">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-black text-on-surface text-base">เกิดข้อผิดพลาดในการทำรายการ</h3>
                <p className="text-xs text-red-600/90 font-medium px-4 leading-relaxed">
                  {errorMsg}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-surface-container-high hover:bg-outline-variant/40 text-on-surface font-bold rounded-xl transition-colors cursor-pointer text-xs"
                >
                  กลับสู่หน้าหลัก / Back to Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
