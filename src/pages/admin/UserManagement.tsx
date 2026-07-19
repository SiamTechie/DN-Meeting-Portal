import React, { useEffect, useState } from 'react';
import { createNewUserAsAdmin } from '../../services/authService';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ShieldAlert, Users, UserPlus } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersData: UserData[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserData);
      });
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsCreating(true);

    try {
      await createNewUserAsAdmin(newEmail, newPassword);
      setSuccess(`สร้างผู้ใช้งาน ${newEmail} เรียบร้อยแล้ว`);
      setNewEmail('');
      setNewPassword('');
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ShieldAlert className="mr-2 text-indigo-600" />
          ระบบจัดการผู้ใช้งาน (Admin Dashboard)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Create User */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserPlus className="mr-2 text-gray-400" size={20} />
              เพิ่มผู้ใช้งานใหม่
            </h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสผ่านเริ่มต้น</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isCreating ? 'กำลังสร้าง...' : 'สร้างผู้ใช้งาน'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="mr-2 text-gray-400" size={20} />
                รายชื่อผู้ใช้งานทั้งหมดในระบบ
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <li className="p-8 text-center text-gray-500">ยังไม่มีข้อมูลผู้ใช้</li>
                ) : (
                  users.map((user) => (
                    <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-indigo-600 truncate">{user.email}</div>
                            <div className="text-sm text-gray-500">UID: {user.id}</div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
