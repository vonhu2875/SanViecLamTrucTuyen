// screens/Employer/EmployerStats.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import { COLORS } from '../../constants/Colors';
import Styles from '../../styles/Styles'; // <-- Import file style chung ở đây

// ─── Màu sắc biểu đồ tháng ───────────────────────────────────
const BAR_COLOR = COLORS.primary || '#4F46E5';
const BAR_INACTIVE = '#E5E7EB';

// ─── Màu theo trạng thái đơn ứng tuyển ───────────────────────
const STATUS_CONFIG = {
    pending:  { label: 'Chờ duyệt',   color: '#F59E0B', icon: 'clock-outline' },
    reviewed: { label: 'Đã xem',       color: '#3B82F6', icon: 'eye-outline' },
    accepted: { label: 'Chấp nhận',    color: '#10B981', icon: 'check-circle-outline' },
    rejected: { label: 'Từ chối',      color: '#EF4444', icon: 'close-circle-outline' },
};

// ─── Component: Thẻ thống kê tổng quan ───────────────────────
const StatCard = ({ icon, value, label, iconColor, bgLight }) => (
    <View style={Styles.statsCard}>
        <View style={[Styles.statsIconWrapper, { backgroundColor: bgLight }]}>
            <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={Styles.statsCardValue}>{value}</Text>
        <Text style={Styles.statsCardLabel}>{label}</Text>
    </View>
);

// ─── Component: Thanh trạng thái tiến trình ─────────────────
const StatusRow = ({ statusKey, count, total }) => {
    const config = STATUS_CONFIG[statusKey] || { label: statusKey, color: '#6B7280', icon: 'help-circle-outline' };
    const percent = total > 0 ? (count / total) * 100 : 0;

    return (
        <View style={Styles.statsStatusRow}>
            <View style={Styles.statsStatusInfo}>
                <MaterialCommunityIcons name={config.icon} size={16} color={config.color} />
                <Text style={Styles.statsStatusLabel}>{config.label}</Text>
            </View>
            <View style={Styles.statsBarContainer}>
                <View style={[Styles.statsBarFill, { width: `${percent}%`, backgroundColor: config.color }]} />
            </View>
            <Text style={[Styles.statsStatusCount, { color: config.color }]}>{count}</Text>
        </View>
    );
};

// ─── Component: Biểu đồ cột theo tháng ──────────────────────
const MonthlyBarChart = ({ data }) => {
    const MONTHS = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
    
    const filledData = MONTHS.map((_, i) => {
        const found = data.find(d => d.month === i + 1);
        return found ? found.count : 0;
    });

    const maxCount = Math.max(...filledData, 1);

    return (
        <View style={Styles.statsChartContainer}>
            <View style={Styles.statsBarsRow}>
                {filledData.map((count, index) => {
                    const barHeight = (count / maxCount) * 100;
                    const hasData = count > 0;
                    return (
                        <View key={index} style={Styles.statsBarWrapper}>
                            {hasData && <Text style={Styles.statsBarCountLabel}>{count}</Text>}
                            <View 
                                style={[
                                    Styles.statsBar, 
                                    { 
                                        height: `${Math.max(barHeight, 4)}%`, 
                                        backgroundColor: hasData ? BAR_COLOR : BAR_INACTIVE 
                                    }
                                ]} 
                            />
                            <Text style={Styles.statsBarMonthLabel}>{MONTHS[index]}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

// ─── MÀN HÌNH CHÍNH (MAIN COMPONENT) ─────────────────────────
const EmployerStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['employer-stats']);
            setStats(res.data);
        } catch (error) {
            console.error("Lỗi lấy thống kê tuyển dụng:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = useCallback(() => {
        fetchStats(true);
    }, []);

    if (loading) {
        return (
            <View style={Styles.statsLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary || '#4F46E5'} />
            </View>
        );
    }

    // Trích xuất & tính toán số liệu dữ liệu
    const totalApps = stats?.total_applications ?? 0;
    const byStatus = stats?.applications_by_status ?? [];
    const monthlyData = stats?.monthly_applications ?? [];

    const acceptedCount = byStatus.find(s => s.status === 'accepted')?.count ?? 0;
    const conversionRate = totalApps > 0 ? ((acceptedCount / totalApps) * 100).toFixed(0) : 0;

    return (
        <SafeAreaView style={Styles.statsSafeArea}>
            <ScrollView
                style={Styles.statsContainer}
                contentContainerStyle={Styles.statsContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                {/* ── Header ── */}
                <View style={Styles.statsHeader}>
                    <Text style={Styles.statsHeaderTitle}>Thống kê tuyển dụng</Text>
                    {stats?.company_name && (
                        <Text style={Styles.statsHeaderSub}>{stats.company_name}</Text>
                    )}
                </View>

                {/* ── Hàng thẻ Tổng quan (Grid Thẻ) ── */}
                <View style={Styles.statsCardsRow}>
                    <StatCard 
                        icon="file-document-multiple-outline" 
                        value={totalApps} 
                        label="Tổng hồ sơ" 
                        iconColor="#E11D48" 
                        bgLight="#FFE4E6" 
                    />
                    <StatCard 
                        icon="check-circle-outline" 
                        value={acceptedCount} 
                        label="Đã chấp nhận" 
                        iconColor="#10B981" 
                        bgLight="#D1FAE5" 
                    />
                    <StatCard 
                        icon="percent-outline" 
                        value={`${conversionRate}%`} 
                        label="Tỉ lệ chấp nhận" 
                        iconColor="#D97706" 
                        bgLight="#FEF3C7" 
                    />
                </View>

                {/* ── Thống kê Trạng thái Hồ sơ ── */}
                <View style={Styles.statsSectionCard}>
                    <View style={Styles.statsSectionTitleRow}>
                        <MaterialCommunityIcons name="chart-pie" size={18} color="#4B5563" />
                        <Text style={Styles.statsSectionTitle}>Trạng thái hồ sơ</Text>
                    </View>
                    
                    {byStatus.length === 0 ? (
                        <Text style={Styles.statsEmptyText}>Chưa có dữ liệu</Text>
                    ) : (
                        <View style={Styles.statsStatusList}>
                            {['pending', 'reviewed', 'accepted', 'rejected'].map(key => {
                                const found = byStatus.find(s => s.status === key);
                                return (
                                    <StatusRow 
                                        key={key} 
                                        statusKey={key} 
                                        count={found ? found.count : 0} 
                                        total={totalApps} 
                                    />
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* ── Biểu đồ hồ sơ theo tháng ── */}
                <View style={Styles.statsSectionCard}>
                    <View style={Styles.statsSectionTitleRow}>
                        <MaterialCommunityIcons name="chart-bar" size={18} color="#4B5563" />
                        <Text style={Styles.statsSectionTitle}>Hồ sơ theo tháng (năm nay)</Text>
                    </View>

                    {monthlyData.length === 0 ? (
                        <Text style={Styles.statsEmptyText}>Chưa có dữ liệu trong năm nay</Text>
                    ) : (
                        <MonthlyBarChart data={monthlyData} />
                    )}
                </View>

                {/* ── Hộp gợi ý hành động (Alert/Tip Box) ── */}
                <View style={Styles.statsAlertBox}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#D97706" />
                    <Text style={Styles.statsAlertText}>
                        Sang tab <Text style={{ fontWeight: 'bold' }}>Ứng viên</Text> để xem chi tiết và đánh giá từng hồ sơ.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EmployerStats;