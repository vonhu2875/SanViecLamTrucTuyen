// screens/Candidate/CompareScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View, ScrollView, StyleSheet, ActivityIndicator,
    TouchableOpacity, Dimensions, Animated
} from 'react-native';
import { Text, Icon } from 'react-native-paper';
import Apis, { endpoints } from '../../configs/Apis';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Màu sắc nhất quán với app ───────────────────────────────────────────────
const PRIMARY   = '#F2A0B6';
const PRIMARY_LIGHT = '#FFF0F4';
const COLORS_JOB = ['#F2A0B6', '#7EC8E3', '#A8D8A8', '#FFD580']; // mỗi job 1 màu

// ─── Helper ──────────────────────────────────────────────────────────────────
const fmtSalary = (val) => {
    if (!val && val !== 0) return '—';
    return `${(Number(val) / 1_000_000).toFixed(0)}tr`;
};

const fmtDeadline = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
};

// ─── Bar Chart đơn giản (không cần thư viện ngoài) ───────────────────────────
const BarChart = ({ data, title, icon, color = PRIMARY, valueFormatter = (v) => v }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barWidth = Math.min(56, (SCREEN_WIDTH - 80) / data.length - 12);

    return (
        <View style={chartStyles.container}>
            <View style={chartStyles.titleRow}>
                <Icon source={icon} size={16} color={PRIMARY} />
                <Text style={chartStyles.title}>{title}</Text>
            </View>
            <View style={chartStyles.barsWrapper}>
                {data.map((item, idx) => {
                    const heightPct = (item.value / maxVal);
                    const barH = Math.max(heightPct * 120, 4);
                    return (
                        <View key={idx} style={[chartStyles.barCol, { width: barWidth + 16 }]}>
                            <Text style={chartStyles.barValue}>{valueFormatter(item.value)}</Text>
                            <View style={[chartStyles.bar, {
                                height: barH,
                                backgroundColor: COLORS_JOB[idx % COLORS_JOB.length],
                                width: barWidth,
                            }]} />
                            <Text style={chartStyles.barLabel} numberOfLines={2}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

// ─── Radar / Spider Chart (SVG tay) ──────────────────────────────────────────
const RadarChart = ({ jobs, stats }) => {
    if (!stats || stats.length === 0) return null;

    const SIZE   = 200;
    const CX     = SIZE / 2;
    const CY     = SIZE / 2;
    const R      = 75;
    const axes   = ['Lương TB', 'Kinh nghiệm', 'Kỹ năng', 'Thời hạn'];
    const N      = axes.length;

    // Chuẩn hóa 0-1
    const maxSalary  = Math.max(...stats.map(s => s.salary_avg), 1);
    const maxExp     = Math.max(...stats.map(s => s.experience_years), 1);
    const maxBenefit = Math.max(...stats.map(s => s.benefits_score), 1);
    const maxDays    = Math.max(...stats.map(s => s.days_until_deadline), 1);

    const normalize = (stat) => [
        stat.salary_avg / maxSalary,
        1 - (stat.experience_years / (maxExp || 1)),  // ít kinh nghiệm = điểm cao hơn
        stat.benefits_score / maxBenefit,
        stat.days_until_deadline / maxDays,
    ];

    const angleOf = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;

    const toXY = (angle, r) => ({
        x: CX + r * Math.cos(angle),
        y: CY + r * Math.sin(angle),
    });

    const polygonPoints = (values) =>
        values
            .map((v, i) => {
                const { x, y } = toXY(angleOf(i), v * R);
                return `${x},${y}`;
            })
            .join(' ');

    // Web component giả lập SVG bằng View + absolute position
    // Vì React Native không hỗ trợ SVG nativewind, dùng react-native-svg nếu có,
    // fallback về bảng điểm nếu không có
    return (
        <View style={radarStyles.wrapper}>
            <Text style={chartStyles.title}>Biểu đồ tổng thể</Text>
            {/* Bảng điểm thay thế radar */}
            <View style={radarStyles.scoreTable}>
                {axes.map((axis, ai) => (
                    <View key={ai} style={radarStyles.scoreRow}>
                        <Text style={radarStyles.axisLabel}>{axis}</Text>
                        {stats.map((s, si) => {
                            const vals = normalize(s);
                            const pct  = Math.round(vals[ai] * 100);
                            return (
                                <View key={si} style={radarStyles.scoreCell}>
                                    <View style={radarStyles.barTrack}>
                                        <View style={[radarStyles.barFill, {
                                            width: `${pct}%`,
                                            backgroundColor: COLORS_JOB[si % COLORS_JOB.length],
                                        }]} />
                                    </View>
                                    <Text style={radarStyles.scorePct}>{pct}%</Text>
                                </View>
                            );
                        })}
                    </View>
                ))}
                {/* Legend */}
                <View style={radarStyles.legend}>
                    {stats.map((s, si) => (
                        <View key={si} style={radarStyles.legendItem}>
                            <View style={[radarStyles.legendDot, { backgroundColor: COLORS_JOB[si % COLORS_JOB.length] }]} />
                            <Text style={radarStyles.legendText} numberOfLines={1}>{s.job_title}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const CompareScreen = ({ route, navigation }) => {
    const { jobIds = [] } = route.params || {};

    const [loading, setLoading]   = useState(true);
    const [jobs, setJobs]         = useState([]);
    const [stats, setStats]       = useState([]);
    const [activeTab, setActiveTab] = useState('table'); // 'table' | 'chart'
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        navigation.setOptions({ title: 'So sánh việc làm' });
        fetchCompare();
    }, []);

    const fetchCompare = async () => {
        try {
            const ids = jobIds.join(',');
            const res = await Apis.get(`${endpoints['jobs']}compare/?ids=${ids}`);
            setJobs(res.data.jobs || []);
            setStats(res.data.comparison_stats || []);
        } catch (err) {
            console.error('Lỗi so sánh:', err);
        } finally {
            setLoading(false);
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loadingText}>Đang tải dữ liệu so sánh...</Text>
            </View>
        );
    }

    // ── Dữ liệu cho các chart ──
    const salaryAvgData  = stats.map(s => ({ label: s.job_title, value: s.salary_avg }));
    const salaryMinData  = stats.map(s => ({ label: s.job_title, value: s.salary_min }));
    const salaryMaxData  = stats.map(s => ({ label: s.job_title, value: s.salary_max }));
    const benefitData    = stats.map(s => ({ label: s.job_title, value: s.benefits_score }));
    const deadlineData   = stats.map(s => ({ label: s.job_title, value: s.days_until_deadline }));

    // ── Table rows ──
    const TABLE_ROWS = [
        {
            label: 'Vị trí',
            icon: 'briefcase-outline',
            get: (job) => job.title,
        },
        {
            label: 'Công ty',
            icon: 'office-building-outline',
            get: (job) => job.employer?.name || '—',
        },
        {
            label: 'Lương tối thiểu',
            icon: 'cash-minus',
            get: (job) => fmtSalary(job.salary_min),
            highlight: true,
        },
        {
            label: 'Lương tối đa',
            icon: 'cash-plus',
            get: (job) => fmtSalary(job.salary_max),
            highlight: true,
        },
        {
            label: 'Kinh nghiệm',
            icon: 'school-outline',
            get: (job) => job.experience_required !== undefined ? `${job.experience_required} năm` : '—',
        },
        {
            label: 'Địa điểm',
            icon: 'map-marker-outline',
            get: (job) => job.location || '—',
        },
        {
            label: 'Danh mục',
            icon: 'tag-outline',
            get: (job) => job.category_name || job.category?.name || '—',
        },
        {
            label: 'Hạn nộp',
            icon: 'calendar-clock',
            get: (job) => fmtDeadline(job.deadline),
        },
        {
            label: 'Kỹ năng yêu cầu',
            icon: 'lightning-bolt-outline',
            get: (job) => job.skills?.map(s => s.name).join(', ') || '—',
        },
        {
            label: 'Trạng thái',
            icon: 'check-circle-outline',
            get: (job) => job.active ? 'Đang tuyển' : 'Đã đóng',
        },
    ];

    const colWidth = Math.max(140, (SCREEN_WIDTH - 110) / jobs.length);

    return (
        <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
            {/* Tab switcher */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'table' && styles.tabActive]}
                    onPress={() => setActiveTab('table')}
                >
                    <Icon source="table" size={16} color={activeTab === 'table' ? '#fff' : PRIMARY} />
                    <Text style={[styles.tabText, activeTab === 'table' && styles.tabTextActive]}>Bảng so sánh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'chart' && styles.tabActive]}
                    onPress={() => setActiveTab('chart')}
                >
                    <Icon source="chart-bar" size={16} color={activeTab === 'chart' ? '#fff' : PRIMARY} />
                    <Text style={[styles.tabText, activeTab === 'chart' && styles.tabTextActive]}>Biểu đồ</Text>
                </TouchableOpacity>
            </View>

            {/* ── Tab 1: Bảng so sánh ── */}
            {activeTab === 'table' && (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header màu job */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            {/* Header row */}
                            <View style={tableStyles.headerRow}>
                                <View style={tableStyles.labelCol}>
                                    <Text style={tableStyles.labelColHeader}>Tiêu chí</Text>
                                </View>
                                {jobs.map((job, ji) => (
                                    <View key={job.id} style={[tableStyles.jobHeaderCell, { width: colWidth, borderBottomColor: COLORS_JOB[ji % COLORS_JOB.length] }]}>
                                        <View style={[tableStyles.jobColorDot, { backgroundColor: COLORS_JOB[ji % COLORS_JOB.length] }]} />
                                        <Text style={tableStyles.jobHeaderTitle} numberOfLines={2}>{job.title}</Text>
                                        <Text style={tableStyles.jobHeaderCompany} numberOfLines={1}>{job.employer?.name}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Data rows */}
                            {TABLE_ROWS.map((row, ri) => (
                                <View key={ri} style={[tableStyles.dataRow, ri % 2 === 0 && tableStyles.dataRowAlt]}>
                                    <View style={tableStyles.labelCol}>
                                        <Icon source={row.icon} size={14} color={PRIMARY} />
                                        <Text style={tableStyles.rowLabel}>{row.label}</Text>
                                    </View>
                                    {jobs.map((job, ji) => (
                                        <View key={job.id} style={[tableStyles.dataCell, { width: colWidth }, row.highlight && tableStyles.dataCellHighlight]}>
                                            <Text style={[tableStyles.dataCellText, row.highlight && tableStyles.dataCellTextHighlight]} numberOfLines={3}>
                                                {row.get(job)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Nút ứng tuyển từng job */}
                    <View style={styles.applyRow}>
                        {jobs.map((job, ji) => (
                            <TouchableOpacity
                                key={job.id}
                                style={[styles.applyBtn, { borderColor: COLORS_JOB[ji % COLORS_JOB.length], backgroundColor: COLORS_JOB[ji % COLORS_JOB.length] + '20' }]}
                                onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                            >
                                <Text style={[styles.applyBtnText, { color: COLORS_JOB[ji % COLORS_JOB.length] }]} numberOfLines={2}>
                                    Xem chi tiết{'\n'}{job.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ height: 32 }} />
                </ScrollView>
            )}

            {/* ── Tab 2: Biểu đồ ── */}
            {activeTab === 'chart' && (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.chartScroll}
                >
                    <BarChart
                        data={salaryAvgData}
                        icon="cash-multiple"
                        title="Lương trung bình (triệu đồng)"
                        valueFormatter={fmtSalary}
                    />
                    <View style={styles.chartDivider} />
                    <BarChart
                        data={salaryMinData}
                        icon="trending-down"
                        title="Lương tối thiểu"
                        valueFormatter={fmtSalary}
                    />
                    <View style={styles.chartDivider} />
                    <BarChart
                        data={salaryMaxData}
                        icon="trending-up"
                        title="Lương tối đa"
                        valueFormatter={fmtSalary}
                    />
                    <View style={styles.chartDivider} />
                    <BarChart
                        data={benefitData}
                        icon="lightning-bolt"
                        title="Kỹ năng yêu cầu (số lượng)"
                        valueFormatter={(v) => `${v}`}
                    />
                    <View style={styles.chartDivider} />
                    <BarChart
                        data={deadlineData}
                        icon="calendar-clock"
                        title="Số ngày còn lại đến hạn nộp"
                        valueFormatter={(v) => `${v} ngày`}
                    />
                    <View style={styles.chartDivider} />
                    <RadarChart jobs={jobs} stats={stats} />
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </Animated.View>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F9FAFB' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: '#888', fontSize: 14 },

    tabBar: {
        flexDirection: 'row', margin: 14, marginBottom: 8,
        backgroundColor: '#fff', borderRadius: 12,
        padding: 4, elevation: 2,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 8, borderRadius: 10, gap: 4,
    },
    tabActive: { backgroundColor: PRIMARY },
    tabText: { fontSize: 13, fontWeight: '600', color: PRIMARY },
    tabTextActive: { color: '#fff' },

    applyRow: {
        flexDirection: 'row', flexWrap: 'wrap',
        paddingHorizontal: 14, paddingTop: 16, gap: 10,
    },
    applyBtn: {
        flex: 1, minWidth: 100,
        paddingVertical: 10, paddingHorizontal: 12,
        borderRadius: 10, borderWidth: 1.5,
        alignItems: 'center',
    },
    applyBtnText: { fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 18 },

    chartScroll: { padding: 16, paddingBottom: 32 },
    chartDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
});

const tableStyles = StyleSheet.create({
    headerRow: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
    labelCol: {
        width: 100, paddingVertical: 10, paddingHorizontal: 8,
        justifyContent: 'flex-start', alignItems: 'flex-start',
        flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center',
        borderRightWidth: 1, borderRightColor: '#F3F4F6',
    },
    labelColHeader: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', paddingLeft: 4, paddingVertical: 14 },
    jobHeaderCell: {
        paddingVertical: 12, paddingHorizontal: 10,
        alignItems: 'center', borderBottomWidth: 3,
        borderRightWidth: 1, borderRightColor: '#F3F4F6',
    },
    jobColorDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
    jobHeaderTitle: { fontSize: 13, fontWeight: '700', color: '#111', textAlign: 'center' },
    jobHeaderCompany: { fontSize: 11, color: '#6B7280', marginTop: 2, textAlign: 'center' },

    dataRow: {
        flexDirection: 'row', backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    dataRowAlt: { backgroundColor: '#FAFAFA' },
    rowLabel: { fontSize: 11, color: '#374151', fontWeight: '600', flex: 1 },

    dataCell: {
        paddingVertical: 10, paddingHorizontal: 10,
        justifyContent: 'center',
        borderRightWidth: 1, borderRightColor: '#F3F4F6',
    },
    dataCellHighlight: { backgroundColor: PRIMARY_LIGHT },
    dataCellText: { fontSize: 12, color: '#374151', textAlign: 'center' },
    dataCellTextHighlight: { fontWeight: '700', color: '#D6336C' },
});

const chartStyles = StyleSheet.create({
    container: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginVertical: 6, elevation: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    title: { fontSize: 13, fontWeight: '700', color: '#374151' },
    barsWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160 },
    barCol: { alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
    bar: { borderRadius: 6, minHeight: 4 },
    barValue: { fontSize: 11, fontWeight: '700', color: '#374151' },
    barLabel: { fontSize: 10, color: '#6B7280', textAlign: 'center', maxWidth: 70 },
});

const radarStyles = StyleSheet.create({
    wrapper: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginVertical: 6, elevation: 1 },
    scoreTable: { marginTop: 8, gap: 10 },
    scoreRow: { gap: 6 },
    axisLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4 },
    scoreCell: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    barTrack: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 4 },
    scorePct: { fontSize: 11, color: '#6B7280', width: 34, textAlign: 'right' },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 11, color: '#374151', maxWidth: 120 },
});

export default CompareScreen;