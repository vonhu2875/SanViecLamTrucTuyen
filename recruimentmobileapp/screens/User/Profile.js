import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Avatar, Button, Card, Text, List, Divider } from 'react-native-paper';
import MyUserContext from '../../configs/Contexts'; // Import đúng Context của thầy
import AsyncStorage from '@react-native-async-storage/async-storage';
import Styles from '../../styles/Styles';

const Profile = ({ navigation }) => {
    // 1. Bốc dữ liệu user và hàm dispatch từ Context ra
    const [user, dispatch] = useContext(MyUserContext);

    
    if (user && user.role === 'GUEST') {
        return (
            <SafeAreaView style={Styles.safeArea}>
                <View style={[Styles.container, {alignItems: 'center'}]}>
                    <Avatar.Icon size={80} icon="account-off" backgroundColor="#ccc" style={{marginBottom: 20}} />
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: '#555'}}>Bạn đang ở chế độ Khách</Text>
                    <Text style={{color: 'gray', textAlign: 'center', marginHorizontal: 30, marginTop: 5, marginBottom: 20}}>
                        Vui lòng đăng nhập tài khoản để xem thông tin chi tiết và ứng tuyển công việc!
                    </Text>
                    
                    <Button 
                        mode="contained" 
                        buttonColor="#F2A0B6"
                        onPress={() => dispatch({ "type": "LOGOUT" })} // Trả user về null để quay lại màn hình Login ban đầu
                        style={{width: '60%', borderRadius: 12}}
                    >
                        Quay lại Đăng nhập
                    </Button>
                </View>
            </SafeAreaView>
        );
    }
    // 2. Hàm xử lý Đăng xuất
    const handleLogout = async () => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn đăng xuất không?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Đăng xuất", 
                    onPress: async () => {
                        // Xóa token lưu trong ổ cứng máy
                        await AsyncStorage.removeItem('token');
                        // Kích hoạt lệnh LOGOUT để đưa trạng thái user về null
                        dispatch({ "type": "LOGOUT" });
                        Alert.alert("Thông báo", "Đã đăng xuất thành công!");
                    }
                }
            ]
        );
    };

    // Trường hợp phòng hờ nếu chưa có dữ liệu user
    if (!user) {
        return (
            <SafeAreaView style={Styles.safeArea}>
                <View style={Styles.container}>
                    <Text>Không tìm thấy thông tin người dùng.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={Styles.safeArea}>
            <ScrollView contentContainerStyle={[Styles.container, { padding: 20 }]}>
                <Card style={styles.profileCard}>
                    <Card.Content style={styles.cardContent}>
                        <Avatar.Image 
                            size={100} 
                            source={user.avatar ? { uri: user.avatar } : require('../../assets/icon.png')} 
                            style={styles.avatar}
                        />
                        <Text style={styles.nameText}>{user.first_name} {user.last_name}</Text>
                        <Text style={styles.roleText}>
                            Vai trò:
                            {
                                user.role === 'admin' ? ' Quản trị viên' : user.role === 'employer' ? ' Nhà tuyển dụng' : ' Ứng viên'
                            }
                        </Text>
                    </Card.Content>
                </Card>

                <Card style={styles.infoCard}>
                    <Card.Content>
                        <List.Item
                            title="Tên tài khoản"
                            description={user.username}
                            left={props => <List.Icon {...props} icon="account" color="#F2A0B6" />}
                        />
                        <List.Item
                            title="Địa chỉ Email"
                            description={user.email || "Chưa cập nhật"}
                            left={props => <List.Icon {...props} icon="email" color="#F2A0B6" />}
                        />
                    </Card.Content>
                </Card>

                <Button 
                    mode="contained" 
                    onPress={handleLogout}
                    style={Styles.button}
                >
                    Đăng xuất tài khoản
                </Button>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    profileCard: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        // đổ bóng
        elevation: 2,
        marginBottom: 20,
        paddingVertical: 15,
    },
    cardContent: {
        alignItems: 'center',
    },
    avatar: {
        backgroundColor: '#f0f0f0',
        marginBottom: 15,
    },
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    roleText: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        elevation: 2,
        marginBottom: 25,
    }
});

export default Profile;