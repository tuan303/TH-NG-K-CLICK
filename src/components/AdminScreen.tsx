import React, { useState, useEffect } from 'react';
import { 
  Menu, UserCircle, BarChart2, BookOpen, Trophy, 
  LayoutDashboard, BookText, Users, Settings, Edit, Trash2, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, Bell
} from 'lucide-react';
import CourseManagement from './CourseManagement';
import AdminUsers from './AdminUsers';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Course } from '../types';

interface AdminScreenProps {
  user: User;
}

export default function AdminScreen({ user }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'users'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState<{email: string, displayName: string, count: number}[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('stt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTopUsers = async () => {
      const userClicks: Record<string, {displayName: string, count: number}> = {};
      
      const promises = courses.map(async (course) => {
        try {
          const historySnapshot = await getDocs(collection(db, 'courses', course.id, 'clickHistory'));
          historySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.email) {
              if (!userClicks[data.email]) {
                userClicks[data.email] = { displayName: data.displayName || data.email, count: 0 };
              }
              userClicks[data.email].count += 1;
            }
          });
        } catch (error) {
          console.error("Error fetching clickHistory for course", course.id, error);
        }
      });
      
      await Promise.all(promises);
      
      const sortedUsers = Object.entries(userClicks)
        .map(([email, data]) => ({ email, displayName: data.displayName, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // top 5 users
        
      setTopUsers(sortedUsers);
    };
    
    if (courses.length > 0) {
      fetchTopUsers();
    }
  }, [courses]);

  const totalClicks = courses.reduce((acc, course) => acc + (course.clicks || 0), 0);
  const activeCourses = courses.length;
  const topCourseObj = courses.reduce((prev, current) => {
    if (!prev) return current;
    return ((prev.clicks || 0) > (current.clicks || 0)) ? prev : current;
  }, null as Course | null);
  
  const topCourseTitle = topCourseObj && topCourseObj.clicks > 0 ? topCourseObj.title : 'Chưa có dữ liệu';
  const topCourseClicks = topCourseObj ? (topCourseObj.clicks || 0) : 0;

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#f0f4f9] font-sans">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex flex-col w-64 bg-[#1554A1] text-white shadow-xl z-20 shrink-0">
        <div className="flex items-center px-6 py-6 border-b border-blue-800 bg-white">
          <img src="https://hoangmaistarschool.edu.vn/thongtin/LogoNSHM.png" alt="Ngôi Sao Hoàng Mai" className="w-full object-contain max-h-[60px]" />
        </div>
        <div className="flex-1 py-6 flex flex-col gap-2 px-4">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-white/10 shadow-inner' : 'text-blue-200 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-[15px]">Dashboard</span>
          </div>
          <div 
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${activeTab === 'courses' ? 'bg-white/10 shadow-inner' : 'text-blue-200 hover:bg-white/5 hover:text-white'}`}
          >
            <BookText className="w-5 h-5" />
            <span className="font-medium text-[15px]">Courses</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-blue-200 hover:text-white">
            <BarChart2 className="w-5 h-5" />
            <span className="font-medium text-[15px]">Analytics</span>
          </div>
          <div 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${activeTab === 'users' ? 'bg-white/10 shadow-inner' : 'text-blue-200 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium text-[15px]">Users</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-blue-200 hover:text-white">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-[15px]">Settings</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1554A1] md:bg-white md:text-gray-800 text-white px-5 md:px-8 py-4 pt-12 md:pt-4 flex items-center justify-between md:border-b border-gray-200 shadow-md md:shadow-none shrink-0 z-10">
          {/* Mobile Menu Icon */}
          <Menu className="w-7 h-7 cursor-pointer opacity-90 md:hidden" />
          
          {/* Dashboard Title Mobile */}
          <div className="font-semibold text-xl tracking-tight md:hidden">Admin Dashboard</div>
          
          {/* Dashboard Title & Search Desktop */}
          <div className="hidden md:flex items-center flex-1 gap-6">
            <h1 className="font-bold text-2xl tracking-tight text-gray-900">
                {activeTab === 'dashboard' ? 'Dashboard Overview' : 'Course Management'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6 text-gray-500 cursor-pointer hidden md:block hover:text-gray-700 transition" />
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="hidden md:block text-right">
                <div className="font-semibold text-sm leading-none">{user.displayName || 'Admin'}</div>
                <div className="text-xs text-gray-500 font-medium">Administrator</div>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full text-[#1554A1] font-bold fill-current bg-blue-100 flex items-center justify-center text-sm">
                    {(user.displayName || user.email || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 py-5 md:px-8 md:py-8 pb-28 md:pb-8 flex flex-col">
          
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Full width card (stretches on mobile, col-span-1 on desktop) */}
                <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden md:col-span-1">
                  <div className="relative z-10">
                    <div className="text-gray-500 text-[15px] font-medium mb-1">Total Clicks</div>
                    <div className="text-[38px] lg:text-[42px] font-bold text-gray-900 leading-none mb-1">
                      {loading ? '...' : totalClicks}
                    </div>
                    <div className="text-[13px] text-[#1554A1] font-medium tracking-wide">All Time +12%</div>
                  </div>
                  {/* Decorative graphic */}
                  <div className="absolute right-6 -bottom-4 flex items-end gap-1.5 opacity-20 md:opacity-10">
                    <div className="w-4 bg-[#1554A1] h-12 rounded-t-md"></div>
                    <div className="w-4 bg-[#1554A1] h-16 rounded-t-md"></div>
                    <div className="w-4 bg-[#1554A1] h-20 rounded-t-md"></div>
                    <div className="w-4 bg-[#1554A1] h-24 rounded-t-md"></div>
                  </div>
                </div>

                {/* Other Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-2 gap-4">
                  <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-gray-500 text-sm font-medium">Active Courses</div>
                      <div className="p-2 bg-blue-50 rounded-lg"><BookOpen className="text-[#1554A1] w-5 h-5" /></div>
                    </div>
                    <div className="text-[28px] md:text-3xl font-bold leading-none mb-1 text-gray-900">{loading ? '...' : activeCourses}</div>
                    <div className="text-[12px] text-green-600 font-medium">+2 this week</div>
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-gray-500 text-sm font-medium leading-tight pr-2">Top Course</div>
                      <div className="p-2 bg-amber-50 rounded-lg"><Trophy className="text-amber-500 w-5 h-5" /></div>
                    </div>
                    <div className="text-[16px] md:text-lg font-bold mb-1 leading-tight tracking-tight text-gray-900 line-clamp-1">{loading ? '...' : topCourseTitle}</div>
                    <div className="text-[12px] text-gray-500 font-medium">{loading ? '...' : topCourseClicks} Clicks</div>
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center sm:col-span-2 md:col-span-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-gray-500 text-sm font-medium leading-tight pr-2">Top User View</div>
                      <div className="p-2 bg-purple-50 rounded-lg"><Users className="text-purple-500 w-5 h-5" /></div>
                    </div>
                    <div className="text-[16px] md:text-lg font-bold mb-1 leading-tight tracking-tight text-gray-900 line-clamp-1">
                      {topUsers.length > 0 ? topUsers[0].displayName : 'Chưa có'}
                    </div>
                    <div className="text-[12px] text-gray-500 font-medium">
                      {topUsers.length > 0 ? `${topUsers[0].count} Clicks tổng` : '0 Clicks'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center text-gray-500 italic mt-10">Select "Courses" tab to manage courses.</div>
            </>
          )}

          {activeTab === 'courses' && (
            <CourseManagement />
          )}

          {activeTab === 'users' && (
            <AdminUsers />
          )}

        </div>

        {/* Mobile Bottom Navigation (hidden on desktop) */}
        <div className="md:hidden bg-white flex justify-around items-center pt-3 pb-8 px-1 absolute bottom-0 w-full z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] border-t border-gray-100">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5 relative group"
          >
            {activeTab === 'dashboard' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#1554A1] rounded-b-md"></div>}
            <LayoutDashboard className={`w-[22px] h-[22px] ${activeTab === 'dashboard' ? 'text-[#1554A1] fill-[#1554A1]/20' : 'text-gray-400'}`} />
            <span className={`text-[10px] ${activeTab === 'dashboard' ? 'font-semibold text-[#1554A1]' : 'font-medium text-gray-400'}`}>Dashboard</span>
          </div>
          <div 
            onClick={() => setActiveTab('courses')}
            className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5 relative"
          >
            {activeTab === 'courses' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#1554A1] rounded-b-md"></div>}
            <BookText className={`w-[22px] h-[22px] ${activeTab === 'courses' ? 'text-[#1554A1] fill-[#1554A1]/20' : 'text-gray-400'}`} />
            <span className={`text-[10px] ${activeTab === 'courses' ? 'font-semibold text-[#1554A1]' : 'font-medium text-gray-400'}`}>Courses</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5">
            <BarChart2 className="w-[22px] h-[22px] text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">Analytics</span>
          </div>
          <div 
            onClick={() => setActiveTab('users')}
            className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5 relative"
          >
            {activeTab === 'users' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#1554A1] rounded-b-md"></div>}
            <Users className={`w-[22px] h-[22px] ${activeTab === 'users' ? 'text-[#1554A1] fill-[#1554A1]/20' : 'text-gray-400'}`} />
            <span className={`text-[10px] ${activeTab === 'users' ? 'font-semibold text-[#1554A1]' : 'font-medium text-gray-400'}`}>Users</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5">
            <Settings className="w-[22px] h-[22px] text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">Settings</span>
          </div>
        </div>

      </div>
    </div>
  );
}
