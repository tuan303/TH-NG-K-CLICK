import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, UserPlus, Shield } from 'lucide-react';

export default function AdminUsers() {
  const [admins, setAdmins] = useState<{email: string}[]>([]);
  const [newEmail, setNewEmail] = useState('');
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'admins'), (snapshot) => {
      const adminData = snapshot.docs.map(doc => ({
        email: doc.id
      }));
      setAdmins(adminData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      await setDoc(doc(db, 'admins', newEmail.trim().toLowerCase()), {
        addedAt: new Date()
      });
      setNewEmail('');
    } catch (error: any) {
      alert("Lỗi thêm admin: " + error.message);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (email === 'tuantm@hoangmaistarschool.edu.vn') {
      alert("Không thể xóa quản trị viên gốc.");
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa quyền quản trị của ${email}?`)) {
      try {
        await deleteDoc(doc(db, 'admins', email));
      } catch (error: any) {
        alert("Lỗi xóa admin: " + error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1554A1]" />
          Quản lý quản trị viên
        </h2>
        <p className="text-gray-500 text-sm mt-1">Danh sách người dùng có quyền truy cập trang quản trị</p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleAddAdmin} className="flex gap-3 mb-8">
          <input 
            type="email" 
            placeholder="Nhập email hoangmaistarschool..."
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1554A1]"
            required
          />
          <button type="submit" className="bg-[#1554A1] text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-[#104382] transition-colors font-medium">
            <UserPlus className="w-4 h-4" />
            Thêm
          </button>
        </form>

        <div className="flex flex-col border border-gray-100 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-semibold text-gray-700 text-sm">
            Danh sách Admin
          </div>
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-white">
            <span className="text-gray-800 font-medium">tuantm@hoangmaistarschool.edu.vn (Gốc)</span>
          </div>
          {admins.map(admin => (
            admin.email !== 'tuantm@hoangmaistarschool.edu.vn' && (
              <div key={admin.email} className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                <span className="text-gray-800 font-medium">{admin.email}</span>
                <button 
                  onClick={() => handleRemoveAdmin(admin.email)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa quyền quản trị"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          ))}
          {admins.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              Chưa có quản trị viên nào khác được thêm.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
