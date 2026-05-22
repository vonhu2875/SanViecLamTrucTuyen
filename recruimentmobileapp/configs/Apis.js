// configs/Apis.js

// 1. Cấu hình Base URL kết nối đến Server Back-End của bạn
// Lưu ý: Nếu chạy máy ảo Android, hãy thay localhost thành IP máy tính của bạn (Ví dụ: 192.168.1.X)
const BASE_URL = 'http://192.168.88.16:8081'; // Hoặc endpoint deploy thực tế của bạn

export const ENDPOINTS = {
  // Cụm 1: Quản lý Người dùng & Xác thực (/users/)
  auth: {
    NavigatorLogin: `${BASE_URL}/o/token/`, // Đăng nhập (Candidate/Employer) [cite: 1, 2]
    register: `${BASE_URL}/users/`, // Đăng ký tài khoản (Candidate/Employer) [cite: 3, 4]
    currentUser: `${BASE_URL}/users/current-user/`, // Xem & Cập nhật thông tin chi tiết cá nhân [cite: 7, 10]
  },

  // Cụm 2: Quản lý Hồ sơ Doanh nghiệp (/companies/)
  companies: {
    list: `${BASE_URL}/companies/`, // Lấy danh sách công ty hoặc Tạo mới doanh nghiệp [cite: 16, 20]
    detail: (id) => `${BASE_URL}/companies/${id}/`, // Xem chi tiết công ty hoặc Admin phê duyệt duyệt [cite: 25, 28]
    currentCompany: `${BASE_URL}/companies/current-company/`, // Xem & Chỉnh sửa hồ sơ công ty của NTD [cite: 33, 37]
  },

  // Cụm 3: Tin Tuyển dụng (/jobs/)
  jobs: {
    list: `${BASE_URL}/jobs/`, // Lấy danh sách tin tuyển dụng (Hỗ trợ phân trang, tìm kiếm, lọc) hoặc Đăng tin [cite: 43, 50]
    saved: `${BASE_URL}/jobs/?saved=true`, // Xem danh sách việc làm Ứng viên đã lưu [cite: 46, 47]
    detail: (id) => `${BASE_URL}/jobs/${id}/`, // Xem chi tiết hoặc Xóa tin tuyển dụng [cite: 53, 56]
    update: (id) => `${BASE_URL}/jobs/${id}/update-job/`, // Chỉnh sửa nội dung tin đăng [cite: 59]
    save: (id) => `${BASE_URL}/jobs/${id}/save/`, // Bấm lưu / bỏ lưu tin tuyển dụng (Bookmark) [cite: 63, 64]
  },

  // Cụm 4: Hồ sơ Ứng tuyển (/applications/)
  applications: {
    list: `${BASE_URL}/applications/`, // Xem danh sách đơn ứng tuyển hoặc Ứng viên nộp CV [cite: 69, 74]
    review: (id) => `${BASE_URL}/applications/${id}/review/`, // Nhà tuyển dụng đánh giá & để lại comment [cite: 79, 80]
  },

  // Cụm 5: Nhóm API Thống kê số liệu (StatsViewSet)
  stats: {
    employer: `${BASE_URL}/api/stats/employer-stats/`, // Nhà tuyển dụng thống kê nội bộ công ty [cite: 85, 86]
    admin: `${BASE_URL}/api/stats/admin-stats/`, // Admin xem báo cáo tổng quan toàn bộ hệ thống [cite: 88, 89]
  }
};

// Hàm bổ trợ cấu hình gọi API kèm cấu trúc lồng Token (Dành cho các endpoint bắt buộc đăng nhập)
export const authApi = (token) => {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  };
};

// Hàm bổ trợ cấu hình gọi API khi có upload file (Avatar, Logo, CV File) qua form-data
export const formDataAuthApi = (token) => {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    }
  };
};

export default BASE_URL;