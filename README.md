# FINAL PROJECT: Modern Programming Technologies - ONLINE JOB BOARD PLATFORM

## Mô tả dự án

**Sàn Việc Làm Trực Tuyến** là ứng dụng di động kết nối Nhà tuyển dụng và Ứng viên, hỗ trợ toàn bộ quy trình từ đăng tin tuyển dụng đến nộp hồ sơ trực tuyến. Hệ thống được phát triển tích hợp mô hình kinh doanh Freemium (miễn phí tính năng cơ bản, trả phí để mở khóa tính năng so sánh cao cấp) thông qua cổng thanh toán điện tử MoMo.

### Hệ thống hỗ trợ ba vai trò chính (User Roles):
*   **Quản trị viên (Admin):** Quản lý tài khoản người dùng, doanh nghiệp, tin tuyển dụng và phê duyệt đối tác tham gia hệ thống.
*   **Nhà tuyển dụng (Employer):** Quản lý thông tin công ty, đăng tin tuyển dụng, theo dõi, duyệt và cập nhật trạng thái hồ sơ ứng viên.
*   **Ứng viên (Candidate):** Tìm kiếm/lọc việc làm, xem chi tiết công việc, lưu vị trí yêu thích và nộp hồ sơ ứng tuyển.

## Thành viên nhóm & Vai trò

| MSSV | Họ tên | Vai trò | 
| :--- | :--- | :--- | 
| 2351050127 | Võ Thị Bích Như |  **Backend & Frontend Developer** <br> Quản lý dự án, Thiết kế DB, Phát triển API Backend & UI Frontend cho một số API|
| 2351050037 | Nguyễn Diệp Thái Hà | **Backend & Frontend Developer** <br> Phát triển API Backend & UI Frontend cho một số API|

---

## Công nghệ sử dụng

| Phân loại | Công nghệ / Công cụ |
| :--- | :--- |
| **Backend Framework** | Python, Django, Django REST Framework (DRF) |
| **Frontend Framework** | React Native, React Navigation, Axios, AsyncStorage |
| **Database** | MySQL |
| **Authentication & Security** | OAuth2, Mã hóa HMAC-SHA256, Deep Linking |
| **Third-party Integration** | MoMo Payment API (Sandbox), Webhook / IPN |
| **Development & Tools** | Git/GitHub, Postman, Ngrok |

---

## Hướng dẫn cài đặt và chạy (Backend)

### 1. Yêu cầu hệ thống
* Máy tính đã cài đặt sẵn **Python (phiên bản 3.8 trở lên)**.
* Máy tính đã cài đặt và khởi động sẵn **MySQL Server**.

### 2. Các bước triển khai chi tiết

**Bước 1: Tải mã nguồn về máy**
Mở terminal (hoặc Git Bash) và chạy lệnh sau để clone dự án:

git clone https://github.com/vonhu2875/SanViecLamTrucTuyen.git

cd recruitmentapis

**Bước 2: Khởi tạo môi trường ảo**
- python -m venv venv

Kích hoạt môi trường ảo (Đối với Windows)

- venv\Scripts\activate

Kích hoạt môi trường ảo (Đối với macOS/Linux)

- source venv/bin/activate

### Bước 3. Cấu hình cơ sở dữ liệu
- Mở MySQL Client (hoặc Workbench/DBeaver) và tạo một database mới: `CREATE DATABASE recruitmentdb;`

- Mở file settings.py trong dự án của bạn, tìm đến mục DATABASES và cập nhật thông tin kết nối (NAME, USER, PASSWORD, HOST, PORT) cho khớp với cấu hình máy cá nhân.

### Bước 4: Cài đặt các thư viện phụ thuộc, khởi tạo cấu trúc database

Chạy file run_django.sh

### Hệ thống API Backend sẽ sẵn sàng hoạt động tại địa chỉ: http://127.0.0.1:8000/

## Cài đặt & Chạy Frontend React Native

Mở một cửa sổ Terminal mới (song song với Terminal Backend) và di chuyển vào thư mục giao diện:
- cd frontend
  
Cài đặt các gói thư viện:

- npm install
Mở file cấu hình API (configs/Apis) ở Frontend, đổi địa chỉ IP của API Server từ 127.0.0.1 sang địa chỉ IP mạng nội bộ (Local IP) của máy bạn (Ví dụ: http://192.168.1.X:8000/api/).

Khởi chạy ứng dụng:

- npm start
  
Nhấn phím a để mở ứng dụng trên máy ảo Android hoặc phím i cho máy ảo iOS.
