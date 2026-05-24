import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import MyUserContext from '../../configs/Contexts'; // Import Context để dùng hàm Đăng xuất
import API, { endpoints } from '../../configs/Apis'; // Import cổng API để lấy danh sách việc làm

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Bốc user và dispatch ra để hiển thị lời chào và xử lý đăng xuất
    const [user, dispatch] = useContext(MyUserContext); 

    // Hàm gọi API lấy danh sách việc làm từ Django
    const loadJobs = async () => {
        setLoading(true);
        try {
            let res = await API.get(endpoints['jobs']);
            // Django REST Framework trả về mảng nằm trong thuộc tính 'results' khi có phân trang
            setJobs(res.data.results || res.data); 
        } catch (error) {
            console.error("Lỗi tải danh sách việc làm:", error);
            Alert.alert("Thông báo", "Không thể tải danh sách việc làm từ Server!");
        } finally {
            setLoading(false);
        }
    };

    // Tự động chạy lệnh tải dữ liệu khi màn hình được mở lên
    useEffect(() => {
        loadJobs();
    }, []);

    // Hàm xử lý khi bấm nút Đăng xuất
    const handleLogout = () => {
        dispatch({
            "type": "LOGOUT"
        });
        Alert.alert("Thông báo", "Đã đăng xuất thành công!");
    };

    return (
        <View style={styles.container}>
            {/* Thanh tiêu đề trên cùng kèm nút Đăng xuất */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Chào, {user?.username || 'Thành viên'}! 👋</Text>
                <Button mode="text" textColor="red" onPress={handleLogout}>
                    Đăng xuất
                </Button>
            </View>

            <Text style={styles.sectionTitle}>Việc làm mới nhất</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#F2A0B6" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.jobTitle}>{item.title}</Title>
                                <Paragraph style={styles.companyName}>🏢 {item.company_name || 'Công ty tuyển dụng'}</Paragraph>
                                <Paragraph style={styles.salary}>💰 Lương: {item.salary || 'Thỏa thuận'}</Paragraph>
                            </Card.Content>
                        </Card>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 15, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    welcomeText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#F2A0B6', marginBottom: 15 },
    card: { marginBottom: 12, backgroundColor: '#fff', elevation: 2 },
    jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    companyName: { fontSize: 14, color: '#666', marginTop: 4 },
    salary: { fontSize: 14, color: 'green', fontWeight: 'bold', marginTop: 2 }
});

export default Home;