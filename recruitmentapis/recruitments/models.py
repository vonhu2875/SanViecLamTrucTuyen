from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django.db import models
from django.contrib.auth.models import AbstractUser

# Base Model
class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True

# Người dùng
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('employer', 'Employer'),
        ('candidate', 'Candidate'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
    avatar = CloudinaryField('avatar')

    def __str__(self):
        return self.username

# Công ty (Nhà tuyển dụng)
class Company(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField()
    logo = CloudinaryField('avatar', null=True, blank=True)
    address = models.CharField(max_length=255)
    website = models.URLField(null=True,blank=True)
    #Thuộc tính kiểm soát quền đăng tin của công ty phía tuyển dụng
    is_approved = models.BooleanField(default=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company')
    def __str__(self):
        return self.name

# Danh mục các công việc
class Category(BaseModel):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

# Kỹ năng mỗi job (Để dễ mở rộng tìm kiếm job theo kỹ năng)
class Skill(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

# Job
class Job(BaseModel):
    title = models.CharField(max_length=255)
    description = RichTextField()
    requirements = RichTextField()
    benefits = RichTextField()
    location = models.CharField(max_length=255)
    salary_min = models.DecimalField(max_digits=12,decimal_places=2)
    salary_max = models.DecimalField(max_digits=12,decimal_places=2)
    experience_required = models.IntegerField(default=0)
    deadline = models.DateField()
    # Tính năng nâng cao (*): Gói tin tuyển dụng nổi bật/Ưu tiên (liên kết với phần mở rộng thanh toán)
    is_featured = models.BooleanField(default=False)
    skills = models.ManyToManyField(Skill,related_name='jobs',blank=True)
    employer = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='jobs')
    class Meta:
        ordering = ['-created_date']
    def __str__(self):
        return self.title

# Hồ sơ ứng tuyển
class Application(BaseModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    cv_file = CloudinaryField('cv_file', resource_type='auto')
    cover_letter = models.TextField(blank=True,null=True)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='pending')
    employer_comment = models.TextField(blank=True,null=True)
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    class Meta:
        unique_together = ('candidate', 'job')

    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"



# Lưu lại công việc yêu thích(Để mở rộng thôi -> Sẽ xem xét lại)
class SavedJob(BaseModel):
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='saved_jobs')

    job = models.ForeignKey(Job,on_delete=models.CASCADE,related_name='saved_users')

    class Meta:
        unique_together = ('user', 'job')

    def __str__(self):
        return f"{self.user.username} saved {self.job.title}"

# Payment(Để mở rộng thôi -> Sẽ xem xét lại)
class Payment(BaseModel):
    METHOD_CHOICES = [
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('momo', 'MoMo'),
        ('zalopay', 'ZaloPay'),
        ('cash', 'Cash'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='payments')
    method = models.CharField(max_length=50,choices=METHOD_CHOICES)
    amount = models.DecimalField(max_digits=12,decimal_places=2)
    description = models.CharField(max_length=255,blank=True,null=True)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='pending')
    def __str__(self):
        return f"{self.user.username} - {self.amount}"