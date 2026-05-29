import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Avatar, Button, Card, Text, List, IconButton, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import MyUserContext from '../../configs/Contexts'; // Import đúng Context của thầy
import AsyncStorage from '@react-native-async-storage/async-storage';
import Styles from '../../styles/Styles';
import Apis, { endpoints } from '../../configs/Apis';
import * as ImagePicker from 'expo-image-picker';
const Profile = ({ navigation }) => {
    // 1. Bốc dữ liệu user và hàm dispatch từ Context ra
    const [user, dispatch] = useContext(MyUserContext);

    // 2. Các state phụ để quản lý chế độ chỉnh sửa và form dữ liệu
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState(null);

    const [companyInfo, setCompanyInfo] = useState(null);
    const [company, setCompany] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const refreshCurrentUser = async () => {
                try {
                    const token = await AsyncStorage.getItem('token');
                    if (!token) return;
                    const res = await Apis.get(endpoints['current-user'], {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res?.data) {
                        dispatch({ type: 'LOGIN', payload: res.data });
                    }
                } catch (error) {
                    console.error("Lỗi làm mới thông tin user:", error);
                }
            };

            refreshCurrentUser();
        }, [dispatch])
    );

    useEffect(() => {
        const fetchCurrentCompany = async () => {
            // Chỉ chạy nếu user tồn tại và có vai trò nhà tuyển dụng
            if (user && user.role === 'employer') {
                try {
                    setCompany(true);
                    const token = await AsyncStorage.getItem('token');
                    
                    // Gọi thẳng tới endpoint dành riêng cho công ty hiện tại của user
                    const response = await Apis.get(endpoints['current-company'], {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    // Endpoint này trả về trực tiếp một Object {} chứ không phải mảng
                    if (response.data) {
                        setCompanyInfo(response.data);
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin current-company:", error);
                    // Trường hợp tài khoản chưa tạo hồ sơ công ty (HTTP 400 như bạn code ở backend)
                    setCompanyInfo(null);
                } finally {
                    setCompany(false);
                }
            }
        };
        fetchCurrentCompany();
    }, [user]);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAvatar(null);
        }
    }, [user]);
    const pickImage = async () => {
        // Xin quyền truy cập thư viện ảnh của thiết bị
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Thông báo", "Ứng dụng cần quyền truy cập thư viện ảnh để đổi Avatar!");
            return;
        }

        // Mở thư viện chọn ảnh
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0]); // Lưu thông tin file ảnh vào state
        }
    };

    const handleSaveProfile = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            Alert.alert("Thông báo", "Họ, tên và email không được để trống!");
            return;
        }

        try {
            setLoading(true);
            
            const updateData = {
                'first_name': firstName,
                'last_name': lastName,
                'email': email,
                'phone': phone
            };
            
            const form = new FormData();

            // Nếu người dùng có chọn ảnh mới -> Gắn file ảnh vào FormData
            for (let key in updateData) {
                if (updateData[key]) {
                    form.append(key, updateData[key]);
                }
            }
            if (avatar && avatar.uri) {
                form.append('avatar', {
                    uri: avatar.uri,
                    name: avatar.uri.split('/').pop(),
                    type: 'image/jpeg'
                });
            }
            const token = await AsyncStorage.getItem('token');
                // Gửi PATCH với header Content-Type phù hợp cho việc truyền File
            const response = await Apis.patch(endpoints['current-user'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                });

            if (response.status === 200) {
                dispatch({ 
                    "type": "LOGIN", 
                    "payload": response.data 
                });
                Alert.alert("Thành công", "Thông tin cá nhân và Avatar đã được cập nhật!");
                setIsEditing(false);
            } 
        } catch (error) {
            console.error("Lỗi cập nhật profile:", error);
            Alert.alert("Thất bại", "Cập nhật dữ liệu thất bại. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

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
                        onPress={() => dispatch({ "type": "LOGOUT" })}
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

    const handleCancel = () => {
        setFirstName(user?.first_name || '');
        setLastName(user?.last_name || '');
        setEmail(user?.email || '');
        setPhone(user?.phone || '');
        setAvatar(null);
        setIsEditing(false);
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
            <ScrollView contentContainerStyle={[Styles.container]}>
                <Card style={styles.profileCard}>
                    <Card.Content style={[styles.cardContent]}>
                        <Avatar.Image 
                            size={100} 
                            source={avatar 
                                        ? { uri: avatar.uri } 
                                        : (user.avatar ? { uri: user.avatar } : require('../../assets/icon.png'))
                                }
                            style={styles.avatar}
                        />
                        {isEditing && (
                                <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                                    <IconButton icon="camera" iconColor="#fff" size={20} style={{margin:0}} />
                                </TouchableOpacity>
                            )}
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
                    <Card.Title 
                        title="Thông tin tài khoản"
                        titleStyle={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}
                        right={(props) => !isEditing && (
                            <IconButton {...props} icon="pencil-outline" iconColor="#F2A0B6" onPress={() => setIsEditing(true)} />
                        )}
                    />
                    <Card.Content>
                        {
                            isEditing ? (
                                <View>
                                    <TextInput label="Họ và chữ lót" value={firstName} onChangeText={setFirstName} mode="outlined" activeOutlineColor="#F2A0B6" style={Styles.input} />
                                    <TextInput label="Tên" value={lastName} onChangeText={setLastName} mode="outlined" activeOutlineColor="#F2A0B6" style={Styles.input} />
                                    <TextInput label="Địa chỉ Email" value={email} onChangeText={setEmail} mode="outlined" activeOutlineColor="#F2A0B6" keyboardType="email-address" style={Styles.input} />
                                    <TextInput label="Số điện thoại" value={phone} onChangeText={setPhone} mode="outlined" activeOutlineColor="#F2A0B6" keyboardType="phone-pad" style={Styles.input} />

                                    <View style={styles.buttonRow}>
                                        <Button mode="outlined" onPress={handleCancel} style={styles.rowButton} textColor="#666">Hủy</Button>
                                        <Button mode="contained" onPress={handleSaveProfile} loading={loading} disabled={loading} style={styles.rowButton} buttonColor="#F2A0B6">Lưu lại</Button>
                                    </View>
                                </View>
                            ):(
                                <View>
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
                                    <List.Item
                                        title="Số điện thoại"
                                        description={user.phone || "Chưa cập nhật"}
                                        left={props => <List.Icon {...props} icon="phone" color="#F2A0B6" />}
                                    />
                                    {user.role === 'employer' && (
                                        <View style={{ marginTop: 10, borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 10 }}>
                                            {companyInfo ? (
                                                <View>
                                                    {/* 1. Hiển thị trạng thái duyệt kiểm duyệt bởi Admin */}
                                                    <View style={styles.statusRow}>
                                                        <Text style={{ fontWeight: 'bold', color: '#555' }}>Trạng thái kiểm duyệt: </Text>
                                                        {companyInfo.is_approved ? (
                                                            <Text style={[styles.statusText, { color: 'green', backgroundColor: '#E8F5E9' }]}>✓ Đã duyệt</Text>
                                                        ) : (
                                                            <Text style={[styles.statusText, { color: 'orange', backgroundColor: '#FFF3E0' }]}>⏳ Chờ duyệt</Text>
                                                        )}
                                                    </View>

                                                    {/* 2. Dòng thông tin công ty - bấm vào để xem chi tiết hoặc chỉnh sửa */}
                                                    <List.Item
                                                        title="Thông tin công ty"
                                                        description={companyInfo.name || "Chưa cập nhật tên"}
                                                        left={props => <List.Icon {...props} icon="office-building" color="#F2A0B6" />}
                                                        right={props => <List.Icon {...props} icon="chevron-right" />}
                                                        onPress={() => navigation.navigate('CompanyDetail', { companyId: companyInfo.id })}
                                                        style={{ paddingHorizontal: 0 }}
                                                    />
                                                    <Button 
                                                        mode="contained" 
                                                        icon="plus"
                                                        buttonColor="#F2A0B6"
                                                        onPress={() => navigation.navigate('PostJob')}
                                                        style={{ marginTop: 15 }}
                                                    >
                                                        Đăng tin tuyển dụng mới
                                                    </Button>
                                                </View>
                                            ) : (
                                                <View style={{ padding: 10, alignItems: 'center' }}>
                                                    {company ? (
                                                        <Text style={{ color: 'gray', fontSize: 13 }}>Đang tải thông tin công ty...</Text>
                                                    ) : (
                                                        <Text style={{ color: 'gray', fontSize: 13 }}>Tài khoản này chưa tạo hồ sơ công ty.</Text>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )
                        }
                    </Card.Content>
                </Card>

                <Button 
                    mode="contained" 
                    onPress={handleLogout}
                    style={[Styles.button, { backgroundColor: '#D32F2F' }]}
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
    },
    avatarWrapper: {
        position: 'relative', marginBottom: 15 
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 3,
        backgroundColor: 'rgba(242, 160, 182, 0.9)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    buttonRow: {
         flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 5
        },
    rowButton: { 
        width: '48%', borderRadius: 10
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        overflow: 'hidden', // Giúp bo góc mượt trên Android
    }
});

export default Profile;