import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Search, Plus, Upload, X, Download, FileSpreadsheet, List, FileDown } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Course } from '../types';
import * as XLSX from 'xlsx';

interface ClickRecord {
  id: string;
  email: string;
  displayName: string;
  clickedAt: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Click History Modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCourseForHistory, setSelectedCourseForHistory] = useState<Course | null>(null);
  const [clickHistory, setClickHistory] = useState<ClickRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    stt: '',
    title: '',
    instructor: '',
    link: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lắng nghe sự thay đổi từ Firestore
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

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        "STT": 1,
        "Tên khóa học": "Khóa học mẫu 1 (Vui lòng xóa dòng này khi nhập)",
        "Giảng viên/Người chia sẻ": "Nguyễn Văn A",
        "Link khóa học": "https://link-khoa-hoc-1.com"
      },
      {
        "STT": 2,
        "Tên khóa học": "Khóa học mẫu 2",
        "Giảng viên/Người chia sẻ": "Trần Thị B",
        "Link khóa học": "https://link-khoa-hoc-2.com"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Khoa_Hoc");
    XLSX.writeFile(wb, "Mau_nhap_lieu_khoa_hoc.xlsx");
  };

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        stt: course.stt.toString(),
        title: course.title,
        instructor: course.instructor || '',
        link: course.link
      });
    } else {
      setEditingCourse(null);
      setFormData({
        stt: (courses.length + 1).toString(),
        title: '',
        instructor: '',
        link: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseData = {
        stt: parseInt(formData.stt) || 0,
        title: formData.title,
        instructor: formData.instructor,
        link: formData.link,
        clicks: editingCourse ? editingCourse.clicks : 0
      };

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
      } else {
        await addDoc(collection(db, 'courses'), courseData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving course: ", error);
      alert("Có lỗi xảy ra khi lưu khóa học!");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await deleteDoc(doc(db, 'courses', id));
      } catch (error) {
        console.error("Error deleting course: ", error);
        alert("Có lỗi xảy ra khi xóa khóa học!");
      }
    }
  };

  const handleOpenHistory = async (course: Course) => {
    setSelectedCourseForHistory(course);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const historySnapshot = await getDocs(
        query(collection(db, 'courses', course.id, 'clickHistory'), orderBy('clickedAt', 'desc'))
      );
      const historyData = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClickRecord[];
      setClickHistory(historyData);
    } catch (error) {
      console.error("Error fetching click history: ", error);
      alert("Không thể tải danh sách click.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExportHistory = () => {
    if (clickHistory.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(
      clickHistory.map((rec, index) => ({
        "STT": index + 1,
        "Email": rec.email,
        "Tên hiển thị": rec.displayName,
        "Thời gian click": new Date(rec.clickedAt).toLocaleString('vi-VN')
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lich_Su_Click");
    XLSX.writeFile(wb, `ClickHistory_${selectedCourseForHistory?.title.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        try {
            // Hiển thị loading state nếu cần
            for (const row of data as any[]) {
                // Mapping columns base on their names or positions
                // Giả định file excel có các cột: STT, "Tên khóa học", "Giảng viên/Người chia sẻ", "Link khóa học"
                const keys = Object.keys(row);
                
                const stt = row[keys.find(k => k.toLowerCase().includes('stt')) || ''] || 0;
                const title = row[keys.find(k => k.toLowerCase().includes('tên')) || ''] || '';
                const instructor = row[keys.find(k => k.toLowerCase().includes('giảng viên') || k.toLowerCase().includes('chia sẻ')) || ''] || '';
                const link = row[keys.find(k => k.toLowerCase().includes('link')) || ''] || '';

                if (title) {
                     await addDoc(collection(db, 'courses'), {
                        stt: parseInt(stt) || 0,
                        title: title,
                        instructor: instructor,
                        link: link,
                        clicks: 0
                    });
                }
            }
            alert("Import Excel thành công!");
            setIsImportModalOpen(false);
        } catch (error) {
            console.error("Error importing excel:", error);
            alert("Có lỗi xảy ra khi import!");
        }
        if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl md:text-xl font-bold text-gray-900 tracking-tight">Quản lý Khóa học</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1554A1] outline-none text-sm shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Excel</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#1554A1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex-1 flex flex-col">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 bg-gray-50 text-gray-500 px-6 py-4 font-semibold text-sm border-b border-gray-200 uppercase tracking-wider sticky top-0 shrink-0 z-10">
          <div className="col-span-1 text-center">STT</div>
          <div className="col-span-4">Tên Khóa Học</div>
          <div className="col-span-3">Giảng viên / Người chia sẻ</div>
          <div className="col-span-2 text-center">Tổng Click</div>
          <div className="col-span-2 text-right">Hành động</div>
        </div>
        <div className="md:hidden grid grid-cols-12 bg-[#f4f6f9] text-[#1c2e4a] px-4 py-3 font-semibold text-[14px]">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Khóa Học</div>
          <div className="col-span-3 text-center">Click</div>
          <div className="col-span-3 text-right"></div>
        </div>
        
        {/* Table Rows (Scrollable) */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : filteredCourses.length === 0 ? (
             <div className="p-8 text-center text-gray-500">Không tìm thấy khóa học nào.</div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="grid grid-cols-12 px-4 md:px-6 py-[14px] md:py-4 items-center text-[15px] border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50 transition-colors group">
                <div className="col-span-1 text-center font-medium md:text-sm text-gray-500">{course.stt}</div>
                <div className="col-span-5 md:col-span-4 font-medium text-gray-900 leading-tight pr-2 md:text-sm">
                  {course.title}
                  {/* Show link on mobile as subtitle */}
                   <div className="md:hidden text-xs text-blue-500 font-normal truncate mt-1">
                      <a href={course.link} target="_blank" rel="noopener noreferrer">{course.link}</a>
                   </div>
                </div>
                <div className="col-span-3 font-normal text-gray-600 md:text-sm truncate hidden md:block" title={course.instructor}>
                  {course.instructor || '-'}
                </div>
                <div className="col-span-3 md:col-span-2 text-center font-medium md:font-semibold text-[#1554A1] md:text-sm cursor-pointer hover:underline" onClick={() => handleOpenHistory(course)} title="Xem lịch sử click">
                  {course.clicks || 0}
                </div>
                <div className="col-span-3 md:col-span-2 flex justify-end gap-[10px]">
                  <button onClick={() => handleOpenModal(course)} className="text-gray-400 hover:text-[#1554A1] hover:bg-blue-50 p-1.5 rounded transition-colors hidden md:block">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Import Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" /> Nhập từ Excel
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed border border-blue-100">
                Vui lòng tải file mẫu về, nhập liệu theo đúng định dạng các cột để hệ thống có thể nhận diện chính xác. Không thay đổi tên hoặc thứ tự các cột tiêu đề.
              </div>
              
              <button 
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 bg-white border-2 border-green-600 text-green-600 px-4 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                Tải file mẫu (.xlsx)
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute border-t border-gray-200 w-full"></div>
                <div className="relative bg-white px-4 text-sm text-gray-400 font-medium">Hoặc</div>
              </div>

              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
              >
                <Upload className="w-5 h-5" />
                Chọn file để tải lên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10 shrink-0">
              <h3 className="font-bold text-lg text-gray-900">
                {editingCourse ? 'Cập nhật Khóa học' : 'Thêm Khóa học mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCourse} className="p-6 flex flex-col gap-4 overflow-y-auto w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">STT</label>
                <input 
                  type="number" 
                  required
                  value={formData.stt}
                  onChange={(e) => setFormData({...formData, stt: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1554A1] focus:bg-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Khóa Học *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1554A1] focus:bg-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giảng viên / Người chia sẻ</label>
                <input 
                  type="text" 
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1554A1] focus:bg-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Khóa Học *</label>
                <input 
                  type="url" 
                  required
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1554A1] focus:bg-white outline-none transition-colors"
                  placeholder="https://"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 font-medium text-white bg-[#1554A1] hover:bg-blue-800 rounded-lg transition-colors shadow-sm"
                >
                  {editingCourse ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Lịch sử Click */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <List className="w-5 h-5 text-[#1554A1]" /> Lịch sử Click
              </h3>
              <button 
                onClick={() => setIsHistoryModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col h-full overflow-hidden">
              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                <div>
                  <p className="text-sm text-gray-500">Khóa học</p>
                  <p className="font-semibold text-gray-900 border-b border-gray-100 pb-2">{selectedCourseForHistory?.title}</p>
                </div>
                {clickHistory.length > 0 && (
                  <button 
                    onClick={handleExportHistory}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm shrink-0"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Xuất Excel</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-auto border border-gray-100 rounded-lg bg-gray-50">
                 {loadingHistory ? (
                   <div className="p-8 text-center text-gray-500">Đang tải danh sách...</div>
                 ) : clickHistory.length === 0 ? (
                   <div className="p-8 text-center text-gray-500">Chưa có ai click vào khóa học này. (Chỉ tính những click từ lúc cập nhật mới)</div>
                 ) : (
                   <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-gray-100/70 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-600 w-16 text-center">STT</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 min-w-[200px]">Email</th>
                          <th className="px-4 py-3 font-semibold text-gray-600">Tên hiển thị</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 text-right">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                         {clickHistory.map((rec, index) => (
                           <tr key={index} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center text-gray-500 font-medium">{index + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-900">{rec.email}</td>
                              <td className="px-4 py-3 text-gray-600">{rec.displayName}</td>
                              <td className="px-4 py-3 text-gray-500 text-right">{new Date(rec.clickedAt).toLocaleString('vi-VN')}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
