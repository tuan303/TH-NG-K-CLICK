import { Course, AdminCourse } from './types';

export const userCourses: any[] = [
  { id: 1, title: 'Toán học lớp 10 - Đại số cơ bản' },
  { id: 2, title: 'Vật lý 11 - Cơ học & Nhiệt học' },
  { id: 3, title: 'Hóa học 12 - Hóa hữu cơ' },
  { id: 4, title: 'Ngữ văn 10 - Văn học dân gian' },
  { id: 5, title: 'Tiếng Anh 11 - Kỹ năng giao tiếp' },
  { id: 6, title: 'Lịch sử 12 - Lịch sử thế giới hiện đại' },
];

export const adminSummaryCards = {
  totalClicks: '125,480',
  activeCourses: '1,245',
  topCourse: 'Intro to Python',
  topCourseClicks: '14,500'
};

export const adminCourses: AdminCourse[] = [
  { id: 'c1', title: 'Nhập môn Python', clicks: '14,500' },
  { id: 'c2', title: 'Web Development Basics', clicks: '9,800' },
  { id: 'c3', title: 'Data Science Fundamentals', clicks: '7,250' },
  { id: 'c4', title: 'AI & Machine Learning', clicks: '5,120' },
];
