import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, SafeAreaView, RefreshControl } from 'react-native';
import { Card, Text, List, Chip } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import { formatDate } from '../../utils/formatters';
import Styles from '../../styles/Styles';

const STATUS_CONFIG = {
    pending: { label: 'Chờ xem xét', color: '#F59E0B', bg: '#FEF3C7' },
    reviewed: { label: 'Đã đánh giá', color: '#3B82F6', bg: '#EFF6FF' },
    accepted: { label: 'Đã duyệt', color: '#10B981', bg: '#E8F5E9' },
    rejected: { label: 'Từ chối', color: '#EF4444', bg: '#FFEBEE' },
};

const MyApplications = ({ navigation }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();

    const fetchMyApplications = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Thông báo', 'Vui lòng đăng nhập để xem danh sách ứng tuyển!');
                return;
            }

            const res = await authApis(token).get(endpoints['applications']);
            const data = res.data?.results || res.data || [];
            setApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi lấy danh sách ứng tuyển:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách công việc đã nộp.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchMyApplications();
        }
    }, [isFocused]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#F2A0B6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[Styles.safeArea, Styles.container]}>
            <Text style={styles.headerTitle}>
                Công việc đã ứng tuyển ({applications.length})
            </Text>

            {applications.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>Bạn chưa nộp hồ sơ ứng tuyển nào!</Text>
                </View>
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchMyApplications(true)}
                            colors={['#F2A0B6']}
                        />
                    }
                    renderItem={({ item }) => {
                        const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

                        return (
                            <Card
                                style={styles.card}
                                onPress={() =>
                                    navigation.navigate('JobDetail', {
                                        jobId: item.job,
                                        jobTitle: item.job_title,
                                    })
                                }
                            >
                                <Card.Title
                                    title={item.job_title || 'Công việc'}
                                    subtitle={item.company_name || 'Công ty chưa cập nhật'}
                                    titleStyle={styles.cardTitle}
                                    right={() => (
                                        <Chip
                                            style={{ backgroundColor: statusCfg.bg, marginRight: 8 }}
                                            textStyle={{ color: statusCfg.color, fontSize: 11, fontWeight: '600' }}
                                        >
                                            {statusCfg.label}
                                        </Chip>
                                    )}
                                />
                                <Card.Content>
                                    <List.Item
                                        title={`Địa điểm: ${item.job_location || 'Chưa cập nhật'}`}
                                        left={(props) => <List.Icon {...props} icon="map-marker" color="#666" />}
                                        style={styles.listItemPadding}
                                        titleStyle={styles.itemText}
                                    />
                                    <List.Item
                                        title={`Ngày nộp: ${formatDate(item.created_date)}`}
                                        left={(props) => <List.Icon {...props} icon="calendar" color="#666" />}
                                        style={styles.listItemPadding}
                                        titleStyle={styles.itemText}
                                    />
                                    {item.employer_comment ? (
                                        <List.Item
                                            title={`Phản hồi NTD: ${item.employer_comment}`}
                                            left={(props) => <List.Icon {...props} icon="message-text" color="#F2A0B6" />}
                                            style={styles.listItemPadding}
                                            titleStyle={[styles.itemText, { color: '#555' }]}
                                            titleNumberOfLines={3}
                                        />
                                    ) : null}
                                </Card.Content>
                            </Card>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        marginTop: 20,
        paddingHorizontal: 5,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'gray', fontSize: 15 },
    card: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
    cardTitle: { fontWeight: 'bold', color: '#333', fontSize: 16 },
    listItemPadding: { paddingVertical: 0, paddingHorizontal: 0, minHeight: 35, justifyContent: 'center' },
    itemText: { fontSize: 13, color: '#444' },
});

export default MyApplications;
