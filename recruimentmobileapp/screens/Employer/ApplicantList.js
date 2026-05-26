// screens/Employer/ApplicationList.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Alert, RefreshControl } from 'react-native';
import { Card, Text, Avatar, Button, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { authApis, endpoints } from '../../configs/Apis';
import { COLORS } from '../../constants/Colors';
import Styles from '../../styles/Styles';

const STATUS_CONFIG = {
    pending:  { label: 'Chờ xem xét', color: '#F59E0B', bg: '#FEF3C7', icon: 'clock-outline' },
    reviewed: { label: 'Đang xem xét', color: '#3B82F6', bg: '#EFF6FF', icon: 'eye-outline' },
    accepted: { label: 'Đã duyệt',    color: '#10B981', bg: '#E8F5E9', icon: 'check-circle-outline' },
    rejected: { label: 'Từ chối',     color: '#EF4444', bg: '#FFEBEE', icon: 'close-circle-outline' },
};

const ApplicationList = () => {
    const route = useRoute();
    const { jobTitle } = route.params || {};

    const [apps, setApps] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchApplications = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['applications']);
            const data = res.data.results || res.data;
            setApps(data);
            setFiltered(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách ứng viên:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // Lọc theo status + search
    useEffect(() => {
        let result = [...apps];
        if (activeFilter !== 'all') {
            result = result.filter(a => a.status === activeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.candidate?.username?.toLowerCase().includes(q) ||
                a.job_title?.toLowerCase().includes(q)
            );
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
                            await authApis(token).patch(
                                endpoints['review-application'](id),
                                { status: newStatus, employer_comment: `Đã cập nhật: ${cfg.label}` }
                            );
                            setApps(prev => prev.map(a =>
                                a.id === id ? { ...a, status: newStatus } : a
                            ));
                            Alert.alert('Thành công', `Đã cập nhật: ${cfg.label}`);
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        return (
            <Card style={[Styles.appCard, { backgroundColor: COLORS.cardBg }]} elevation={2}>
                <Card.Content>
                    {/* HEADER: Avatar + Tên + Job */}
                    <View style={Styles.appCardHeaderRow}>
                        <Avatar.Text
                            size={46}
                            label={(item.candidate?.username || 'CV').substring(0, 2).toUpperCase()}
                            style={[Styles.appCardAvatar, { backgroundColor: COLORS.primaryLight }]}
                            color={COLORS.primary}
                        />
                        <View style={Styles.appCardInfo}>
                            <Text style={[Styles.appCardName, { color: COLORS.textDarker }]}>
                                {item.candidate?.username || 'Ẩn danh'}
                            </Text>
                            <Text style={[Styles.appCardEmail, { color: COLORS.textLight }]} numberOfLines={1}>
                                {item.candidate?.email || 'Chưa có email'}
                            </Text>
                            <Text style={[Styles.appCardJobTitle, { color: COLORS.textLight }]} numberOfLines={1}>
                                💼 {item.job_title || `Job #${item.job}`}
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
                            {new Date(item.created_date).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>

                    {/* THƯ GIỚI THIỆU */}
                    {item.cover_letter ? (
                        <Text
                            style={[Styles.appCardCoverLetter, { color: COLORS.textLight }]}
                            numberOfLines={2}
                        >
                            "{item.cover_letter}"
                        </Text>
                    ) : null}

                    {/* ACTIONS */}
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

                        {item.status === 'pending' && (
                            <View style={Styles.appCardActionBtns}>
                                <Button
                                    mode="outlined"
                                    textColor="#EF4444"
                                    style={{ borderColor: '#EF4444' }}
                                    compact
                                    onPress={() => handleReview(item.id, item.candidate?.username, 'rejected')}
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    mode="contained"
                                    buttonColor="#10B981"
                                    compact
                                    onPress={() => handleReview(item.id, item.candidate?.username, 'accepted')}
                                >
                                    Duyệt
                                </Button>
                            </View>
                        )}

                        {item.status === 'reviewed' && (
                            <View style={Styles.appCardActionBtns}>
                                <Button
                                    mode="outlined"
                                    textColor="#EF4444"
                                    style={{ borderColor: '#EF4444' }}
                                    compact
                                    onPress={() => handleReview(item.id, item.candidate?.username, 'rejected')}
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    mode="contained"
                                    buttonColor="#10B981"
                                    compact
                                    onPress={() => handleReview(item.id, item.candidate?.username, 'accepted')}
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
                                onPress={() => handleReview(item.id, item.candidate?.username, 'pending')}
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
        <View style={[Styles.appListRoot, { backgroundColor: COLORS.background }]}>
            {/* HEADER */}
            <View style={Styles.appListHeader}>
                <Text style={[Styles.appListTitle, { color: COLORS.textDarker }]}>
                    {jobTitle || 'Danh sách ứng viên'}
                </Text>

                {/* SEARCH */}
                <Searchbar
                    placeholder="Tìm theo tên, vị trí..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[Styles.appListSearchbar, { backgroundColor: COLORS.cardBg }]}
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
                contentContainerStyle={[Styles.appListFlatList, { backgroundColor: COLORS.background }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchApplications(true)}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={Styles.appListEmpty}>
                        <Avatar.Icon
                            size={60} icon="account-off-outline"
                            style={{ backgroundColor: COLORS.primaryLight }}
                            color={COLORS.primary}
                        />
                        <Text style={[Styles.appListEmptyText, { color: COLORS.textLight }]}>
                            Không có hồ sơ nào
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

export default ApplicationList;