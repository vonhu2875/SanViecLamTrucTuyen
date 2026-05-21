// src/utils/validators.js

/**
 * Kiểm tra tính hợp lệ của Form Đăng ký
 */
export const validateRegisterForm = (formData, isEmployer) => {
  const { name, email, password, confirmPassword, companyName, taxCode } = formData;

  if (!name || !email || !password || !confirmPassword) {
    return 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
  }

  // Regex kiểm tra định dạng Email chuẩn
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email không đúng định dạng.';
  }

  if (password.length < 6) {
    return 'Mật khẩu phải chứa ít nhất 6 ký tự.';
  }

  if (password !== confirmPassword) {
    return 'Mật khẩu xác nhận không trùng khớp.';
  }

  // Nếu chọn vai trò Nhà tuyển dụng, bắt buộc nhập thêm thông tin doanh nghiệp
  if (isEmployer) {
    if (!companyName || !taxCode) {
      return 'Vui lòng nhập Tên công ty và Mã số thuế.';
    }
  }

  return null; // Không có lỗi
};