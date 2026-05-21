# Ép hệ thống Terminal sử dụng bảng mã UTF-8 chuẩn quốc tế để không lỗi tiếng Việt
export PYTHONIOENCODING=utf-8
export LANG=C.UTF-8
export LC_ALL=C.UTF-8

echo "=== 1. Cài đặt thư viện từ requirements.txt ==="
pip install -r requirements.txt

echo "=== 2. Thực thi migrate cơ sở dữ liệu ==="
python manage.py makemigrations
python manage.py migrate

echo "=== 3. Tạo tài khoản Quản trị viên (Admin) ==="
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=Admin@123

python manage.py createsuperuser --no-input || echo "SuperUser đã tồn tại!"

echo "=== 4. Chèn dữ liệu mẫu cho Sàn việc làm ==="
python manage.py shell <<EOF
import sys
# Đảm bảo Python nhận diện chuỗi UTF-8 khi đọc script ngầm
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

from recruitments.models import User, Category, Company, Job, Application

# --- A. TẠO CÁC CHUYÊN MỤC NGÀNH NGHỀ (Category) ---
c1, is_created1 = Category.objects.get_or_create(name='Công nghệ thông tin', active=True)
c2, is_created2 = Category.objects.get_or_create(name='Marketing / Truyền thông', active=True)
c3, is_created3 = Category.objects.get_or_create(name='Kinh doanh / Bán hàng', active=True)
c4, is_created4 = Category.objects.get_or_create(name='Kế toán / Kiểm toán', active=True)

# --- B. TẠO TÀI KHOẢN VÀ HỒ SƠ NHÀ TUYỂN DỤNG (Employer) ---
# Nhà tuyển dụng 1
if not User.objects.filter(username='employer1').exists():
    emp1 = User.objects.create_user(
        username='employer1', password='123', role='employer',
        email='hr.techcorp@example.com', first_name='Thành', last_name='Nguyễn',
        avatar='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709564625/feofvm4kpodv2nhrddru.png'
    )
    # Tạo công ty tương ứng (Đã được Admin duyệt)
    comp1 = Company.objects.create(
        user=emp1, name='Tập đoàn Công nghệ TechCorp', address='Toà nhà Landmark 81, TP.HCM',
        website='https://techcorp.example.com', description='Công ty công nghệ phần mềm hàng đầu.',
        logo='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709564625/feofvm4kpodv2nhrddru.png',
        is_approved=True, active=True
    )
else:
    comp1 = Company.objects.get(name='Tập đoàn Công nghệ TechCorp')

# Nhà tuyển dụng 2
if not User.objects.filter(username='employer2').exists():
    emp2 = User.objects.create_user(
        username='employer2', password='123', role='employer',
        email='recruitment.marcom@example.com', first_name='Hương', last_name='Lê',
        avatar='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png'
    )
    # Tạo công ty thứ 2
    comp2 = Company.objects.create(
        user=emp2, name='Agency Truyền thông MarCom', address='Quận 1, TP. Hồ Chí Minh',
        website='https://marcom.example.com', description='Chuyên cung cấp giải pháp Marketing số.',
        logo='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png',
        is_approved=True, active=True
    )
else:
    comp2 = Company.objects.get(name='Agency Truyền thông MarCom')


# --- C. TẠO CÁC BÀI TIN TUYỂN DỤNG (Job) ---

# Tạo trước các Kỹ năng mẫu trong DB
sk1, _ = Skill.objects.get_or_create(name='Python')
sk2, _ = Skill.objects.get_or_create(name='Django')
sk3, _ = Skill.objects.get_or_create(name='Machine Learning')
sk4, _ = Skill.objects.get_or_create(name='SEO')
sk5, _ = Skill.objects.get_or_create(name='Google Ads')

job1 = Job.objects.create(
    title='Lập trình viên Python Backend (Django)', employer=comp1, category=c1,
    location='Hồ Chí Minh', salary_min=15000000, salary_max=25000000,
    deadline='2026-12-31', is_featured=True, active=True,
    description='Phát triển các hệ thống API chất lượng cao bằng Django Rest Framework.',
    requirements='Có tối thiểu 1 năm kinh nghiệm làm việc với Python. Hiểu về SQL và RESTful API.',
    benefits='Lương tháng 13, thưởng dự án, bảo hiểm đầy đủ, du lịch hàng năm.',
    experience_required=1
)
# Gắn kỹ năng vào Job 1
job1.skills.add(sk1, sk2)
job1.save()

job2 = Job.objects.create(
    title='Kỹ sư Trí tuệ nhân tạo (AI Engineer)', employer=comp1, category=c1,
    location='Hồ Chí Minh', salary_min=25000000, salary_max=45000000,
    deadline='2026-10-15', is_featured=False, active=True,
    description='Nghiên cứu và triển khai các mô hình Học máy, Học sâu (Machine Learning/Deep Learning).',
    requirements='Thành thạo Python, PyTorch hoặc TensorFlow. Có tư duy toán và thuật toán tốt.',
    benefits='Làm việc trực tiếp với chuyên gia nước ngoài, trợ cấp thiết bị làm việc cấu hình cao.',
    experience_required=2
)
# Gắn kỹ năng vào Job 2
job2.skills.add(sk1, sk3)
job2.save()

job3 = Job.objects.create(
    title='Chuyên viên Tối ưu hóa Tìm kiếm (SEO Specialist)', employer=comp2, category=c2,
    location='Hà Nội', salary_min=10000000, salary_max=18000000,
    deadline='2026-08-20', is_featured=True, active=True,
    description='Lên kế hoạch và tối ưu hóa từ khóa bài viết đẩy thứ hạng website công ty lên Google.',
    requirements='Hiểu rõ thuật toán Google, có kinh nghiệm sử dụng Google Analytics, Ahrefs.',
    benefits='Môi trường trẻ trung, sáng tạo, trà chiều mỗi ngày, thưởng KPI hấp dẫn.',
    experience_required=0
)
# Gắn kỹ năng vào Job 3
job3.skills.add(sk4, sk5)
job3.save()
echo "=== 5. Khởi động Máy chủ Django ==="
python manage.py runserver