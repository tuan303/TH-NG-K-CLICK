/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import UserScreen from './components/UserScreen';
import AdminScreen from './components/AdminScreen';
import { auth, microsoftProvider, db } from './firebase';
import { signInWithPopup, User, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { BookOpen, LogOut, Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setIsAdmin(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeAdmin: () => void = () => {};
    if (user && user.email) {
      if (user.email === 'tuantm@hoangmaistarschool.edu.vn') {
        setIsAdmin(true);
        setLoading(false);
      } else {
        // Listen to admin document for this user to check admin status
        unsubscribeAdmin = onSnapshot(doc(db, 'admins', user.email.toLowerCase()), (docSnap) => {
          setIsAdmin(docSnap.exists());
          setLoading(false);
        });
      }
    }
    return () => unsubscribeAdmin();
  }, [user]);

  const handleLoginPopup = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, microsoftProvider);
      
      // Basic client-side domain verification
      if (result.user.email && !result.user.email.endsWith('@hoangmaistarschool.edu.vn')) {
         await signOut(auth);
         alert('Vui lòng sử dụng email @hoangmaistarschool.edu.vn để truy cập.');
         return; // User state will be cleaned up by onAuthStateChanged
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập MS:", error);
      if (error.code === 'auth/popup-closed-by-user') {
         console.warn("Popup closed");
      } else {
         alert(`Đăng nhập thất bại.\nChi tiết: ${error.message}`);
      }
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center gap-4 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-[#243b73]" />
      <span>Đang tải dữ liệu...</span>
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center items-center font-sans p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full flex flex-col items-center text-center">
          <div className="mb-6">
            <img src="https://hoangmaistarschool.edu.vn/storage/general/logo.svg" alt="Ngôi Sao Hoàng Mai" className="h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Đăng nhập EduTrack</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            Hệ thống quản lý tài nguyên học tập của Ngôi Sao Hoàng Mai
          </p>
          <button
            onClick={handleLoginPopup}
            className="w-full flex justify-center items-center gap-3 bg-[#23328c] hover:bg-[#1a2569] transition-colors text-white py-3 px-4 rounded-xl font-semibold shadow-sm"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-5 h-5 bg-white p-0.5" />
            Đăng nhập với Microsoft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-1 w-full flex flex-col">
        {view === 'user' ? <UserScreen user={user} /> : <AdminScreen user={user} />}
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
        {isAdmin && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

