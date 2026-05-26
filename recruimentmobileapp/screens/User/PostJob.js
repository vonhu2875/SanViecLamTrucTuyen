import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { endpoints } from '../../configs/Apis';

const PostJob = ({ route, navigation }) => {
    
    const editJobData = route.params?.editJobData || null;
    const isEditMode = !!editJobData;
    console.log("DỮ LIỆU CŨ NHẬN ĐƯỢC:", editJobData);
    // 1. Quản lý trạng thái phân quyền dựa theo kiểm duyệt Backend
    const [hasCompany, setHasCompany] = useState(true);
    const [isApproved, setIsApproved] = useState(true);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 2. State lưu dữ liệu form đăng/sửa bài tuyển dụng
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [location, setLocation] = useState('');
    const [experience, setExperience] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [benefits, setBenefits] = useState('');
    
    // Quản lý lịch hạn nộp hồ sơ
    const [deadline, setDeadline] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Danh sách dữ liệu liên kết từ máy chủ
    const [categories, setCategories] = useState([]);
    const [skillsList, setSkillsList] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    
    useEffect(() => {
        navigation.setOptions({
            title: isEditMode ? "Chỉnh Sửa Tin Tuyển Dụng" : "Đăng Tin Tuyển Dụng"
        });
    }, [isEditMode]);
    // Tự động làm sạch hoặc điền dữ liệu form mỗi khi chuyển đổi giữa Đăng mới và Sửa
    useEffect(() => {
        if (isEditMode && editJobData) {
            setTitle(editJobData.title || '');
            setCategoryId(editJobData.category?.id || editJobData.category || '');
            setSalaryMin(String(editJobData.salary_min || ''));
            setSalaryMax(String(editJobData.salary_max || ''));
            setLocation(editJobData.location || '');
            setExperience(String(editJobData.experience_required || '0'));
            setDescription(editJobData.description || '');
            setRequirements(editJobData.requirements || '');
            setBenefits(editJobData.benefits || '');
            setDeadline(editJobData.deadline ? new Date(editJobData.deadline) : new Date());
            
            if (editJobData.skills) {
                const skillsIds = editJobData.skills.map(skill => typeof skill === 'object' ? skill.id : skill);
                setSelectedSkills(skillsIds);
            }
        } else {
            // Xóa sạch form nếu là chế độ Đăng bài mới
            setTitle('');
            setSalaryMin('');
            setSalaryMax('');
            setLocation('');
            setExperience('');
            setDescription('');
            setRequirements('');
            setBenefits('');
            setDeadline(new Date());
            setSelectedSkills([]);
            if (categories.length > 0) {
                setCategoryId(categories[0].id);
            }
        }
    }, [editJobData, isEditMode, categories]);

    // Hàm kiểm tra quyền hạn doanh nghiệp và load thông tin cấu hình danh mục
    const verifyEmployerStatusAndFetchData = async () => {
        try {
            setLoadingData(true);
            const token = await AsyncStorage.getItem('token');

            // Gọi API kiểm tra trạng thái công ty hiện tại của user
            const companyRes = await Apis.get('/companies/current-company/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const myCompany = companyRes.data;

            if (myCompany.is_approved === false) {
                setIsApproved(false);
                return;
            }

            setHasCompany(true);
            setIsApproved(true);

            // Tải danh mục ngành nghề và danh sách kỹ năng
            const [catRes, skillRes] = await Promise.all([
                Apis.get(endpoints['categories'] || '/categories/'),
                Apis.get(endpoints['skills'] || '/skills/')
            ]);
            
            const fetchedCategories = catRes.data.results || catRes.data;
            setCategories(fetchedCategories);
            setSkillsList(skillRes.data.results || skillRes.data);
            
            // Đặt danh mục mặc định ban đầu nếu đăng bài mới
            if (!isEditMode && fetchedCategories && fetchedCategories.length > 0) {
                setCategoryId(fetchedCategories[0].id);
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setHasCompany(false);
            } else {
                console.error("Lỗi xác thực hoặc tải cấu hình:", error);
                Alert.alert("Lỗi kết nối", "Không thể liên kết thông tin xác thực doanh nghiệp.");
            }
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        verifyEmployerStatusAndFetchData();
    }, []);

    // Xử lý chọn đa kỹ năng yêu cầu (Many-to-Many)
    const toggleSkill = (skillId) => {
        if (selectedSkills.includes(skillId)) {
            setSelectedSkills(selectedSkills.filter(id => id !== skillId));
        } else {
            setSelectedSkills([...selectedSkills, skillId]);
        }
    };

    // Định dạng chuỗi ngày chuẩn ISO (YYYY-MM-DD) gửi lên Django
    const formatDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    
    const handlePostJob = async () => {
        if (!title || !salaryMin || !salaryMax || !location || !description || !requirements || !benefits) {
            Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin bắt buộc có dấu (*)");
            return;
        }

        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('token');

            const jobData = {
                title: title,
                category: categoryId, 
                salary_min: parseFloat(salaryMin),
                salary_max: parseFloat(salaryMax),
                location: location,
                experience_required: parseInt(experience) || 0,
                deadline: formatDateString(deadline), 
                description: description,
                requirements: requirements,
                benefits: benefits,
                skills: selectedSkills 
            };

            let response;
            if (isEditMode) {
                response = await Apis.patch(`/jobs/${editJobData.id}/update-job/`, jobData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Chế độ đăng mới (POST)
                response = await Apis.post(endpoints['jobs'] || '/jobs/', jobData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Kiểm tra các mã thành công HTTP từ Backend trả về (200, 201)
            if (response.status === 200 || response.status === 201) {
                Alert.alert(
                    "Thành công", 
                    isEditMode ? "Tin tuyển dụng đã được cập nhật thành công." : "Tin tuyển dụng của doanh nghiệp đã được niêm yết công khai.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                navigation.goBack(); 
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error("Lỗi xử lý tin đăng:", error.response?.data || error.message);
            if (error.response && error.response.data && error.response.data.detail) {
                Alert.alert("Bị từ chối", error.response.data.detail);
            } else {
                Alert.alert("Thất bại", "Quá trình lưu thông tin xảy ra lỗi. Vui lòng thử lại sau.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <View style={styles.center}>
                <ActivityIndicator animating={true} color="#F2A0B6" size="large" />
                <Text style={{ marginTop: 12, color: '#666', fontSize: 14 }}>Đang xác thực quyền đăng tuyển...</Text>
            </View>
        );
    }

    if (!hasCompany) {
        return (
            <SafeAreaView style={styles.center}>
                <Card style={styles.alertCard}>
                    <Card.Content style={{ alignItems: 'center', paddingVertical: 10 }}>
                        <Text style={styles.alertTitle}>Chưa có thông tin công ty</Text>
                        <Text style={styles.alertDetail}>
                            Hệ thống yêu cầu bạn phải thiết lập và cập nhật hồ sơ doanh nghiệp hoàn chỉnh trước khi sử dụng tính năng này.
                        </Text>
                        <Button 
                            mode="contained" 
                            buttonColor="#F2A0B6" 
                            style={{ marginTop: 20, borderRadius: 8 }}
                            onPress={() => navigation.navigate('CreateCompany')}
                        >
                            Tạo hồ sơ công ty ngay
                        </Button>
                    </Card.Content>
                </Card>
            </SafeAreaView>
        );
    }

    if (!isApproved) {
        return (
            <SafeAreaView style={styles.center}>
                <Card style={styles.alertCard}>
                    <Card.Content style={{ alignItems: 'center', paddingVertical: 10 }}>
                        <Text style={styles.alertTitle}>Hồ sơ doanh nghiệp chờ duyệt</Text>
                        <Text style={styles.alertDetail}>
                            Hồ sơ doanh nghiệp của bạn đang được Ban quản trị hệ thống kiểm định thông tin pháp lý. Quyền đăng tin tuyển dụng sẽ tự động mở sau khi phê duyệt thành công.
                        </Text>
                        <Button 
                            mode="outlined" 
                            textColor="#F2A0B6" 
                            style={{ marginTop: 20, borderColor: '#F2A0B6', borderRadius: 8 }}
                            onPress={() => navigation.goBack()}
                        >
                            Quay lại trang chủ
                        </Button>
                    </Card.Content>
                </Card>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Card style={styles.card}>
                        <Card.Content style={{ gap: 14 }}>
                            <TextInput
                                label="Tiêu đề bài đăng tuyển (*)"
                                value={title}
                                onChangeText={setTitle}
                                mode="outlined"
                                activeOutlineColor="#F2A0B6"
                            />

                            <View style={styles.pickerContainer}>
                                <Text style={styles.pickerLabel}>Chuyên mục công việc (*)</Text>
                                <Picker
                                    selectedValue={categoryId}
                                    onValueChange={(itemValue) => setCategoryId(itemValue)}
                                    style={styles.picker}
                                >
                                    {categories.map(cat => (
                                        <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                                    ))}
                                </Picker>
                            </View>

                            <TextInput
                                label="Địa điểm làm việc (*)"
                                value={location}
                                onChangeText={setLocation}
                                mode="outlined"
                                activeOutlineColor="#F2A0B6"
                                placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                            />

                            <View style={styles.rowInputs}>
                                <TextInput
                                    label="Lương tối thiểu (*)"
                                    value={salaryMin}
                                    onChangeText={setSalaryMin}
                                    mode="outlined"
                                    keyboardType="numeric"
                                    activeOutlineColor="#F2A0B6"
                                    style={{ flex: 1 }}
                                />
                                <TextInput
                                    label="Lương tối đa (*)"
                                    value={salaryMax}
                                    onChangeText={setSalaryMax}
                                    mode="outlined"
                                    keyboardType="numeric"
                                    activeOutlineColor="#F2A0B6"
                                    style={{ flex: 1 }}
                                />
                            </View>

                            <TextInput
                                label="Kinh nghiệm yêu cầu (Số năm)"
                                value={experience}
                                onChangeText={setExperience}
                                mode="outlined"
                                keyboardType="numeric"
                                activeOutlineColor="#F2A0B6"
                                placeholder="Nhập 0 hoặc bỏ trống nếu không yêu cầu"
                            />

                            <View style={styles.dateRow}>
                                <Text style={styles.dateLabel}>Hạn nộp hồ sơ: {formatDateString(deadline)}</Text>
                                <Button mode="outlined" textColor="#F2A0B6" style={{ borderColor: '#F2A0B6' }} onPress={() => setShowDatePicker(true)}>
                                    Chọn ngày
                                </Button>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={deadline}
                                        mode="date"
                                        display="default"
                                        minimumDate={new Date()} 
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) setDeadline(selectedDate);
                                        }}
                                    />
                                )}
                            </View>

                            <Text style={styles.sectionSubTitle}>Yêu cầu kỹ năng chuyên môn:</Text>
                            <View style={styles.skillsWrapper}>
                                {skillsList.map(skill => {
                                    const isChecked = selectedSkills.includes(skill.id);
                                    return (
                                        <View key={skill.id} style={styles.skillItem}>
                                            <Checkbox
                                                status={isChecked ? 'checked' : 'unchecked'}
                                                onPress={() => toggleSkill(skill.id)}
                                                color="#F2A0B6"
                                            />
                                            <Text style={styles.skillText} onPress={() => toggleSkill(skill.id)}>
                                                {skill.name}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            <TextInput
                                label="Mô tả công việc chi tiết (*)"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"
                                multiline
                                numberOfLines={5}
                                activeOutlineColor="#F2A0B6"
                            />

                            <TextInput
                                label="Yêu cầu công việc chuyên môn (*)"
                                value={requirements}
                                onChangeText={setRequirements}
                                mode="outlined"
                                multiline
                                numberOfLines={5}
                                activeOutlineColor="#F2A0B6"
                            />

                            <TextInput
                                label="Chế độ đãi ngộ và Quyền lợi (*)"
                                value={benefits}
                                onChangeText={setBenefits}
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                activeOutlineColor="#F2A0B6"
                            />
                        </Card.Content>
                    </Card>

                    <Button
                        mode="contained"
                        onPress={handlePostJob}
                        loading={submitting}
                        disabled={submitting}
                        buttonColor="#F2A0B6"
                        style={styles.submitBtn}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    >
                        {submitting ? "Đang xử lý dữ liệu..." : (isEditMode ? "Cập nhật tin tuyển dụng" : "Xác nhận đăng bài")}
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#F2A0B6', marginBottom: 15, textAlign: 'center' },
    card: { backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
    rowInputs: { flexDirection: 'row', gap: 10 },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 5, backgroundColor: '#fff' },
    pickerLabel: { fontSize: 12, color: '#666', paddingLeft: 8, paddingTop: 2 },
    picker: { height: 50, width: '100%' },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5, paddingHorizontal: 4 },
    dateLabel: { fontSize: 14, fontWeight: '500', color: '#333' },
    sectionSubTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginTop: 10, marginBottom: -5 },
    skillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginVertical: 5 },
    skillItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
    skillText: { fontSize: 13, color: '#444', flexShrink: 1 },
    submitBtn: { marginTop: 25, paddingVertical: 6, borderRadius: 10, elevation: 2 },
    alertCard: { margin: 20, padding: 15, backgroundColor: '#fff', borderRadius: 12, elevation: 3 },
    alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginBottom: 12, textAlign: 'center' },
    alertDetail: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22 }
});

export default PostJob;