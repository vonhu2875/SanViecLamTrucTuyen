// screens/Employer/EmployerDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, ActivityIndicator, Avatar, Button, Chip, Icon } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect} from '@react-navigation/native';
import Apis,{ authApis, endpoints } from '../../configs/Apis';
import MyUserContext from '../../configs/Contexts';
import { COLORS } from '../../constants/Colors';
import Styles from '../../styles/Styles';

const EmployerDashboard = () => {
    const [user] = useContext(MyUserContext);
    const navigation = useNavigation();
    const [stats, setStats] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Đoạn code mới tự động re-fetch dữ liệu khi màn hình được Focus (hiển thị lại)
    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const token = await AsyncStorage.getItem('token');
                    const [statsRes, jobsRes] = await Promise.all([
                        authApis(token).get(endpoints['employer-stats']).catch(() => null),
                        authApis(token).get(`${endpoints['jobs']}?my_jobs=true`).catch(() => null),
                    ]);
                    if (statsRes) setStats(statsRes.data);
                    if (jobsRes) setJobs(jobsRes.data.results || jobsRes.data);
                } catch (error) {
                    console.error("Lỗi dashboard:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
            
            return () => {
            };
        }, [])
    );
    const getStatusCount = (statusName) => {
        if (!stats?.applications_by_status) return 0;
        const found = stats.applications_by_status.find(s => s.status === statusName);
        return found ? found.count : 0;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }
    
    const handleEditPress = async (jobId) => {
        try {
            const response = await Apis.get(`/jobs/${jobId}/`); 
            navigation.navigate('PostJob', { editJobData: response.data });
        } catch (error) {
            console.error("Lỗi lấy chi tiết công việc:", error);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={[Styles.dashScrollContainer, { backgroundColor: COLORS.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* STATS — 3 thẻ hàng ngang */}
            <View style={Styles.dashStatsRow}>
                <Card style={[Styles.dashStatCard, { backgroundColor: COLORS.cardBg }]} elevation={2}>
                    <Card.Content style={Styles.dashStatCardContent}>
                        <Avatar.Icon
                            size={36} icon="briefcase"
                            style={{ backgroundColor: COLORS.primaryLight }}
                            color={COLORS.primary}
                        />
                        <Text style={[Styles.dashStatNumber, { color: COLORS.textDarker }]}>
                            {jobs.length}
                        </Text>
                        <Text style={[Styles.dashStatLabel, { color: COLORS.textLight }]}>Tin đã đăng</Text>
                    </Card.Content>
                </Card>

                <Card style={[Styles.dashStatCard, { backgroundColor: COLORS.cardBg }]} elevation={2}>
                    <Card.Content style={Styles.dashStatCardContent}>
                        <Avatar.Icon
                            size={36} icon="file-document-multiple"
                            style={{ backgroundColor: '#E8F5E9' }}
                            color="#10B981"
                        />
                        <Text style={[Styles.dashStatNumber, { color: COLORS.textDarker }]}>
                            {stats?.total_applications || 0}
                        </Text>
                        <Text style={[Styles.dashStatLabel, { color: COLORS.textLight }]}>Tổng CV</Text>
                    </Card.Content>
                </Card>

                <Card style={[Styles.dashStatCard, { backgroundColor: COLORS.cardBg }]} elevation={2}>
                    <Card.Content style={Styles.dashStatCardContent}>
                        <Avatar.Icon
                            size={36} icon="check-circle"
                            style={{ backgroundColor: '#E8F5E9' }}
                            color="#10B981"
                        />
                        <Text style={[Styles.dashStatNumber, { color: '#10B981' }]}>
                            {getStatusCount('accepted')}
                        </Text>
                        <Text style={[Styles.dashStatLabel, { color: COLORS.textLight }]}>Đã duyệt</Text>
                    </Card.Content>
                </Card>
            </View>

            {/* STATS CHI TIẾT — pending / reviewed / rejected */}
            <Card style={[Styles.dashBreakdownCard, { backgroundColor: COLORS.cardBg }]} elevation={2}>
                <Card.Content>
                    <Text style={[Styles.dashBreakdownTitle, { color: COLORS.textDarker }]}>
                        Phân loại hồ sơ
                    </Text>
                    <View style={Styles.dashBreakdownRow}>
                        <View style={Styles.dashBreakdownItem}>
                            <Text style={[Styles.dashBreakdownNumber, { color: '#F59E0B' }]}>
                                {getStatusCount('pending')}
                            </Text>
                            <Text style={[Styles.dashBreakdownLabel, { color: COLORS.textLight }]}>Chờ xem xét</Text>
                        </View>
                        <View style={[Styles.dashBreakdownDivider, { backgroundColor: COLORS.border }]} />
                        <View style={Styles.dashBreakdownItem}>
                            <Text style={[Styles.dashBreakdownNumber, { color: '#3B82F6' }]}>
                                {getStatusCount('reviewed')}
                            </Text>
                            <Text style={[Styles.dashBreakdownLabel, { color: COLORS.textLight }]}>Đang xem xét</Text>
                        </View>
                        <View style={[Styles.dashBreakdownDivider, { backgroundColor: COLORS.border }]} />
                        <View style={Styles.dashBreakdownItem}>
                            <Text style={[Styles.dashBreakdownNumber, { color: '#EF4444' }]}>
                                {getStatusCount('rejected')}
                            </Text>
                            <Text style={[Styles.dashBreakdownLabel, { color: COLORS.textLight }]}>Từ chối</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* DANH SÁCH TIN TUYỂN DỤNG */}
            <View style={Styles.dashJobsHeaderRow}>
                <Text style={[Styles.dashJobsTitle, { color: COLORS.textDarker }]}>
                    Tin tuyển dụng của bạn
                </Text>
                <Text style={[Styles.dashJobsCount, { color: COLORS.textLight }]}>
                    {jobs.length} tin
                </Text>
            </View>

            {jobs.length === 0 ? (
                <Card style={{ backgroundColor: COLORS.cardBg }} elevation={1}>
                    <Card.Content style={Styles.dashEmptyCardContent}>
                        <Avatar.Icon
                            size={50} icon="briefcase-off"
                            style={{ backgroundColor: COLORS.primaryLight }}
                            color={COLORS.primary}
                        />
                        <Text style={[Styles.dashEmptyText, { color: COLORS.textLight }]}>
                            Bạn chưa đăng tin tuyển dụng nào
                        </Text>
                    </Card.Content>
                </Card>
            ) : (
                jobs.map((job) => (
                    <Card key={job.id} style={[Styles.dashJobCard, { backgroundColor: COLORS.cardBg }]} elevation={2}>
                        <Card.Content>
                            <View style={Styles.dashJobCardInner}>
                                <View style={Styles.dashJobCardLeft}>
                                    <Text style={[Styles.dashJobTitle, { color: COLORS.textDarker }]} numberOfLines={2}>
                                        {job.title}
                                    </Text>
                                    <View style={Styles.dashJobMetaContainer}>
                                        <Icon source="map-marker-outline" size={14} color={COLORS.textLight} />
                                        <Text style={[Styles.dashJobMeta, { color: COLORS.textLight }]} numberOfLines={1}>
                                            {job.location}
                                        </Text>
                                    </View>
                                    <View style={Styles.dashJobMetaContainer}>
                                        <Icon source="cash" size={14} color={COLORS.textLight} />
                                        <Text style={[Styles.dashJobSalary, { color: COLORS.textLight }]} numberOfLines={1}>
                                            {Number(job.salary_min).toLocaleString('vi-VN')} – {Number(job.salary_max).toLocaleString('vi-VN')} đ
                                        </Text>
                                    </View>
                                    <Text style={[Styles.dashJobDeadline, { color: COLORS.textMuted }]}>
                                        Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                                    </Text>
                                </View>
                                <Chip
                                    style={{ backgroundColor: job.active ? '#E8F5E9' : '#FEF3C7' }}
                                    textStyle={{ fontSize: 11, color: job.active ? '#10B981' : '#B45309' }}
                                >
                                    {job.active ? 'Đang tuyển' : 'Đã đóng'}
                                </Chip>
                            </View>
                        </Card.Content>

                        <Card.Actions style={{ paddingTop: 0 }}>
                            <Button
                                mode="text"
                                textColor={COLORS.primary}
                                icon="account-group-outline"
                                compact
                                onPress={() => navigation.navigate('StackApplicantList', {
                                    jobId: job.id,
                                    jobTitle: job.title
                                })}
                            >
                                Xem ứng viên
                            </Button>
                            <Button
                                mode="text"
                                textColor={COLORS.textLight}
                                icon="pencil-outline"
                                compact
                                
                                onPress={() => {handleEditPress(job.id)}}
                            >
                                Chỉnh sửa
                            </Button>
                        </Card.Actions>
                    </Card>
                ))
            )}
        </ScrollView>
    );
};

export default EmployerDashboard;
