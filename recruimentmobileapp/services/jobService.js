// src/services/jobService.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Thay đổi URL này thành IP mạng LAN hoặc Domain server Backend của bạn
const BASE_URL = 'http://10.0.2.2:8000'; // IP mặc định cho Android Emulator kết nối về localhost

// Hàm trợ lý lấy Token đã lưu khi đăng nhập thành công
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token'); // Hoặc 'accessToken' tùy cách bạn lưu
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const jobService = {
  // 1. Lấy danh sách việc làm (Có hỗ trợ tìm kiếm theo từ khóa)
  getJobList: async (searchQuery = '') => {
    try {
      const headers = await getAuthHeader();
      // Endpoint: GET /jobs/?search=keyword
      const response = await axios.get(`${BASE_URL}/jobs/`, {
        headers: headers,
        params: searchQuery ? { search: searchQuery } : {},
      });
      return response.data; // Giả định API trả về một mảng [ {id, title, ...}, ... ]
    } catch (error) {
      console.error('Lỗi lấy danh sách việc làm:', error);
      throw error;
    }
  },

  // 2. Lưu hoặc Hủy lưu bài tuyển dụng
  // Endpoint thường là: POST /jobs/{id}/save/ hoặc POST /saved-jobs/
  toggleSaveJob: async (jobId) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(`${BASE_URL}/jobs/${jobId}/save/`, {}, {
        headers: headers,
      });
      return response.data; // Trả về trạng thái sau khi xử lý thành công
    } catch (error) {
      console.error('Lỗi xử lý lưu việc làm:', error);
      throw error;
    }
  }
};