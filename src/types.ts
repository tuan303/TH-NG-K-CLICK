export interface Course {
  id: string;      // Firestore document ID
  stt: number;     // Số thứ tự
  title: string;   // Tên khóa học
  instructor: string; // Giảng viên/Người chia sẻ
  link: string;    // Link khóa học
  clicks: number;  // Tổng số click
}

export interface AdminCourse {
  id: string | number;
  title: string;
  clicks: string | number;
}
