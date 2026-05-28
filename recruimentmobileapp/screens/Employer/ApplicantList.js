// screens/Employer/ApplicantList.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, ActivityIndicator, Searchbar, Icon } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApis, endpoints } from '../../configs/Apis';
import { COLORS } from '../../constants/Colors';


const STATUS_CONFIG = {
    pending:  { label: 'Chờ xem xét',  color: '#F59E0B', bg: '#FEF3C7' },
    reviewed: { label: 'Đã đánh giá',  color: '#3B82F6', bg: '#EFF6FF' },
    accepted: { label: 'Đã duyệt',     color: '#10B981', bg: '#E8F5E9' },
    rejected: { label: 'Từ chối',      color: '#EF4444', bg: '#FFEBEE' },
};

const ApplicantList = () => {
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
        navigation.setOptions({ title: jobTitle || 'Tất cả ứng viên' });
    }, [jobTitle]);

    const fetchApplications = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const url = jobId
                ? `${endpoints['applications']}?job_id=${jobId}`
                : endpoints['applications'];
            const res = await authApis(token).get(url);
            const data = res.data.results || res.data;
            setApps(data);
            setFiltered(data);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchApplications(); }, [jobId]);

    const hasEmployerComment = (application) => {
        return !!(application?.employer_comment && application.employer_comment.trim());
    };

    useEffect(() => {
        let result = [...apps];
        if (activeFilter === 'reviewed') {
            result = result.filter(a => hasEmployerComment(a));
        } else if (activeFilter !== 'all') {
            result = result.filter(a => a.status === activeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => {
                const fullName = `${a.candidate?.last_name || ''} ${a.candidate?.first_name || ''}`.toLowerCase();
                const username = a.candidate?.username?.toLowerCase() || '';
                const email = a.candidate?.email?.toLowerCase() || '';
                return fullName.includes(q) || username.includes(q) || email.includes(q);
            });
        }
        setFiltered(result);
    }, [activeFilter, searchQuery, apps]);

    const statusCounts = useMemo(() => {
        return apps.reduce((acc, app) => {
            if (acc[app.status] !== undefined) acc[app.status] += 1;
            if (hasEmployerComment(app)) acc.reviewed += 1;
            return acc;
        }, { pending: 0, reviewed: 0, accepted: 0, rejected: 0 });
    }, [apps]);

    const handleStatusUpdate = (updatedApplication) => {
        setApps(prev => prev.map(a => a.id === updatedApplication.id ? { ...a, ...updatedApplication } : a));
    };

    const renderItem = ({ item }) => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const candidateName = (item.candidate?.first_name || item.candidate?.last_name)
            ? `${item.candidate.last_name || ''} ${item.candidate.first_name || ''}`.trim()
            : item.candidate?.username || 'Ứng viên ẩn danh';

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('ApplicationDetail', {
                    application: item,
                    jobTitle,
                    onStatusUpdate: handleStatusUpdate,
                })}
            >
                {/* Avatar + Info */}
                <View style={styles.cardHeader}>
                    {item.candidate?.avatar ? (
                        <Avatar.Image size={46} source={{ uri: item.candidate.avatar }} />
                    ) : (
                        <Avatar.Text
                            size={46}
                            label={candidateName.substring(0, 2).toUpperCase()}
                            style={{ backgroundColor: COLORS.primaryLight || '#FCE4EC' }}
                            color={COLORS.primary}
                        />
                    )}
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{candidateName}</Text>
                        <Text style={styles.cardEmail} numberOfLines={1}>
                            {item.candidate?.email || 'Chưa cập nhật email'}</Text>
                        <View style={styles.cardJobContainer}>
                            <Icon source="briefcase" size={14} color="#6B7280" />
                            <Text style={styles.cardJob} numberOfLines={1}>
                                {item.job_title || jobTitle || `Công việc #${item.job}`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Status chip + Ngày — cùng 1 hàng, căn đều */}
                <View style={styles.cardMeta}>
                    <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.statusPillText, { color: cfg.color }]}>
                            {cfg.label}
                        </Text>
                    </View>
                    <Text style={styles.cardDate}>
                        {item.created_date
                            ? new Date(item.created_date).toLocaleDateString('vi-VN')
                            : ''}
                    </Text>
                </View>

                {/* Cover letter */}
                {item.cover_letter ? (
                    <Text style={styles.cardCover} numberOfLines={2}>
                        "{item.cover_letter}"
                    </Text>
                ) : null}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    return (
        <View style={styles.root}>
            <Searchbar
                placeholder="Tìm theo tên hoặc email..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchbar}
                iconColor={COLORS.primary}
            />

            <View style={{ marginBottom: 10 }}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryContainer}
                >
                    {[
                        { key: 'all',      label: `Tất cả (${apps.length})` },
                        { key: 'pending',  label: `Chờ xem xét (${statusCounts.pending})` },
                        { key: 'reviewed', label: `Đã đánh giá (${statusCounts.reviewed})` },
                        { key: 'accepted', label: `Đã duyệt (${statusCounts.accepted})` },
                        { key: 'rejected', label: `Từ chối (${statusCounts.rejected})` },
                    ].map(f => (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.categoryTab, activeFilter === f.key && styles.activeCategoryTab]}
                            onPress={() => setActiveFilter(f.key)}
                        >
                            <Text style={[styles.categoryTabText, activeFilter === f.key && styles.activeCategoryTabText]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchApplications(true)} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Avatar.Icon size={56} icon="account-off-outline"
                            style={{ backgroundColor: COLORS.primaryLight || '#FCE4EC' }}
                            color={COLORS.primary}
                        />
                        <Text style={styles.emptyText}>Không tìm thấy hồ sơ nào</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F9FAFB' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchbar: { margin: 12, marginBottom: 8, backgroundColor: '#fff', elevation: 1, borderRadius: 10 },

    // Filter chips — dùng TouchableOpacity thay Chip để kiểm soát size tốt hơn
    categoryContainer: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        alignItems: 'center',
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 1,
    },
    activeCategoryTab: {
        backgroundColor: COLORS.primaryLight || '#FFEBF0', // Nền hồng nhạt
        borderColor: COLORS.primary, // Viền hồng đậm
    },
    categoryTabText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    activeCategoryTabText: {
        color: COLORS.primary, // Chữ hồng đậm
        fontWeight: 'bold',
    },

    // Card
    card: {
        backgroundColor: '#fff', borderRadius: 12,
        padding: 14, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardInfo: { flex: 1, marginLeft: 12 },
    cardName: { fontSize: 15, fontWeight: '700', color: '#111827' },
    cardEmail: { fontSize: 12, color: '#6B7280', marginTop: 1 },
    cardJobContainer: {
    flexDirection: 'row',  // 🌟 BẮT BUỘC: Ép icon và chữ phải nằm trên cùng một hàng ngang
    alignItems: 'center',  // Giúp icon và chữ căn giữa đều nhau, không bị lệch lên lệch xuống
    gap: 6,                // Tạo khoảng cách trống vừa phải giữa icon và chữ
    marginTop: 4,          // Khoảng cách với dòng phía trên nó
    },
    cardJob: {
        fontSize: 12,
        color: '#6B7280',
        flex: 1,               // 🌟 BẮT BUỘC: Đoạn này giúp chữ tự động co giãn, nếu dài quá sẽ hiện "..." chứ không đẩy hàng
    },

    // Status + date — hàng riêng, không dùng Chip (tránh bị lệch height)
    cardMeta: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 4,
    },
    statusPill: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, alignSelf: 'flex-start',
    },
    statusPillText: { fontSize: 12, fontWeight: '600' },
    cardDate: { fontSize: 12, color: '#9CA3AF' },
    cardCover: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 6, lineHeight: 17 },

    empty: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { color: '#9CA3AF', fontSize: 14 },
});

export default ApplicantList;