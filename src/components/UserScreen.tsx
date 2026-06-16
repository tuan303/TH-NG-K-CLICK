import React, { useState, useEffect } from 'react';
import { BookOpen, Book, Folder, Bell, Settings, Search, Menu } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { Course } from '../types';

export default function UserScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCourses, setNewCourses] = useState<Course[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('stt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
      setLoading(false);

      // Notification logic
      const storedCourseIdsStr = localStorage.getItem('seenCourseIds');
      let storedCourseIds: string[] = storedCourseIdsStr ? JSON.parse(storedCourseIdsStr) : [];
      
      if (storedCourseIds.length === 0 && coursesData.length > 0) {
        // First load, save all as seen
        storedCourseIds = coursesData.map(c => c.id);
        localStorage.setItem('seenCourseIds', JSON.stringify(storedCourseIds));
      } else {
        const unseen = coursesData.filter(c => !storedCourseIds.includes(c.id));
        setNewCourses(unseen);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAccessCourse = async (course: Course) => {
    // Open link
    if (course.link) {
      window.open(course.link, '_blank', 'noopener,noreferrer');
    }
    
      // Increment clicks
    try {
      const courseRef = doc(db, 'courses', course.id);
      await updateDoc(courseRef, {
        clicks: increment(1)
      });
    } catch (error) {
      console.error("Error incrementing click:", error);
    }
  };

  const handleOpenNotification = () => {
    setIsNotificationOpen(true);
    if (newCourses.length > 0) {
      const storedCourseIdsStr = localStorage.getItem('seenCourseIds');
      const storedCourseIds: string[] = storedCourseIdsStr ? JSON.parse(storedCourseIdsStr) : [];
      const newIds = newCourses.map(c => c.id);
      localStorage.setItem('seenCourseIds', JSON.stringify([...storedCourseIds, ...newIds]));
    }
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
    setNewCourses([]);
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#F3F4F6]">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex flex-col w-64 bg-[#243b73] text-white shadow-xl z-20">
        <div className="flex items-center px-6 py-6 border-b border-blue-900 bg-white">
          <img src="https://hoangmaistarschool.edu.vn/thongtin/LogoNSHM.png" alt="Ngôi Sao Hoàng Mai" className="w-full object-contain max-h-[60px]" />
        </div>
        <div className="flex-1 py-6 flex flex-col gap-2 px-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl cursor-pointer">
            <Book className="w-5 h-5" />
            <span className="font-medium text-[15px]">Khóa học</span>
          </div>
          <div 
            onClick={() => window.open('https://hoangmaistarschool.sharepoint.com/:f:/s/homer/IgC35Mlx_StrSaJHLqpsg-FqAVVi-_OdHZ2q9ckZ66WCW9k?e=jbKUmu', '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-blue-200 hover:text-white"
          >
            <Folder className="w-5 h-5" />
            <span className="font-medium text-[15px]">Tài nguyên</span>
          </div>
          <div 
            onClick={handleOpenNotification}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-blue-200 hover:text-white relative"
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {newCourses.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[16px] text-center">
                  {newCourses.length}
                </span>
              )}
            </div>
            <span className="font-medium text-[15px]">Thông báo</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex w-full flex-col flex-1 h-full relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#243b73] md:bg-white text-white md:text-gray-900 px-5 md:px-8 border-b border-blue-900 md:border-gray-200 pb-4 pt-12 md:pt-4 md:pb-4 z-10 shrink-0">
          <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            
            {/* Mobile Title (hidden on desktop) */}
            <div className="flex items-center md:hidden bg-white px-2 py-1 rounded">
              <img src="https://hoangmaistarschool.edu.vn/thongtin/LogoNSHM.png" alt="Ngôi Sao Hoàng Mai" className="h-8 object-contain" />
            </div>

            {/* Desktop Dashboard Title & Search */}
            <div className="hidden md:flex items-center gap-6 flex-1">
              <h1 className="font-bold text-2xl tracking-tight">Trang chủ</h1>
              <div className="relative max-w-md w-full ml-4">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm khóa học..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-[#243b73] outline-none text-sm"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="font-semibold text-sm">Nguyễn Văn A</div>
                <div className="text-xs text-gray-500 font-medium">Giáo viên</div>
              </div>
              <div className="relative cursor-pointer">
                <div className="w-11 h-11 md:w-10 md:h-10 rounded-full border-[3px] md:border-2 border-[#243b73] md:border-gray-200 overflow-hidden bg-gray-200 shadow-sm shadow-black/20 md:shadow-none ring-2 md:ring-0 ring-white">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80" 
                    alt="Teacher" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="md:hidden absolute -bottom-1 -right-1 bg-white text-[#243b73] text-[9px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border border-gray-200 shadow-sm leading-none pt-[1px]">
                  GV
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-8 w-full max-w-7xl mx-auto">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[1.7rem] md:text-2xl font-bold text-[#1a2d5c] tracking-tight">Danh sách khóa học</h2>
            <div className="hidden md:flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Lọc
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-[1.25rem] md:rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[#243b73] md:bg-gray-50 text-white md:text-gray-600 px-4 md:px-6 py-3.5 md:py-4 font-semibold text-[15px] md:text-sm md:border-b border-gray-200">
              <div className="col-span-1 text-center md:text-left flex items-center pl-1 md:pl-0">STT</div>
              <div className="col-span-5 flex items-center pl-2 md:pl-0">Tên Khóa Học</div>
              <div className="col-span-3 items-center hidden md:flex">Giảng viên / Người chia sẻ</div>
              <div className="col-span-6 md:col-span-3 text-center md:text-right tracking-tight flex items-center justify-end md:justify-end">Hành động</div>
            </div>
            
            {/* Table Rows */}
            <div className="flex flex-col">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
              ) : courses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Chưa có khóa học nào.</div>
              ) : (
                courses.map((course, index) => (
                  <div 
                    key={course.id} 
                    className={`grid grid-cols-12 px-4 md:px-6 py-4 items-center text-[15px] border-b border-gray-100 md:border-gray-100/70 last:border-b-0 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f6f9] md:bg-white'} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="col-span-1 text-center md:text-left font-medium text-gray-800 text-base md:text-sm">{course.stt}</div>
                    <div className="col-span-5 pr-3 font-medium text-[#1f2937] leading-snug pl-2 md:pl-0 relative group">
                      {course.title}
                      <div className="md:hidden mt-0.5 text-xs text-gray-500 font-normal truncate max-w-full leading-tight">
                         {course.instructor}
                      </div>
                    </div>
                    <div className="col-span-3 font-normal text-gray-600 md:text-sm truncate hidden md:flex items-center" title={course.instructor}>
                      {course.instructor || '-'}
                    </div>
                    <div className="col-span-6 md:col-span-3 text-right flex justify-end">
                      <button 
                        onClick={() => handleAccessCourse(course)}
                        className="bg-[#243b73] hover:bg-[#1a2b53] transition-colors text-white text-[13px] md:text-sm px-4 md:px-5 py-2.5 md:py-2 rounded-lg font-semibold whitespace-nowrap shadow-sm shadow-[#243b73]/20 h-auto leading-tight md:w-auto"
                      >
                        Truy cập ngay
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation (hidden on desktop) */}
        <div className="md:hidden bg-[#fafafa] border-t border-gray-200 flex justify-around items-center pt-3 pb-8 px-2 absolute bottom-0 w-full z-10">
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-1/3">
            <Book className="w-[26px] h-[26px] text-[#243b73] fill-[#243b73]" />
            <span className="text-[11px] font-medium text-[#243b73] mt-[2px]">Khóa học</span>
          </div>
          <div 
            onClick={() => window.open('https://hoangmaistarschool.sharepoint.com/:f:/s/homer/IgC35Mlx_StrSaJHLqpsg-FqAVVi-_OdHZ2q9ckZ66WCW9k?e=jbKUmu', '_blank', 'noopener,noreferrer')}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer w-1/3"
          >
            <Folder className="w-6 h-6 text-gray-400" />
            <span className="text-[11px] font-medium text-gray-500 mt-[2px]">Tài nguyên</span>
          </div>
          <div 
             onClick={handleOpenNotification}
             className="flex flex-col items-center justify-center gap-1 cursor-pointer w-1/3 relative"
          >
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-400" />
              {newCourses.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[14px] text-center">
                  {newCourses.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-gray-500 mt-[2px]">Thông báo</span>
          </div>
        </div>
        
      </div>

      {/* Notification Modal */}
      {isNotificationOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#243b73]" /> Thông báo mới
              </h3>
              <button onClick={closeNotification} className="text-gray-400 hover:text-gray-600 p-1">
                <Menu className="w-5 h-5 opacity-0 hidden" /> {/* spacer */}
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-0 flex-1 overflow-y-auto">
              {newCourses.length > 0 ? (
                <div className="flex flex-col">
                  {newCourses.map((course) => (
                    <div key={course.id} className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full mt-1 shrink-0">
                          <BookOpen className="w-4 h-4 text-[#243b73]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 font-medium">Khóa học mới: <span className="font-bold text-[#1a2d5c]">{course.title}</span></p>
                          {course.instructor && <p className="text-xs text-gray-500 mt-1">Giảng viên: {course.instructor}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
                  <Bell className="w-10 h-10 text-gray-300" />
                  <p>Không có thông báo khóa học mới nào.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={closeNotification}
                className="w-full py-2.5 bg-[#243b73] text-white font-medium rounded-lg hover:bg-[#1a2d5c] transition-colors"
               >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
