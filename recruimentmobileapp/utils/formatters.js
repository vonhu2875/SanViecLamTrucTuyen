// utils/formatters.js

/**
 * Format số tiền thành chuỗi có dấu chấm phân cách (VD: 25000000 -> 25.000.000 đ)
 */
export const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
};

/**
 * Format ngày tháng từ Backend (VD: 2026-10-15 -> 15/10/2026)
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Rút gọn số lớn (VD: 1240 -> 1.2K, 1500000 -> 1.5M) - Rất hợp để đếm Views
 */
export const formatNumberCompact = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

/**
 * Tính tỷ lệ phần trăm an toàn (tránh lỗi chia cho 0)
 */
export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

/**
 * Kiểm tra xem ngày nộp hồ sơ đã hết hạn chưa so với hôm nay
 */
export const isExpired = (deadlineString) => {
    if (!deadlineString) return false;
    const deadline = new Date(deadlineString);
    const today = new Date();
    
    // Đặt giờ phút giây của hôm nay về 0 để so sánh chính xác ngày
    today.setHours(0, 0, 0, 0); 
    
    return deadline < today;
};