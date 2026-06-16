/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import UserScreen from './components/UserScreen';
import AdminScreen from './components/AdminScreen';
import { auth, microsoftProvider } from './firebase';
import { signInWithPopup, User, signOut, onAuthStateChanged } from 'firebase/auth';
import { BookOpen, LogOut } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, microsoftProvider);
    } catch (error: any) {
      console.error("Lỗi đăng nhập MS:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert(`Lỗi: Tên miền chưa được cấp phép.\nVui lòng truy cập Firebase Console -> Authentication -> Settings -> Authorized domains.\nThêm tên miền sau vào danh sách: ${window.location.hostname}`);
      } else {
        alert("Đăng nhập thất bại. Vui lòng kiểm tra lại cấu hình SSO.");
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center items-center font-sans p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full flex flex-col items-center text-center">
          <div className="bg-[#243b73] p-4 rounded-2xl mb-6 shadow-md">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Đăng nhập EduTrack</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            Hệ thống quản lý tài nguyên học tập của Ngôi Sao Hoàng Mai
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex justify-center items-center gap-3 bg-[#2F2F2F] hover:bg-[#1A1A1A] transition-colors text-white py-3 px-4 rounded-xl font-semibold shadow-sm"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-5 h-5 bg-white p-0.5" />
            Đăng nhập với Microsoft 365
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-1 w-full flex flex-col">
        {view === 'user' ? <UserScreen /> : <AdminScreen />}
      </div>

      {/* View Controllers (Floating toggle) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[100]">
        <button 
          onClick={() => signOut(auth)} 
          className="px-4 py-2 rounded-xl font-medium text-sm shadow-lg transition-all border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
        <button 
          onClick={() => setView('user')} 
          className={`px-4 py-2 rounded-xl font-medium text-sm shadow-lg transition-all border ${view === 'user' ? 'bg-[#243b73] text-white border-[#243b73] scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
        >
          🎓 User View
        </button>
        <button 
          onClick={() => setView('admin')} 
          className={`px-4 py-2 rounded-xl font-medium text-sm shadow-lg transition-all border ${view === 'admin' ? 'bg-[#1554A1] text-white border-[#1554A1] scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
        >
          ⚙️ Admin View
        </button>
      </div>
    </div>
  );
}

