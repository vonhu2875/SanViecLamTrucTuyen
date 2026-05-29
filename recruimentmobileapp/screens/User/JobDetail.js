import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, StyleSheet, Alert, SafeAreaView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text, Card, Avatar, Button, IconButton, Chip, ActivityIndicator, Divider, List } from 'react-native-paper';
import RenderHtml from 'react-native-render-html'; // Để hiển thị mượt mà nội dung RichTextField từ Django
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { endpoints } from '../../configs/Apis';
import MyUserContext from '../../configs/Contexts';
import Styles from '../../styles/Styles';

const JobDetail = ({ route, navigation }) => {
    const { jobId } = route.params; // Lấy ID của Job truyền từ màn hình danh sách sang
    const [user] = useContext(MyUserContext); // Kiểm tra role người dùng

    const [job, setJob] = useState(null);
    const [companyPreview, setCompanyPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const { width } = useWindowDimensions(); // Cần thiết cho bộ RenderHtml

    // 1. Lấy chi tiết công việc từ Backend
    const fetchJobDetail = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await Apis.get(`${endpoints['jobs']}${jobId}/`, { headers });
            setJob(response.data);
            setSaved(response.data.saved); // Đồng bộ trạng thái đã lưu từ Backend
        } catch (error) {
            console.error("Lỗi lấy chi tiết công việc:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin công việc này.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobDetail();
    }, [jobId]);

    useEffect(() => {
        const companyId = job?.employer?.id
        if (!companyId) return;

        const fetchCompanyPreview = async () => {
            try {
                const response = await Apis.get(endpoints['company-details'](companyId));
                setCompanyPreview(response.data);
            } catch (error) {
                console.error("Lỗi lấy nhanh thông tin công ty:", error);
            }
        };

        fetchCompanyPreview();
    }, [job]);

    // 2. Logic Lưu / Hủy lưu công việc (Khớp với @action save_job ở backend)
    const handleSaveJob = async () => {
        if (!user || user.role !== 'candidate') {
            Alert.alert("Thông báo", "Chỉ tài khoản Ứng viên mới có thể sử dụng tính năng này!");
            return;
        }

        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('token');
            
            // Gọi POST lên endpoint /api/jobs/{id}/save/
            const response = await Apis.post(endpoints['save-job'](jobId), {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                setSaved(response.data.saved); // Backend trả về trạng thái saved mới
                Alert.alert("Thông báo", response.data.saved ? "Đã lưu công việc thành công!" : "Đã bỏ lưu công việc!");
            }
        } catch (error) {
            console.error("Lỗi xử lý lưu công việc:", error);
            Alert.alert("Thất bại", "Không thể thực hiện tác vụ này.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: '#fff' }]}>
                <ActivityIndicator animating={true} color="#F2A0B6" size="large" />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy nội dung công việc.</Text>
            </View>
        );
    }

    const companyId = job?.employer?.id;
    const companyData = companyPreview || job?.employer;
    console.log(companyId)
    console.log(companyData)
    const handleOpenCompanyDetail = () => {
        if (!companyId) {
            Alert.alert('Thông báo', 'Không tìm thấy thông tin công ty để xem chi tiết.');
            return;
        }
        navigation.navigate('CompanyDetail', { companyId });
    };

    return (
        <SafeAreaView style={Styles.safeArea}>
            <ScrollView contentContainerStyle={[Styles.container]}>
                {/* Khối đầu trang: Thông tin công ty & Tiêu đề Job */}
                <Card style={styles.headerCard}>
                    <Card.Content style={styles.headerContent}>
                        <Avatar.Image 
                            size={70} 
                            source={job.employer?.logo ? { uri: job.employer.logo } : require('../../assets/icon.png')} 
                            style={styles.logo}
                        />
                        <Text style={styles.titleText}>{job.title}</Text>
                        <Text style={styles.companyText}>{job.employer?.name}</Text>
                        
                        <View style={styles.rowInfo}>
                            <Chip icon="map-marker" style={styles.chip} textStyle={styles.chipText} compact={false}>
                                {job.location}
                            </Chip>
                            <Chip icon="cash" style={styles.chip} textStyle={styles.chipText} compact={false}>
                                {parseFloat(job.salary_min).toLocaleString()} - {parseFloat(job.salary_max).toLocaleString()} VNĐ
                            </Chip>
                        </View>
                        
                        {/* Nút lưu bài đăng nằm gọn gàng góc phải */}
                        <IconButton
                            icon={saved ? "bookmark" : "bookmark-outline"}
                            iconColor={saved ? "#F2A0B6" : "gray"}
                            size={28}
                            onPress={handleSaveJob}
                            disabled={saving}
                            style={styles.saveButton}
                        />
                    </Card.Content>
                </Card>

                {/* Khối hiển thị kỹ năng yêu cầu */}
                {job.skills && job.skills.length > 0 && (
                    <Card style={styles.contentCard}>
                        <Card.Title title="Kỹ năng yêu cầu" titleStyle={styles.sectionTitle} />
                        <Card.Content style={styles.skillsContainer}>
                            {job.skills.map(skill => (
                                <View key={skill.id} style={styles.skillPill}>
                                    <Text style={styles.skillPillText}>{skill.name}</Text>
                                </View>
                            ))}
                        </Card.Content>
                    </Card>
                )}

                {/* Khối chi tiết Mô tả công việc (Dùng RenderHtml để xử lý dữ liệu từ RichTextField) */}
                <Card style={styles.contentCard}>
                    <Card.Title title="Mô tả công việc" titleStyle={styles.sectionTitle} />
                    <Card.Content>
                        <RenderHtml contentWidth={width} source={{ html: job.description }} />
                    </Card.Content>
                </Card>

                {/* Khối Yêu cầu công việc */}
                <Card style={styles.contentCard}>
                    <Card.Title title="Yêu cầu ứng viên" titleStyle={styles.sectionTitle} />
                    <Card.Content>
                        <RenderHtml contentWidth={width} source={{ html: job.requirements }} />
                    </Card.Content>
                </Card>

                {/* Khối Quyền lợi */}
                <Card style={styles.contentCard}>
                    <Card.Title title="Quyền lợi được hưởng" titleStyle={styles.sectionTitle} />
                    <Card.Content>
                        <RenderHtml contentWidth={width} source={{ html: job.benefits }} />
                    </Card.Content>
                </Card>

                {/* Khối Thông tin thêm phụ */}
                <Card style={styles.contentCard}>
                    <Card.Content>
                        <Text style={styles.subInfo}>• Kinh nghiệm yêu cầu: {job.experience_required} năm</Text>
                        <Text style={styles.subInfo}>• Hạn nộp hồ sơ: {job.deadline}</Text>
                        <Text style={styles.subInfo}>• Chuyên mục: {job.category?.name}</Text>
                    </Card.Content>
                </Card>

                {/* Khối thông tin công ty (bấm để xem chi tiết) */}
                <TouchableOpacity activeOpacity={0.85} onPress={handleOpenCompanyDetail}>
                    <Card style={styles.contentCard}>
                        <Card.Title
                            title="Thông tin công ty"
                            titleStyle={styles.sectionTitle}
                            right={(props) => <IconButton {...props} icon="chevron-right" iconColor="#9CA3AF" />}
                        />
                        <Divider />
                        <Card.Content style={{ paddingTop: 8 }}>
                            <List.Item
                                title="Tên công ty"
                                description={companyData?.name || 'Chưa cập nhật'}
                                left={(props) => <List.Icon {...props} icon="office-building" color="#F2A0B6" />}
                                titleStyle={styles.infoTitle}
                            />
                            <Divider style={styles.infoDivider} />
                            <List.Item
                                title="Địa chỉ"
                                description={companyData?.address || job.location || 'Chưa cập nhật'}
                                left={(props) => <List.Icon {...props} icon="map-marker" color="#F2A0B6" />}
                                titleStyle={styles.infoTitle}
                            />
                            <Divider style={styles.infoDivider} />
                            <List.Item
                                title="Website"
                                description={companyData?.website || 'Chưa cập nhật'}
                                left={(props) => <List.Icon {...props} icon="web" color="#F2A0B6" />}
                                titleStyle={styles.infoTitle}
                                descriptionStyle={companyData?.website ? styles.websiteText : undefined}
                            />
                            <Divider style={styles.infoDivider} />
                            <List.Item
                                title="Giới thiệu"
                                description={companyData?.description || 'Nhấn để xem đầy đủ hồ sơ công ty'}
                                left={(props) => <List.Icon {...props} icon="text-box-outline" color="#F2A0B6" />}
                                titleStyle={styles.infoTitle}
                                descriptionNumberOfLines={3}
                                descriptionStyle={{ lineHeight: 20 }}
                            />
                        </Card.Content>
                    </Card>
                </TouchableOpacity>

                {/* Nút ứng tuyển dành riêng cho ứng viên */}
                {user?.role === 'candidate' && (
                    <Button 
                        mode="contained" 
                        buttonColor="#F2A0B6"
                        style={styles.applyBtn}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                        onPress={() => navigation.navigate('ApplyJob', { jobId: job.id, jobTitle: job.title })}
                    >
                        Ứng tuyển ngay
                    </Button>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 2, marginBottom: 15, position: 'relative' },
    headerContent: { alignItems: 'center', paddingTop: 20 },
    logo: { backgroundColor: '#f0f0f0', marginBottom: 10 },
    titleText: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', paddingHorizontal: 20 },
    companyText: { fontSize: 15, color: '#666', marginTop: 5, marginBottom: 10, textAlign: 'center' },
    rowInfo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginVertical: 5, paddingHorizontal: 8 },
    chip: {
        backgroundColor: '#FFF0F3',
        borderRadius: 20,
        alignSelf: 'flex-start',
        maxWidth: '100%',
        paddingVertical: 4,
    },
    chipText: { color: '#F2A0B6', fontSize: 12, fontWeight: 'bold', lineHeight: 18 },
    saveButton: { position: 'absolute', top: 5, right: 5 },
    contentCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 1, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#F2A0B6' },
    infoTitle: { fontSize: 12, color: '#999' },
    infoDivider: { marginHorizontal: 16, backgroundColor: '#f0f0f0' },
    websiteText: { color: '#1565C0' },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingBottom: 4,
    },
    skillPill: {
        borderWidth: 1,
        borderColor: '#F2A0B6',
        backgroundColor: '#FFF0F3',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
        maxWidth: '100%',
    },
    skillPillText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#444',
        flexShrink: 1,
    },
    subInfo: { fontSize: 14, color: '#555', marginVertical: 4 },
    applyBtn: { marginVertical: 15, borderRadius: 10, paddingVertical: 4 },
});

export default JobDetail;