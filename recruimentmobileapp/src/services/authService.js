// src/services/authService.js

import axios from 'axios';
import { ENDPOINTS } from '../configs/Apis';

/**
 * Gọi API Đăng ký tài khoản (Candidate/Employer)
 * Theo tài liệu: POST /users/ - Yêu cầu gửi form-data
 */
export const registerUser = async (registerData) => {
  try {
    // Vì backend yêu cầu form-data (để up avatar), ta cần chuyển đổi object sang FormData
    const formData = new FormData();
    formData.append('first_name', registerData.name);
    formData.append('email', registerData.email);
    formData.append('password', registerData.password);
    formData.append('role', registerData.role);
    
    // Nếu có avatar thì append thêm vào
    // formData.append('avatar', { uri: ..., name: ..., type: ... });

    // Gọi API POST tới Backend
    const response = await axios.post(ENDPOINTS.auth.register, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { 
      success: true, 
      message: 'Đăng ký tài khoản thành công!', 
      data: response.data 
    };
  } catch (error) {
    // Bắt lỗi từ server trả về (ví dụ: email đã tồn tại)
    const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
    throw new Error(errorMsg);
  }
};

/**
 * Gọi API Đăng nhập
 * Lưu ý: Thay endpoint login thực tế của backend bạn vào nếu dùng chuẩn JWT (VD: /api/token/ hoặc /users/login/)
 */
export const loginUser = async (email, password) => {
  try {
    // Thường đăng nhập sẽ gửi JSON
    const payload = {
      email: email,
      password: password,
    };

    // Tạm giả định backend của bạn có endpoint đăng nhập tại: BASE_URL/users/login/ hoặc /api/token/
    // (Bạn có thể bổ sung ENDPOINTS.auth.login vào file Apis.js)
    const LOGIN_URL = `${ENDPOINTS.auth.currentUser.replace('current-user/', 'login/')}`; 

    const response = await axios.post(LOGIN_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      success: true,
      message: 'Đăng nhập thành công!',
      token: response.data.token || response.data.access, // Tùy backend trả về key là token hay access
      user: response.data.user // Thông tin user đi kèm
    };
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Email hoặc Mật khẩu không chính xác.';
    throw new Error(errorMsg);
  }
};