import React, { useState, useEffect, useRef } from 'react';
import { updateUserPassword, logout, updateUserProfileData, uploadProfileImage } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { User, KeyRound, LogOut, ArrowLeft, PenLine, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { compressImageToWebp } from '../utils/imageUtils';

export const Profile: React.FC = () => {
  const { currentUser, userProfile, userRole, refreshProfile } = useAuth();
  
  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Profile data state
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setAvatarUrl(userProfile.avatarUrl || '');
      setPreviewUrl(userProfile.avatarUrl || '');
    }
  }, [userProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setProfileLoading(true);

    try {
      if (!currentUser) throw new Error("No user logged in");
      
      let finalAvatarUrl = avatarUrl;
      
      if (selectedFile) {
        setProfileMessage('กำลังบีบอัดภาพและอัปโหลด...');
        const compressedBlob = await compressImageToWebp(selectedFile, 400);
        finalAvatarUrl = await uploadProfileImage(currentUser.uid, compressedBlob);
        setAvatarUrl(finalAvatarUrl);
      }
      
      setProfileMessage('กำลังบันทึกข้อมูล...');
      await updateUserProfileData(currentUser.uid, name, finalAvatarUrl);
      await refreshProfile();
      setProfileMessage('อัปเดตข้อมูลส่วนตัวสำเร็จ');
      setSelectedFile(null); // Clear selected file after success
    } catch (err: any) {
      setProfileError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว');
      setProfileMessage('');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdMessage('');

    if (newPassword !== confirmPassword) {
      return setPwdError('รหัสผ่านไม่ตรงกัน');
    }
    
    setPwdLoading(true);
    try {
      await updateUserPassword(newPassword);
      setPwdMessage('อัปเดตรหัสผ่านสำเร็จ');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPwdError('กรุณาล็อกเอาต์แล้วเข้าสู่ระบบใหม่อีกครั้ง ก่อนทำการเปลี่ยนรหัสผ่าน');
      } else {
        setPwdError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface relative p-4 py-10 sm:px-6 lg:px-8">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-100/70 rounded-full blur-[140px] opacity-70"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-stone-200/60 rounded-full blur-[160px] opacity-65"></div>
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[180px] opacity-50"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft size={18} className="mr-2" /> กลับหน้าหลัก
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-outline-variant/50">
          <div className="px-6 py-5 bg-primary/5 flex justify-between items-center border-b border-outline-variant/30">
            <div>
              <h3 className="text-xl font-display font-black text-on-surface">โปรไฟล์ผู้ใช้งาน</h3>
              <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">ข้อมูลบัญชีและการจัดการรหัสผ่าน</p>
            </div>
            <button
              onClick={() => logout()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut size={16} className="mr-1.5" />
              ออกจากระบบ
            </button>
          </div>
          
          <div className="px-6 py-6 sm:p-8">
            <div className="flex items-center mb-8 bg-[#FCFCFF] border border-outline-variant/50 p-5 rounded-2xl">
              <div 
                className="flex-shrink-0 bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center text-primary overflow-hidden border border-primary/20 relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-bold">เปลี่ยนรูป</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="ml-5">
                <h4 className="text-xl font-bold text-on-surface">{userProfile?.name || currentUser?.email}</h4>
                <p className="text-sm text-on-surface-variant mb-1">{currentUser?.email}</p>
                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                  {userRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งานทั่วไป (User)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Profile Editing Form */}
              <div>
                <h4 className="text-md font-bold text-on-surface flex items-center mb-6">
                  <PenLine size={20} className="mr-2 text-primary" />
                  แก้ไขข้อมูลส่วนตัว
                </h4>
                
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  {profileError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                      {profileError}
                    </div>
                  )}
                  {profileMessage && (
                    <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100 font-medium">
                      {profileMessage}
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant ml-1">ชื่อ-นามสกุล</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                        placeholder="ชื่อของคุณ"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full py-3 mt-2 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                  >
                    {profileLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลส่วนตัว'}
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div>
                <h4 className="text-md font-bold text-on-surface flex items-center mb-6">
                  <KeyRound size={20} className="mr-2 text-primary" />
                  เปลี่ยนรหัสผ่าน
                </h4>
                
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  {pwdError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                      {pwdError}
                    </div>
                  )}
                  {pwdMessage && (
                    <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100 font-medium">
                      {pwdMessage}
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant ml-1">รหัสผ่านใหม่</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant ml-1">ยืนยันรหัสผ่านใหม่</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="w-full py-3 mt-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                  >
                    {pwdLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
