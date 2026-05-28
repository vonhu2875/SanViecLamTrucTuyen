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
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

from recruitments.models import User, Category, Company, Job, Skill

AVATAR = 'https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png'

# --- A. TẠO CÁC CHUYÊN MỤC NGÀNH NGHỀ (Category) ---
c1, is_created1 = Category.objects.get_or_create(name='Công nghệ thông tin', active=True)
c2, is_created2 = Category.objects.get_or_create(name='Marketing / Truyền thông', active=True)
c3, is_created3 = Category.objects.get_or_create(name='Kinh doanh / Bán hàng', active=True)
c4, is_created4 = Category.objects.get_or_create(name='Kế toán / Kiểm toán', active=True)

# --- B. SKILLS ---
skill_defs = {
    'Python': [c1], 'Django': [c1], 'React Native': [c1],
    'JavaScript': [c1], 'Node.js': [c1], 'Docker': [c1],
    'Machine Learning': [c1], 'SQL': [c1], 'Git': [c1], 'Linux': [c1],
    'SEO': [c2], 'Google Ads': [c2, c3], 'Facebook Ads': [c2, c3],
    'Content Writing': [c2], 'Copywriting': [c2], 'Email Marketing': [c2],
    'Adobe Photoshop': [c2], 'Canva': [c2], 'Google Analytics': [c2], 'TikTok Ads': [c2, c3],
    'Kỹ năng đàm phán': [c3], 'CRM': [c3], 'Salesforce': [c3],
    'Lập kế hoạch KD': [c3], 'B2B Sales': [c3], 'Thuyết trình': [c3],
    'Nghiên cứu TT': [c3], 'Excel nâng cao': [c3, c4], 'Power BI': [c3, c4], 'Quản lý đội nhóm': [c3],
    'MISA': [c4], 'Fast Accounting': [c4], 'Kế toán thuế': [c4],
    'Kiểm toán nội bộ': [c4], 'Lập BCTC': [c4], 'Phân tích tài chính': [c4],
    'Kế toán quản trị': [c4], 'SAP': [c4], 'QuickBooks': [c4], 'Luật thuế VN': [c4],
}

skills = {}
for skill_name, categories in skill_defs.items():
    sk, _ = Skill.objects.get_or_create(name=skill_name, defaults={'active': True})
    sk.active = True
    sk.save()
    sk.categories.set(categories)  # Liên kết M2M Skill - Category
    skills[skill_name] = sk

# --- C. EMPLOYERS & COMPANIES ---
def get_or_create_employer(username, email, first_name, last_name, company_name, address, website, description):
    if not User.objects.filter(username=username).exists():
        emp = User.objects.create_user(
            username=username, password='123', role='employer',
            email=email, first_name=first_name, last_name=last_name, avatar='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png'
        )
    else:
        emp = User.objects.get(username=username)
    comp, _ = Company.objects.get_or_create(
        name=company_name,
        defaults={
            'user': emp, 'address': address, 'website': website,
            'description': description, 'logo': 'https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png', 'is_approved': True, 'active': True,
        }
    )
    comp.is_approved = True
    comp.active = True
    comp.save()
    return comp

comp1 = get_or_create_employer(
    'employer1', 'hr.techcorp@example.com', 'Thanh', 'Nguyen',
    'Tap doan Cong nghe TechCorp', 'Toa nha Landmark 81, TP.HCM',
    'https://techcorp.example.com', 'Cong ty cong nghe phan mem hang dau Viet Nam.'
)
comp2 = get_or_create_employer(
    'employer2', 'hr.marcom@example.com', 'Huong', 'Le',
    'Agency Truyen thong MarCom', 'Quan 1, TP. Ho Chi Minh',
    'https://marcom.example.com', 'Agency Marketing so hang dau, giai phap truyen thong tich hop.'
)
comp3 = get_or_create_employer(
    'employer3', 'hr.salespro@example.com', 'Minh', 'Tran',
    'SalesPro Distribution', 'Quan 7, TP. Ho Chi Minh',
    'https://salespro.example.com', 'Cong ty phan phoi va kinh doanh da nganh toan quoc.'
)
comp4 = get_or_create_employer(
    'employer4', 'hr.auditplus@example.com', 'Lan', 'Pham',
    'AuditPlus Accounting', 'Quan 3, TP. Ho Chi Minh',
    'https://auditplus.example.com', 'Dich vu ke toan, kiem toan va tu van tai chinh uy tin.'
)
print("Employers & Companies OK")

# --- D. JOBS (40 jobs) ---
# --- D. JOBS (40 jobs) ---
jobs_data = [
    # CNTT - 10 jobs
    {'title': 'Lập trình viên Python Backend (Django)', 'employer': comp1, 'category': c1, 'location': 'Hồ Chí Minh', 'salary_min': 15000000, 'salary_max': 25000000, 'deadline': '2026-12-31', 'is_featured': True, 'experience_required': 1, 'description': 'Phát triển hệ thống API chất lượng cao bằng Django REST Framework.', 'requirements': 'Tối thiểu 1 năm kinh nghiệm Python/Django. Hiểu về SQL và RESTful API.', 'benefits': 'Lương tháng 13, thưởng dự án, BHXH đầy đủ, du lịch hàng năm.', 'skills': ['Python', 'Django', 'SQL', 'Git']},
    {'title': 'Kỹ sư Trí tuệ nhân tạo (AI Engineer)', 'employer': comp1, 'category': c1, 'location': 'Hồ Chí Minh', 'salary_min': 25000000, 'salary_max': 45000000, 'deadline': '2026-10-15', 'is_featured': False, 'experience_required': 2, 'description': 'Nghiên cứu và triển khai các mô hình ML/DL phục vụ sản phẩm AI.', 'requirements': 'Thành thạo Python, PyTorch hoặc TensorFlow. Tư duy toán học tốt.', 'benefits': 'Làm việc cùng chuyên gia nước ngoài, trợ cấp thiết bị cấu hình cao.', 'skills': ['Python', 'Machine Learning', 'SQL']},
    {'title': 'Lập trình viên React Native Mobile', 'employer': comp1, 'category': c1, 'location': 'Hà Nội', 'salary_min': 18000000, 'salary_max': 32000000, 'deadline': '2026-11-30', 'is_featured': True, 'experience_required': 1, 'description': 'Xây dựng ứng dụng di động đa nền tảng iOS/Android bằng React Native.', 'requirements': 'Kinh nghiệm React Native, hiểu về REST API và state management.', 'benefits': 'Làm hybrid 3 ngày văn phòng, macbook pro, phụ cấp internet.', 'skills': ['React Native', 'JavaScript', 'Git']},
    {'title': 'Kỹ sư DevOps / Cloud (AWS)', 'employer': comp1, 'category': c1, 'location': 'Hồ Chí Minh', 'salary_min': 22000000, 'salary_max': 40000000, 'deadline': '2026-09-30', 'is_featured': False, 'experience_required': 2, 'description': 'Xây dựng và vận hành hệ thống CI/CD, quản lý hạ tầng đám mây AWS.', 'requirements': 'Kinh nghiệm Docker, Kubernetes, Linux server. Chứng chỉ AWS là lợi thế.', 'benefits': 'Hỗ trợ thi chứng chỉ quốc tế, stock option sau 2 năm.', 'skills': ['Docker', 'Linux', 'Git']},
    {'title': 'Fullstack Developer (Node.js + React)', 'employer': comp1, 'category': c1, 'location': 'Đà Nẵng', 'salary_min': 16000000, 'salary_max': 28000000, 'deadline': '2026-12-15', 'is_featured': False, 'experience_required': 1, 'description': 'Phát triển toàn bộ tính năng từ backend Node.js đến giao diện React.', 'requirements': 'Thành thạo JavaScript, Node.js, React. Biết SQL và NoSQL.', 'benefits': 'Remote 100%, lương gross không trừ, review lương 6 tháng/lần.', 'skills': ['Node.js', 'JavaScript', 'SQL', 'Git']},
    {'title': 'Kỹ sư Phân tích Dữ liệu (Data Analyst)', 'employer': comp1, 'category': c1, 'location': 'Hồ Chí Minh', 'salary_min': 14000000, 'salary_max': 22000000, 'deadline': '2026-10-31', 'is_featured': False, 'experience_required': 0, 'description': 'Phân tích dữ liệu kinh doanh, xây dựng dashboard báo cáo cho ban lãnh đạo.', 'requirements': 'Thành thạo SQL, Python pandas. Biết Power BI là lợi thế.', 'benefits': 'Đào tạo nội bộ, mentoring từ data lead, flexible hours.', 'skills': ['Python', 'SQL', 'Machine Learning']},
    {'title': 'Lập trình viên Backend Java (Spring Boot)', 'employer': comp1, 'category': c1, 'location': 'Hà Nội', 'salary_min': 20000000, 'salary_max': 35000000, 'deadline': '2026-11-15', 'is_featured': True, 'experience_required': 2, 'description': 'Phát triển microservices với Spring Boot, tối ưu hệ thống xử lý hàng triệu request.', 'requirements': 'Kinh nghiệm Java Spring Boot, hiểu về microservices và message queue.', 'benefits': 'Thưởng theo hiệu suất dự án, teambuilding quý, BHYT nâng cao.', 'skills': ['SQL', 'Docker', 'Git', 'Linux']},
    {'title': 'QA Engineer / Tester (Automation)', 'employer': comp1, 'category': c1, 'location': 'Hồ Chí Minh', 'salary_min': 12000000, 'salary_max': 20000000, 'deadline': '2026-09-15', 'is_featured': False, 'experience_required': 1, 'description': 'Xây dựng framework kiểm thử tự động, đảm bảo chất lượng sản phẩm trước khi release.', 'requirements': 'Kinh nghiệm Selenium, Pytest hoặc Appium. Hiểu quy trình Agile/Scrum.', 'benefits': 'Môi trường Agile, học bổng công nghệ 5 triệu/năm.', 'skills': ['Python', 'Git', 'Linux']},
    {'title': 'Kỹ sư An ninh Mạng (Cybersecurity)', 'employer': comp1, 'category': c1, 'location': 'Hồ Chí Minh', 'salary_min': 25000000, 'salary_max': 42000000, 'deadline': '2026-12-01', 'is_featured': True, 'experience_required': 3, 'description': 'Đánh giá và bảo vệ hệ thống khỏi các mối đe dọa bảo mật, pentest định kỳ.', 'requirements': 'Kinh nghiệm pentest, biết về OWASP Top 10. Chứng chỉ CEH/OSCP là lợi thế.', 'benefits': 'Tham gia hội thảo bảo mật quốc tế, ngân sách lab cá nhân.', 'skills': ['Linux', 'Docker', 'Git']},
    {'title': 'Product Manager (Tech Product)', 'employer': comp1, 'category': c1, 'location': 'Hồ Chí Minh', 'salary_min': 30000000, 'salary_max': 55000000, 'deadline': '2026-10-20', 'is_featured': True, 'experience_required': 3, 'description': 'Định hướng sản phẩm công nghệ, phối hợp với đội dev và design.', 'requirements': '3+ năm PM tech product. Tư duy data-driven, biết đọc hiểu kỹ thuật cơ bản.', 'benefits': 'Equity option, budget tự quyết định roadmap, team quốc tế.', 'skills': ['SQL', 'Git']},

    # MARKETING - 10 jobs
    {'title': 'Chuyên viên SEO (SEO Specialist)', 'employer': comp2, 'category': c2, 'location': 'Hà Nội', 'salary_min': 10000000, 'salary_max': 18000000, 'deadline': '2026-08-20', 'is_featured': True, 'experience_required': 0, 'description': 'Lên kế hoạch tối ưu hóa từ khóa, đẩy thứ hạng website lên top Google.', 'requirements': 'Hiểu thuật toán Google, sử dụng được Ahrefs, SEMrush, Google Analytics.', 'benefits': 'Môi trường trẻ trung, thưởng KPI hàng tháng, trà chiều mỗi ngày.', 'skills': ['SEO', 'Google Analytics', 'Content Writing']},
    {'title': 'Chuyên viên Quảng cáo Google Ads', 'employer': comp2, 'category': c2, 'location': 'Hồ Chí Minh', 'salary_min': 12000000, 'salary_max': 20000000, 'deadline': '2026-09-10', 'is_featured': False, 'experience_required': 1, 'description': 'Lên chiến lược và vận hành các chiến dịch Google Search, Display, Shopping.', 'requirements': 'Kinh nghiệm chạy Google Ads, biết tối ưu ROAS và CPA.', 'benefits': 'Hoa hồng theo hiệu suất, được Google cấp ngân sách test miễn phí.', 'skills': ['Google Ads', 'Google Analytics', 'Facebook Ads']},
    {'title': 'Content Creator / Copywriter', 'employer': comp2, 'category': c2, 'location': 'Hồ Chí Minh', 'salary_min': 9000000, 'salary_max': 16000000, 'deadline': '2026-10-01', 'is_featured': False, 'experience_required': 0, 'description': 'Sản xuất nội dung sáng tạo cho website, mạng xã hội và email marketing.', 'requirements': 'Viết tốt tiếng Việt, hiểu về SEO content, có portfolio là lợi thế.', 'benefits': 'Làm việc linh hoạt, tham gia các chiến dịch lớn của thương hiệu.', 'skills': ['Content Writing', 'Copywriting', 'SEO']},
    {'title': 'Social Media Manager', 'employer': comp2, 'category': c2, 'location': 'Hồ Chí Minh', 'salary_min': 11000000, 'salary_max': 19000000, 'deadline': '2026-11-01', 'is_featured': True, 'experience_required': 1, 'description': 'Quản lý và phát triển các kênh mạng xã hội cho khách hàng.', 'requirements': 'Kinh nghiệm quản lý fanpage, hiểu insight mạng xã hội, sáng tạo nội dung.', 'benefits': 'Được làm việc với các thương hiệu lớn, cơ hội thăng tiến nhanh.', 'skills': ['Facebook Ads', 'TikTok Ads', 'Canva', 'Content Writing']},
    {'title': 'Email Marketing Specialist', 'employer': comp2, 'category': c2, 'location': 'Hà Nội', 'salary_min': 10000000, 'salary_max': 17000000, 'deadline': '2026-09-20', 'is_featured': False, 'experience_required': 1, 'description': 'Xây dựng và tối ưu hóa các chiến dịch email tự động hóa.', 'requirements': 'Biết Mailchimp, HubSpot hoặc ActiveCampaign. Hiểu A/B testing.', 'benefits': 'Đào tạo công cụ marketing hiện đại, chứng chỉ HubSpot được hỗ trợ.', 'skills': ['Email Marketing', 'Google Analytics', 'Copywriting']},
    {'title': 'Graphic Designer / Visual Content', 'employer': comp2, 'category': c2, 'location': 'Đà Nẵng', 'salary_min': 9000000, 'salary_max': 15000000, 'deadline': '2026-10-15', 'is_featured': False, 'experience_required': 0, 'description': 'Thiết kế ấn phẩm truyền thông, banner quảng cáo, bộ nhận diện thương hiệu.', 'requirements': 'Thành thạo Photoshop, Illustrator hoặc Canva. Có portfolio đẹp.', 'benefits': 'Môi trường sáng tạo, tự do thể hiện ý tưởng, teambuilding thường xuyên.', 'skills': ['Adobe Photoshop', 'Canva', 'Content Writing']},
    {'title': 'TikTok Content Creator & Ads', 'employer': comp2, 'category': c2, 'location': 'Hồ Chí Minh', 'salary_min': 10000000, 'salary_max': 18000000, 'deadline': '2026-11-15', 'is_featured': True, 'experience_required': 0, 'description': 'Sản xuất video TikTok viral, vận hành TikTok Ads cho các thương hiệu.', 'requirements': 'Hiểu thuật toán TikTok, có kinh nghiệm quay dựng video ngắn.', 'benefits': 'Được cấp thiết bị quay phim, hỗ trợ chi phí background/props.', 'skills': ['TikTok Ads', 'Canva', 'Copywriting']},
    {'title': 'Marketing Executive (Brand)', 'employer': comp2, 'category': c2, 'location': 'Hồ Chí Minh', 'salary_min': 13000000, 'salary_max': 22000000, 'deadline': '2026-12-10', 'is_featured': False, 'experience_required': 1, 'description': 'Lên kế hoạch và thực thi các hoạt động xây dựng thương hiệu, tổ chức sự kiện.', 'requirements': 'Kinh nghiệm marketing thương hiệu, kỹ năng tổ chức sự kiện.', 'benefits': 'Ngân sách marketing linh hoạt, mạng lưới partner rộng.', 'skills': ['Google Analytics', 'Facebook Ads', 'Email Marketing']},
    {'title': 'Performance Marketing Manager', 'employer': comp2, 'category': c2, 'location': 'Hồ Chí Minh', 'salary_min': 20000000, 'salary_max': 35000000, 'deadline': '2026-10-05', 'is_featured': True, 'experience_required': 3, 'description': 'Dẫn dắt đội ngũ performance marketing, tối ưu ngân sách đa kênh đạt ROAS cao nhất.', 'requirements': '3+ năm kinh nghiệm quản lý campaign đa kênh, biết phân tích dữ liệu.', 'benefits': 'Thưởng theo doanh thu, xe công ty, điện thoại công tác.', 'skills': ['Google Ads', 'Facebook Ads', 'TikTok Ads', 'Google Analytics']},
    {'title': 'PR & Communications Specialist', 'employer': comp2, 'category': c2, 'location': 'Hà Nội', 'salary_min': 12000000, 'salary_max': 20000000, 'deadline': '2026-09-25', 'is_featured': False, 'experience_required': 1, 'description': 'Xây dựng quan hệ báo chí, viết thông cáo, quản lý khủng hoảng truyền thông.', 'requirements': 'Có mạng lưới báo chí, kỹ năng viết tốt, xử lý khủng hoảng nhanh.', 'benefits': 'Làm việc với các thương hiệu quốc tế, tham gia sự kiện ngành.', 'skills': ['Content Writing', 'Copywriting', 'Email Marketing']},

    # KINH DOANH - 10 jobs
    {'title': 'Nhân viên Kinh doanh B2B (Sales Executive)', 'employer': comp3, 'category': c3, 'location': 'Hồ Chí Minh', 'salary_min': 10000000, 'salary_max': 20000000, 'deadline': '2026-08-31', 'is_featured': False, 'experience_required': 0, 'description': 'Tìm kiếm và phát triển khách hàng doanh nghiệp, giới thiệu sản phẩm phân phối.', 'requirements': 'Kỹ năng giao tiếp tốt, chịu áp lực doanh số. Có xe máy là bắt buộc.', 'benefits': 'Lương cơ bản + hoa hồng không giới hạn, xe công tác, điện thoại.', 'skills': ['B2B Sales', 'Kỹ năng đàm phán', 'Thuyết trình']},
    {'title': 'Trưởng nhóm Kinh doanh (Sales Team Leader)', 'employer': comp3, 'category': c3, 'location': 'Hồ Chí Minh', 'salary_min': 18000000, 'salary_max': 30000000, 'deadline': '2026-09-15', 'is_featured': True, 'experience_required': 2, 'description': 'Quản lý và huấn luyện đội sales 5-10 người, đạt chỉ tiêu doanh thu.', 'requirements': '2+ năm kinh nghiệm sales, có kinh nghiệm quản lý đội nhóm.', 'benefits': 'Thưởng vượt KPI, du lịch nước ngoài hàng năm, đào tạo leadership.', 'skills': ['Quản lý đội nhóm', 'B2B Sales', 'CRM', 'Kỹ năng đàm phán']},
    {'title': 'Chuyên viên Phát triển Kinh doanh (BD)', 'employer': comp3, 'category': c3, 'location': 'Hà Nội', 'salary_min': 15000000, 'salary_max': 25000000, 'deadline': '2026-10-10', 'is_featured': False, 'experience_required': 1, 'description': 'Nghiên cứu thị trường, đề xuất chiến lược mở rộng kinh doanh.', 'requirements': 'Kinh nghiệm BD, phân tích thị trường, làm việc được với số liệu.', 'benefits': 'Phụ cấp đi lại toàn quốc, cơ hội quản lý vùng sau 1 năm.', 'skills': ['Nghiên cứu TT', 'Lập kế hoạch KD', 'Thuyết trình', 'Power BI']},
    {'title': 'Key Account Manager (KAM)', 'employer': comp3, 'category': c3, 'location': 'Hồ Chí Minh', 'salary_min': 20000000, 'salary_max': 35000000, 'deadline': '2026-11-20', 'is_featured': True, 'experience_required': 2, 'description': 'Quản lý và phát triển mối quan hệ với các khách hàng chiến lược.', 'requirements': '2+ năm KAM, thành thạo CRM (Salesforce). Kỹ năng đàm phán xuất sắc.', 'benefits': 'Commission cao, xe hạng sang công vụ, thẻ tiếp khách.', 'skills': ['CRM', 'Salesforce', 'Kỹ năng đàm phán', 'B2B Sales']},
    {'title': 'Giám đốc Kinh doanh Khu vực (RSM)', 'employer': comp3, 'category': c3, 'location': 'Hồ Chí Minh', 'salary_min': 35000000, 'salary_max': 60000000, 'deadline': '2026-10-25', 'is_featured': True, 'experience_required': 5, 'description': 'Chịu trách nhiệm toàn bộ doanh thu khu vực, quản lý đội ngũ 20+ người.', 'requirements': '5+ năm kinh nghiệm quản lý vùng, có background phân phối FMCG hoặc B2B.', 'benefits': 'Gói lương hấp dẫn, xe BMW công vụ, bảo hiểm sức khỏe gia đình.', 'skills': ['Quản lý đội nhóm', 'Lập kế hoạch KD', 'Kỹ năng đàm phán', 'Excel nâng cao']},
    {'title': 'Chuyên viên Chăm sóc Khách hàng (CRM)', 'employer': comp3, 'category': c3, 'location': 'Hà Nội', 'salary_min': 9000000, 'salary_max': 15000000, 'deadline': '2026-09-05', 'is_featured': False, 'experience_required': 0, 'description': 'Tiếp nhận và xử lý phản hồi khách hàng, duy trì tỷ lệ hài lòng và tái mua hàng.', 'requirements': 'Giao tiếp tốt, nhẫn nại, biết sử dụng phần mềm CRM cơ bản.', 'benefits': 'Ca làm việc linh hoạt, thưởng khách hàng hài lòng, phúc lợi đầy đủ.', 'skills': ['CRM', 'Thuyết trình']},
    {'title': 'Nhân viên Xuất nhập khẩu (Import/Export)', 'employer': comp3, 'category': c3, 'location': 'Hồ Chí Minh', 'salary_min': 11000000, 'salary_max': 18000000, 'deadline': '2026-12-05', 'is_featured': False, 'experience_required': 1, 'description': 'Xử lý hồ sơ hải quan, điều phối logistics xuất nhập khẩu hàng hóa đa quốc gia.', 'requirements': 'Kinh nghiệm XNK, đọc hiểu tiếng Anh thương mại, biết Incoterms.', 'benefits': 'Đào tạo nghiệp vụ hải quan, cơ hội công tác nước ngoài.', 'skills': ['Kỹ năng đàm phán', 'Excel nâng cao']},
    {'title': 'Phân tích Kinh doanh (Business Analyst)', 'employer': comp3, 'category': c3, 'location': 'Hồ Chí Minh', 'salary_min': 15000000, 'salary_max': 26000000, 'deadline': '2026-11-10', 'is_featured': False, 'experience_required': 1, 'description': 'Phân tích dữ liệu bán hàng, xây dựng báo cáo và đề xuất chiến lược tối ưu doanh thu.', 'requirements': 'Thành thạo Excel nâng cao, Power BI. Tư duy phân tích dữ liệu kinh doanh.', 'benefits': 'Làm việc với board C-level, cơ hội thăng tiến quản lý.', 'skills': ['Excel nâng cao', 'Power BI', 'Nghiên cứu TT', 'Lập kế hoạch KD']},
    {'title': 'Nhân viên Mua hàng / Procurement', 'employer': comp3, 'category': c3, 'location': 'Hồ Chí Minh', 'salary_min': 10000000, 'salary_max': 17000000, 'deadline': '2026-10-30', 'is_featured': False, 'experience_required': 1, 'description': 'Tìm kiếm nhà cung cấp, đàm phán giá, quản lý đơn đặt hàng và theo dõi tiến độ giao hàng.', 'requirements': 'Kinh nghiệm mua hàng, kỹ năng đàm phán, đọc được hợp đồng tiếng Anh.', 'benefits': 'Thưởng tiết kiệm chi phí, phụ cấp xăng xe, phone allowance.', 'skills': ['Kỹ năng đàm phán', 'Excel nâng cao']},
    {'title': 'Trade Marketing Executive', 'employer': comp3, 'category': c3, 'location': 'Hà Nội', 'salary_min': 12000000, 'salary_max': 20000000, 'deadline': '2026-09-30', 'is_featured': True, 'experience_required': 1, 'description': 'Lên kế hoạch và triển khai các hoạt động trade marketing tại điểm bán hàng.', 'requirements': 'Kinh nghiệm trade marketing hoặc sales, sáng tạo, đi thị trường được.', 'benefits': 'Ngân sách trade linh hoạt, xe máy công ty, thưởng display.', 'skills': ['Lập kế hoạch KD', 'Nghiên cứu TT', 'Thuyết trình']},

    # KE TOAN - 10 jobs
    {'title': 'Kế toán Tổng hợp', 'employer': comp4, 'category': c4, 'location': 'Hồ Chí Minh', 'salary_min': 10000000, 'salary_max': 18000000, 'deadline': '2026-08-25', 'is_featured': False, 'experience_required': 1, 'description': 'Thực hiện toàn bộ công tác kế toán từ hạch toán chứng từ đến lập báo cáo tài chính.', 'requirements': 'Kinh nghiệm kế toán tổng hợp, thành thạo MISA hoặc Fast Accounting.', 'benefits': 'BHXH đầy đủ, thưởng tháng 13, tăng lương theo năng lực.', 'skills': ['MISA', 'Lập BCTC', 'Kế toán thuế', 'Excel nâng cao']},
    {'title': 'Kế toán Thuế (Tax Accountant)', 'employer': comp4, 'category': c4, 'location': 'Hà Nội', 'salary_min': 12000000, 'salary_max': 20000000, 'deadline': '2026-09-20', 'is_featured': True, 'experience_required': 2, 'description': 'Kê khai và quyết toán thuế GTGT, TNCN, TNDN. Làm việc trực tiếp với cơ quan thuế.', 'requirements': '2+ năm kế toán thuế, hiểu luật thuế Việt Nam, có chứng chỉ đại lý thuế là lợi thế.', 'benefits': 'Hỗ trợ thi chứng chỉ CPA, môi trường chuyên nghiệp.', 'skills': ['Kế toán thuế', 'Luật thuế VN', 'MISA', 'Lập BCTC']},
    {'title': 'Kiểm toán Nội bộ (Internal Auditor)', 'employer': comp4, 'category': c4, 'location': 'Hồ Chí Minh', 'salary_min': 15000000, 'salary_max': 25000000, 'deadline': '2026-10-20', 'is_featured': False, 'experience_required': 2, 'description': 'Thực hiện kiểm toán nội bộ định kỳ, đánh giá rủi ro và đề xuất cải thiện quy trình.', 'requirements': 'Kinh nghiệm kiểm toán nội bộ hoặc kiểm toán độc lập, tư duy hệ thống.', 'benefits': 'Làm việc với các công ty đa quốc gia, cơ hội đi công tác.', 'skills': ['Kiểm toán nội bộ', 'Lập BCTC', 'Phân tích tài chính', 'Excel nâng cao']},
    {'title': 'Kế toán Quản trị (Management Accountant)', 'employer': comp4, 'category': c4, 'location': 'Hồ Chí Minh', 'salary_min': 14000000, 'salary_max': 23000000, 'deadline': '2026-11-05', 'is_featured': False, 'experience_required': 2, 'description': 'Xây dựng hệ thống báo cáo quản trị, phân tích chi phí và hỗ trợ ra quyết định kinh doanh.', 'requirements': 'Kinh nghiệm kế toán quản trị, thành thạo Excel nâng cao và Power BI.', 'benefits': 'Làm việc cùng CFO, cơ hội trở thành Finance Controller.', 'skills': ['Kế toán quản trị', 'Phân tích tài chính', 'Excel nâng cao', 'Power BI']},
    {'title': 'Phân tích Tài chính (Financial Analyst)', 'employer': comp4, 'category': c4, 'location': 'Hồ Chí Minh', 'salary_min': 18000000, 'salary_max': 30000000, 'deadline': '2026-10-15', 'is_featured': True, 'experience_required': 2, 'description': 'Phân tích hiệu quả tài chính doanh nghiệp, xây dựng mô hình tài chính và dự báo.', 'requirements': 'Kinh nghiệm FA, thành thạo Excel financial modeling, có CFA là lợi thế.', 'benefits': 'Hỗ trợ thi CFA/CPA, bonus theo hiệu suất, cơ hội tiếp cận M&A.', 'skills': ['Phân tích tài chính', 'Excel nâng cao', 'Power BI', 'Lập BCTC']},
    {'title': 'Kế toán Công nợ (AR/AP Accountant)', 'employer': comp4, 'category': c4, 'location': 'Đà Nẵng', 'salary_min': 9000000, 'salary_max': 15000000, 'deadline': '2026-09-10', 'is_featured': False, 'experience_required': 0, 'description': 'Theo dõi công nợ phải thu, phải trả; đối chiếu và xử lý chứng từ thanh toán.', 'requirements': 'Tốt nghiệp Kế toán/Tài chính, thành thạo Excel và phần mềm kế toán.', 'benefits': 'Môi trường ổn định, đào tạo nghiệp vụ, phúc lợi nhà nước.', 'skills': ['MISA', 'Excel nâng cao', 'Fast Accounting']},
    {'title': 'Kế toán Lương và BHXH (Payroll)', 'employer': comp4, 'category': c4, 'location': 'Hồ Chí Minh', 'salary_min': 10000000, 'salary_max': 17000000, 'deadline': '2026-12-20', 'is_featured': False, 'experience_required': 1, 'description': 'Tính toán và xử lý bảng lương, BHXH/BHYT/BHTN, quyết toán thuế TNCN hàng năm.', 'requirements': 'Kinh nghiệm payroll, hiểu luật lao động và BHXH Việt Nam.', 'benefits': 'Lịch làm việc ổn định, phúc lợi đầy đủ, hỗ trợ bữa trưa.', 'skills': ['Kế toán thuế', 'Luật thuế VN', 'MISA', 'Excel nâng cao']},
    {'title': 'Kế toán Trưởng (Chief Accountant)', 'employer': comp4, 'category': c4, 'location': 'Hồ Chí Minh', 'salary_min': 25000000, 'salary_max': 45000000, 'deadline': '2026-11-25', 'is_featured': True, 'experience_required': 5, 'description': 'Phụ trách toàn bộ công tác kế toán, tài chính và thuế của công ty. Báo cáo trực tiếp cho CEO.', 'requirements': '5+ năm kinh nghiệm, có chứng chỉ CPA Việt Nam bắt buộc.', 'benefits': 'Gói lương hấp dẫn, xe công vụ, quyết định bộ máy kế toán.', 'skills': ['Lập BCTC', 'Kế toán thuế', 'Kiểm toán nội bộ', 'SAP', 'Phân tích tài chính']},
    {'title': 'Chuyên viên Tư vấn Thuế (Tax Consultant)', 'employer': comp4, 'category': c4, 'location': 'Hà Nội', 'salary_min': 16000000, 'salary_max': 28000000, 'deadline': '2026-10-08', 'is_featured': False, 'experience_required': 2, 'description': 'Tư vấn và hỗ trợ khách hàng doanh nghiệp về tuân thủ thuế, tối ưu hóa nghĩa vụ thuế hợp pháp.', 'requirements': 'Kinh nghiệm tư vấn thuế, thành thạo luật thuế VN, tiếng Anh đọc hiểu tốt.', 'benefits': 'Cơ hội làm việc với Big4, đào tạo liên tục, thưởng theo doanh thu.', 'skills': ['Luật thuế VN', 'Kế toán thuế', 'Lập BCTC']},
    {'title': 'Kế toán ERP / SAP Consultant', 'employer': comp4, 'category': c4, 'location': 'Hồ Chí Minh', 'salary_min': 22000000, 'salary_max': 40000000, 'deadline': '2026-12-15', 'is_featured': True, 'experience_required': 3, 'description': 'Triển khai và hỗ trợ module FI/CO của SAP ERP cho các doanh nghiệp sản xuất và phân phối.', 'requirements': '3+ năm SAP FI/CO, hiểu quy trình kế toán doanh nghiệp, tiếng Anh giao tiếp.', 'benefits': 'Chứng chỉ SAP được hỗ trợ toàn phần, công tác onsite tại Singapore/Nhật.', 'skills': ['SAP', 'QuickBooks', 'Lập BCTC', 'Phân tích tài chính']},
]

created = 0
for jd in jobs_data:
    job_skills = jd.pop('skills')
    job, _ = Job.objects.get_or_create(
        title=jd['title'], employer=jd['employer'],
        defaults={**jd, 'active': True}
    )
    for k, v in jd.items():
        setattr(job, k, v)
    job.active = True
    job.save()
    job.skills.set([skills[s] for s in job_skills if s in skills])
    created += 1

print(f"Jobs OK: {created}/40 jobs da duoc tao")
print("Seed du lieu hoan tat!")
EOF

echo "=== 5. Khởi động Máy chủ Django ==="
python manage.py runserver