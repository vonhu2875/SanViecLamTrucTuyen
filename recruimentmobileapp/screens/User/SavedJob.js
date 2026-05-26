import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Image } from 'react-native';
import { Card, Text, IconButton, List } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native'; // Dùng Hook gọn gàng
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { endpoints } from '../../configs/Apis';
import Styles from '../../styles/Styles';

const SavedJobs = ({ navigation }) => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused(); // Theo dõi trạng thái hiển thị màn hình

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Thông báo", "Vui lòng đăng nhập để xem danh sách này!");
                return;
            }

            // Gọi API lấy job đã lưu thông qua tham số lọc hệ thống dựa trên Django của bạn
            const res = await Apis.get(`${endpoints['jobs']}?saved=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data && res.data.results) {
                setSavedJobs(res.data.results);
            } else {
                setSavedJobs(res.data); 
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách công việc đã lưu:", error);
            Alert.alert("Lỗi", "Không thể tải danh sách công việc đã lưu.");
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại API mỗi khi ứng viên quay lại màn hình nhờ useIsFocused
    useEffect(() => {
        if (isFocused) {
            fetchSavedJobs();
        }
    }, [isFocused]);

    // Hàm gỡ lưu nhanh công việc
    const handleRemoveSave = async (jobId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await Apis.post(endpoints['save-job'](jobId), {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 200) {
                fetchSavedJobs(); // Tải lại danh sách sau khi gỡ thành công
                Alert.alert("Thông báo", "Đã gỡ công việc khỏi danh sách yêu thích.");
            }
        } catch (error) {
            console.error("Lỗi gỡ lưu job:", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#F2A0B6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[Styles.safeArea, Styles.container]}>
            <Text style={styles.headerTitle}>Công việc bạn đã lưu ({savedJobs.length})</Text>
            {savedJobs.length === 0 ? (
                <View style={styles.center}>
                    <Text style={{ color: 'gray', fontSize: 15 }}>Bạn chưa lưu bài tuyển dụng nào!</Text>
                </View>
            ) : (
                <FlatList
                    data={savedJobs}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <Card 
                            style={styles.card}
                            onPress={() => navigation.navigate('JobDetail', { jobId: item.id, jobTitle: item.title })}
                        >
                            <Card.Title
                                title={item.title}
                                subtitle={item.employer?.name || "Công ty chưa cập nhật tên"}
                                titleStyle={styles.cardTitle}
                                right={(props) => (
                                    <IconButton 
                                        {...props} 
                                        icon="bookmark-off" 
                                        iconColor="#D32F2F" 
                                        onPress={() => handleRemoveSave(item.id)} 
                                    />
                                )}
                            />
                            <Card.Content>
                                {/* Thay thế hoàn toàn emoji thủ công bằng List.Item sử dụng Vector Icons chính chủ */}
                                <List.Item
                                    title={`Địa điểm: ${item.location}`}
                                    left={props => <List.Icon {...props} icon="map-marker" color="#666" />}
                                    style={styles.listItemPadding}
                                    titleStyle={styles.itemText}
                                />
                                <List.Item
                                    title={`Mức lương: ${parseFloat(item.salary_min).toLocaleString()}đ - ${parseFloat(item.salary_max).toLocaleString()}đ`}
                                    left={props => <List.Icon {...props} icon="currency-usd" color="green" />}
                                    style={styles.listItemPadding}
                                    titleStyle={[styles.itemText, { color: 'green', fontWeight: 'bold' }]}
                                />
                                <List.Item
                                    title={`Hạn nộp đơn: ${item.deadline}`}
                                    left={props => <List.Icon {...props} icon="clock-outline" color="#666" />}
                                    style={styles.listItemPadding}
                                    titleStyle={styles.itemText}
                                />
                            </Card.Content>
                        </Card>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 15 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 20, paddingHorizontal: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
    cardTitle: { fontWeight: 'bold', color: '#333', fontSize: 16 },
    listItemPadding: { paddingVertical: 0, paddingHorizontal: 0, height: 35, justifyContent: 'center' },
    itemText: { fontSize: 13, color: '#444' }
});

export default SavedJobs;