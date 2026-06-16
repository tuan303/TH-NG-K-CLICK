import React from 'react';
import { 
  Menu, UserCircle, BarChart2, BookOpen, Trophy, 
  LayoutDashboard, BookText, Users, Settings, Edit, Trash2, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { adminSummaryCards, adminCourses } from '../data';

export default function AdminScreen() {
  return (
    <div className="flex flex-col h-full w-full bg-[#f0f4f9] relative font-sans">
      {/* Header */}
      <div className="bg-[#1554A1] text-white px-5 pt-12 pb-4 flex items-center justify-between shadow-md">
        <Menu className="w-7 h-7 cursor-pointer opacity-90" />
        <div className="font-semibold text-xl tracking-tight">Admin Dashboard</div>
        <UserCircle className="w-8 h-8 cursor-pointer opacity-90" />
      </div>

      {/* Main Content scrollable area */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        
        {/* Full width card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="text-gray-800 text-[15px] font-medium mb-1">Total Clicks</div>
            <div className="text-[38px] font-bold text-gray-900 leading-none mb-1">
              {adminSummaryCards.totalClicks}
            </div>
            <div className="text-[13px] text-gray-400 font-medium tracking-wide">All Time</div>
          </div>
          {/* Decorative graphic right side (absolute positioned visually) */}
          <div className="absolute right-8 top-[100px] flex items-end gap-1">
             <div className="w-3 mx-0.5 bg-[#1554A1] h-6 rounded-t-sm opacity-60"></div>
             <div className="w-3 mx-0.5 bg-[#1554A1] h-10 rounded-t-sm opacity-80"></div>
             <div className="w-3 mx-0.5 bg-[#1554A1] h-12 rounded-t-sm"></div>
          </div>
        </div>

        {/* Half width cards row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 pb-5 rounded-2xl shadow-sm border border-gray-100 relative">
            <div className="text-gray-800 text-sm font-medium mb-2">Active Courses</div>
            <div className="text-[28px] font-bold leading-none mb-1">{adminSummaryCards.activeCourses}</div>
            <div className="text-[12px] text-gray-400 font-medium">Currently Live</div>
            <BookOpen className="absolute right-4 top-10 text-[#1554A1] w-8 h-8 opacity-90" />
          </div>
          <div className="bg-white p-4 pb-5 rounded-2xl shadow-sm border border-gray-100 relative">
            <div className="text-gray-800 text-sm font-medium leading-tight mb-2 pr-4">Top Performing Course</div>
            <div className="text-[17px] font-bold mb-1 leading-tight tracking-tight text-gray-900">{adminSummaryCards.topCourse}</div>
            <div className="text-[12px] text-gray-400 font-medium mt-1">{adminSummaryCards.topCourseClicks} Clicks</div>
            <Trophy className="absolute right-4 bottom-5 text-[#1554A1] w-7 h-7 opacity-90" />
          </div>
        </div>

        {/* Section Title */}
        <h3 className="text-[1.4rem] font-bold text-gray-900 mb-3 tracking-tight">Course Management</h3>

        {/* Table Card */}
        <div className="bg-white rounded-[1.25rem] shadow-sm overflow-hidden border border-gray-100">
          <div className="px-4 py-4 border-b border-gray-100 bg-white">
            <h4 className="font-bold text-gray-900 text-lg">Course Management</h4>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-[#f4f6f9] text-[#1c2e4a] px-4 py-3 font-semibold text-[14px]">
            <div className="col-span-5">Tên Khóa Học</div>
            <div className="col-span-4 text-center">Tổng số Click</div>
            <div className="col-span-3 text-right">Hành động</div>
          </div>
          
          {/* Table Rows */}
          <div className="flex flex-col">
            {adminCourses.map((course) => (
              <div key={course.id} className="grid grid-cols-12 px-4 py-[14px] items-center text-[15px] border-b border-gray-100 last:border-b-0 bg-white">
                <div className="col-span-5 font-medium text-gray-800 leading-tight pr-2">{course.title}</div>
                <div className="col-span-4 text-center font-medium text-gray-800">{course.clicks}</div>
                <div className="col-span-3 flex justify-end gap-[10px]">
                  <button className="text-[#1554A1] hover:bg-blue-50 p-1.5 rounded transition-colors border border-blue-100">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-[#e13434] hover:bg-red-50 p-1.5 rounded transition-colors border border-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-1.5 px-4 py-3 bg-[#f8f9fb] border-t border-gray-100 text-gray-400">
             <button className="p-1 hover:text-gray-600 transition-colors"><ChevronsLeft className="w-4 h-4" /></button>
             <button className="p-1 hover:text-gray-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
             <button className="w-7 h-7 bg-[#1554A1] text-white rounded-[4px] text-[13px] font-semibold flex items-center justify-center mx-1">1</button>
             <button className="p-1 hover:text-gray-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
             <button className="p-1 hover:text-gray-600 transition-colors"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white flex justify-around items-center pt-3 pb-8 px-1 absolute bottom-0 w-full z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] border-t border-gray-100">
        <div className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5 relative group">
          {/* Active indicator bar */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#1554A1] rounded-b-md"></div>
          <LayoutDashboard className="w-[22px] h-[22px] text-[#1554A1] fill-[#1554A1]/20" />
          <span className="text-[10px] font-semibold text-[#1554A1]">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5">
          <BookText className="w-[22px] h-[22px] text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">Courses</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5">
          <BarChart2 className="w-[22px] h-[22px] text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">Analytics</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5">
          <Users className="w-[22px] h-[22px] text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">Users</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-[5px] cursor-pointer w-1/5">
          <Settings className="w-[22px] h-[22px] text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">Settings</span>
        </div>
      </div>
    </div>
  );
}
