// screens/Employer/ApplicationList.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, RefreshControl } from 'react-native';
import { Card, Text, Avatar, Button, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApis, endpoints } from '../../configs/Apis';
import { COLORS } from '../../constants/Colors';
import Styles from '../../styles/Styles';

const STATUS_CONFIG = {
    pending:  { label: 'Chờ xem xét', color: '#F59E0B', bg: '#FEF3C7', icon: 'clock-outline' },
    reviewed: { label: 'Đang xem xét', color: '#3B82F6', bg: '#EFF6FF', icon: 'eye-outline' },
    accepted: { label: 'Đã duyệt',     color: '#10B981', bg: '#E8F5E9', icon: 'check-circle-outline' },
    rejected: { label: 'Từ chối',      color: '#EF4444', bg: '#FFEBEE', icon: 'close-circle-outline' },
};

const ApplicationList = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId, jobTitle } = route.params || {};

    const [apps, setApps] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    useEffect(() => {
        navigation.setOptions({
            title: jobId && jobTitle ? `${jobTitle}` : 'Tất cả ứng viên'
        });
    }, [jobId, jobTitle]);

    const fetchApplications = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['applications']);
            const data = res.data.results || res.data;
            
            // LỌC AN TOÀN: Nếu màn hình trước truyền sang jobId cụ thể thì lọc theo Job, 
            // nếu không có jobId (xem toàn bộ ứng viên công ty) thì lấy hết data từ API trả về.
            const matchedApplications = jobId 
                ? data.filter(item => String(item.job) === String(jobId))
                : data;

            setApps(matchedApplications);
            setFiltered(matchedApplications);
        } catch (error) {
            console.error("Lỗi lấy danh sách ứng viên:", error);
            Alert.alert("Lỗi", "Không thể lấy dữ liệu danh sách ứng tuyển.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    // Bộ lọc Status + Tìm kiếm chuỗi văn bản
    useEffect(() => {
        let result = [...apps];
        if (activeFilter !== 'all') {
            result = result.filter(a => a.status === activeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => {
                const fullName = `${a.candidate?.last_name || ''} ${a.candidate?.first_name || ''}`.toLowerCase();
                return (
                    fullName.includes(q) ||
                    a.candidate?.username?.toLowerCase().includes(q) ||
                    a.candidate?.email?.toLowerCase().includes(q) ||
                    a.job_title?.toLowerCase().includes(q)
                );
            });
        }
        setFiltered(result);
    }, [activeFilter, searchQuery, apps]);

    const handleReview = async (id, candidateName, newStatus) => {
        const cfg = STATUS_CONFIG[newStatus];
        Alert.alert(
            `Xác nhận: ${cfg.label}`,
            `Cập nhật trạng thái hồ sơ của ${candidateName}?`,
            [
                { text: 'Huỷ', style: 'cancel' },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            // Gọi đến endpoint PATCH /api/applications/{id}/review/
                            await authApis(token).patch(
                                `${endpoints['applications']}${id}/review/`,
                                { status: newStatus, employer_comment: `Đã cập nhật: ${cfg.label}` }
                            );
                            setApps(prev => prev.map(a =>
                                a.id === id ? { ...a, status: newStatus } : a
                            ));
                            Alert.alert('Thành công', `Đã cập nhật: ${cfg.label}`);
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

        // Xử lý chuỗi hiển thị tên ứng viên rõ ràng
        const candidateDisplayName = (item.candidate?.first_name || item.candidate?.last_name)
            ? `${item.candidate.last_name || ''} ${item.candidate.first_name || ''}`.trim()
            : item.candidate?.username || 'Ứng viên ẩn danh';

        return (
            <Card style={[Styles.appCard, { backgroundColor: COLORS.cardBg, marginBottom: 12 }]} elevation={2}>
                <Card.Content>
                    {/* HEADER: Avatar + Tên + Vị trí */}
                    <View style={Styles.appCardHeaderRow}>
                        {item.candidate?.avatar ? (
                            <Avatar.Image
                                size={46}
                                source={{ uri: item.candidate.avatar }}
                                style={Styles.appCardAvatar}
                            />
                        ) : (
                            <Avatar.Text
                                size={46}
                                label={candidateDisplayName.substring(0, 2).toUpperCase()}
                                style={[Styles.appCardAvatar, { backgroundColor: COLORS.primaryLight }]}
                                color={COLORS.primary}
                            />
                        )}
                        
                        <View style={Styles.appCardInfo}>
                            <Text style={[Styles.appCardName, { color: COLORS.textDarker, fontWeight: 'bold', fontSize: 16 }]}>
                                {candidateDisplayName}
                            </Text>
                            <Text style={[Styles.appCardEmail, { color: COLORS.textLight }]} numberOfLines={1}>
                                {item.candidate?.email || 'Chưa cập nhật email'}
                            </Text>
                            <Text style={[Styles.appCardJobTitle, { color: COLORS.textLight, marginTop: 2 }]} numberOfLines={1}>
                                💼 {item.job_title || jobTitle || `Mã công việc: #${item.job}`}
                            </Text>
                        </View>
                    </View>

                    {/* STATUS + NGÀY NỘP */}
                    <View style={Styles.appCardStatusRow}>
                        <Chip
                            icon={cfg.icon}
                            style={{ backgroundColor: cfg.bg }}
                            textStyle={{ color: cfg.color, fontSize: 11 }}
                        >
                            {cfg.label}
                        </Chip>
                        <Text style={[Styles.appCardDate, { color: COLORS.textMuted }]}>
                            {item.created_date ? new Date(item.created_date).toLocaleDateString('vi-VN') : ''}
                        </Text>
                    </View>

                    {/* THƯ GIỚI THIỆU */}
                    {item.cover_letter ? (
                        <Text
                            style={[Styles.appCardCoverLetter, { color: COLORS.textLight, fontStyle: 'italic', marginVertical: 8 }]}
                            numberOfLines={3}
                        >
                            "{item.cover_letter}"
                        </Text>
                    ) : null}

                    {/* ACTIONS BUTTONS */}
                    <View style={Styles.appCardActions}>
                        <Button
                            mode="outlined"
                            icon="file-document-outline"
                            textColor={COLORS.primary}
                            style={{ borderColor: COLORS.primary }}
                            compact
                            onPress={() => {
                                if (item.cv_file) Linking.openURL(item.cv_file);
                                else Alert.alert('Thông báo', 'Ứng viên chưa đính kèm CV.');
                            }}
                        >
                            Xem CV
                        </Button>

                        {(item.status === 'pending' || item.status === 'reviewed') && (
                            <View style={Styles.appCardActionBtns}>
                                <Button
                                    mode="outlined"
                                    textColor="#EF4444"
                                    style={{ borderColor: '#EF4444', marginRight: 6 }}
                                    compact
                                    onPress={() => handleReview(item.id, candidateDisplayName, 'rejected')}
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    mode="contained"
                                    buttonColor="#10B981"
                                    compact
                                    onPress={() => handleReview(item.id, candidateDisplayName, 'accepted')}
                                >
                                    Duyệt
                                </Button>
                            </View>
                        )}

                        {(item.status === 'accepted' || item.status === 'rejected') && (
                            <Button
                                mode="text"
                                textColor={COLORS.textLight}
                                compact
                                onPress={() => handleReview(item.id, candidateDisplayName, 'pending')}
                            >
                                Đặt lại
                            </Button>
                        )}
                    </View>
                </Card.Content>
            </Card>
        );
    };

    if (loading) {
        return (
            <View style={[Styles.appListEmpty, { flex: 1, justifyContent: 'center', backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={[Styles.appListRoot, { backgroundColor: COLORS.background, flex: 1 }]}>
            {/* HEADER */}
            <View style={Styles.appListHeader}>
                <Text style={[Styles.appListTitle, { color: COLORS.textDarker, fontWeight: 'bold', marginBottom: 8, fontSize: 18 }]} numberOfLines={2}>
                    {jobTitle || 'Tất cả ứng viên ứng tuyển'}
                </Text>

                {/* SEARCH */}
                <Searchbar
                    placeholder="Tìm theo tên, email hoặc vị trí..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[Styles.appListSearchbar, { backgroundColor: COLORS.cardBg, marginBottom: 10 }]}
                    iconColor={COLORS.primary}
                />

                {/* FILTER CHIPS */}
                <View style={Styles.appListChipRow}>
                    {[
                        { key: 'all',      label: `Tất cả (${apps.length})` },
                        { key: 'pending',  label: `Chờ (${apps.filter(a => a.status === 'pending').length})` },
                        { key: 'accepted', label: `Duyệt (${apps.filter(a => a.status === 'accepted').length})` },
                        { key: 'rejected', label: `Từ chối (${apps.filter(a => a.status === 'rejected').length})` },
                    ].map(f => (
                        <Chip
                            key={f.key}
                            selected={activeFilter === f.key}
                            onPress={() => setActiveFilter(f.key)}
                            style={{
                                backgroundColor: activeFilter === f.key ? COLORS.primary : COLORS.cardBg,
                                marginRight: 5
                            }}
                            textStyle={{
                                color: activeFilter === f.key ? COLORS.white : COLORS.textLight,
                                fontSize: 11,
                            }}
                        >
                            {f.label}
                        </Chip>
                    ))}
                </View>
            </View>

            {/* LIST */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={[Styles.appListFlatList, { backgroundColor: COLORS.background, paddingHorizontal: 10 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchApplications(true)}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={[Styles.appListEmpty, { alignItems: 'center', marginTop: 40 }]}>
                        <Avatar.Icon
                            size={60} icon="account-off-outline"
                            style={{ backgroundColor: COLORS.primaryLight }}
                            color={COLORS.primary}
                        />
                        <Text style={[Styles.appListEmptyText, { color: COLORS.textLight, marginTop: 10, textAlign: 'center' }]}>
                            Không tìm thấy hồ sơ ứng tuyển nào
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

export default ApplicationList;