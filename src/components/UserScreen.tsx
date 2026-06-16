import React, { useState, useEffect } from 'react';
import { BookOpen, Book, Folder, Bell, Settings } from 'lucide-react';
import { userCourses } from '../data';

export default function UserScreen() {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const handleMicrosoftLogin = async () => {
    setIsLoadingAuth(true);
    try {
      // 1. Fetch OAuth URL
      const response = await fetch('/api/auth/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      // 2. Open popup
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups to sign in with Microsoft.');
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow from same origin and specific run.app origins
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
         return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        // Authenticated! You can store tokens from event.data.payload here
        setIsLoggedin(true);
        setIsLoadingAuth(false);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        console.error('Auth error from popup:', event.data.error);
        setIsLoadingAuth(false);
        alert('Authentication failed.');
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isLoggedin) {
    return (
      <div className="flex flex-col h-full w-full bg-[#F3F4F6] relative items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full flex flex-col items-center max-w-sm border border-gray-100">
           <img 
              src="https://hoangmaistarschool.edu.vn/thongtin/LogoNSHM.png" 
              alt="School Logo" 
              className="h-[5rem] mb-6 object-contain"
            />
            <h2 className="text-[1.3rem] font-bold text-[#1554A1] mb-2 tracking-tight">Hệ thống học tập</h2>
            <p className="text-gray-500 text-[13px] mb-8 text-center font-medium px-4">
              Vui lòng đăng nhập bằng tài khoản Microsoft 365 của trường để tiếp tục.
            </p>
            
            <button 
              onClick={handleMicrosoftLogin}
              disabled={isLoadingAuth}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-3.5 rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isLoadingAuth ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-[#243b73] rounded-full animate-spin"></div>
               ) : (
                  <svg className="w-[22px] h-[22px]" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 11H0V0H11V11Z" fill="#F25022"/>
                      <path d="M23 11H12V0H23V11Z" fill="#7FBA00"/>
                      <path d="M11 23H0V12H11V23Z" fill="#00A4EF"/>
                      <path d="M23 23H12V12H23V23Z" fill="#FFB900"/>
                  </svg>
               )}
               <span className="text-[14.5px]">Đăng nhập Microsoft 365</span>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#F3F4F6] relative">
      {/* Header */}
      <div className="bg-[#243b73] text-white px-5 border-b border-blue-900 pb-4 pt-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="https://hoangmaistarschool.edu.vn/thongtin/LogoNSHM.png" 
              alt="School Logo" 
              className="h-9 object-contain bg-white rounded p-1"
            />
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-full border-[3px] border-[#243b73] overflow-hidden bg-gray-200 shadow-sm shadow-black/20 ring-2 ring-white">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80" 
                alt="Teacher" 
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white text-[#243b73] text-[9px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border border-gray-200 shadow-sm leading-none pt-[1px]">
              GV
            </div>
          </div>
        </div>
      </div>

      {/* Main Content scrollable area */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        <h2 className="text-[1.7rem] font-bold text-[#1a2d5c] mb-6 tracking-tight">Danh sách khóa học</h2>
        
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-[#243b73] text-white p-3.5 font-semibold text-[15px]">
            <div className="col-span-2 text-center flex items-center pl-1">STT</div>
            <div className="col-span-6 flex items-center pl-2">Tên Khóa Học</div>
            <div className="col-span-4 text-center tracking-tight flex items-center justify-center">Link Khóa Học</div>
          </div>
          
          {/* Table Rows */}
          <div className="flex flex-col">
            {userCourses.map((course, index) => (
              <div 
                key={course.id} 
                className={`grid grid-cols-12 px-3.5 py-4 items-center text-[15px] border-b border-gray-100/50 last:border-b-0 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f6f9]'}`}
              >
                <div className="col-span-2 text-center font-medium text-gray-800 text-base">{course.id}</div>
                <div className="col-span-6 pr-3 font-medium text-[#1f2937] leading-snug pl-2">{course.title}</div>
                <div className="col-span-4 text-center flex justify-center">
                  <button className="bg-[#243b73] hover:bg-[#1a2b53] transition-colors text-white text-[13px] px-3 py-2.5 rounded-lg font-semibold whitespace-nowrap shadow-sm shadow-[#243b73]/20 h-auto leading-tight w-full max-w-[110px]">
                    Truy cập ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-[#fafafa] border-t border-gray-200 flex justify-around items-center pt-3 pb-8 px-2 absolute bottom-0 w-full z-10">
        <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-1/4">
          <Book className="w-[26px] h-[26px] text-[#243b73] fill-[#243b73]" />
          <span className="text-[11px] font-medium text-[#243b73] mt-[2px]">Khóa học</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-1/4">
          <Folder className="w-6 h-6 text-gray-400" />
          <span className="text-[11px] font-medium text-gray-500 mt-[2px]">Tài nguyên</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-1/4">
          <Bell className="w-6 h-6 text-gray-400" />
          <span className="text-[11px] font-medium text-gray-500 mt-[2px]">Thông báo</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-1/4">
          <Settings className="w-6 h-6 text-gray-400" />
          <span className="text-[11px] font-medium text-gray-500 mt-[2px]">Cài đặt</span>
        </div>
      </div>
    </div>
  );
}
