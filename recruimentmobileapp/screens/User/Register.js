import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, RadioButton, HelperText, ActivityIndicator, Avatar, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import Apis, { endpoints } from '../../configs/Apis';
import { SafeAreaView } from 'react-native-safe-area-context';

const Register = ({ navigation }) => {
    // 1. Dữ liệu tài khoản cơ bản
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [role, setRole] = useState('candidate'); // 'candidate' hoặc 'employer'

    const [loading, setLoading] = useState(false);

    // Hàm chọn ảnh đại diện từ điện thoại
    const pickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Thông báo", "Ứng dụng cần quyền truy cập thư viện ảnh để chọn Avatar!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync();

        if (!result.canceled) {
            setAvatar(result.assets[0]);
        }
    };

    const hasErrors = () => {
        return password !== confirmPassword && confirmPassword.length > 0;
    };

    // Hàm gửi FormData lên Django Backend
    const handleRegister = async () => {
        if (!username || !password || !email || !firstName || !lastName || !phone) {
            Alert.alert("Thông báo", "Vui lòng điền đầy đủ các trường thông tin bắt buộc!");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('email', email);
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('phone', phone);
            formData.append('role', role);

            
            if (avatar && avatar.uri) {
                formData.append('avatar', {
                    uri: avatar.uri,
                    name: avatar.uri.split('/').pop(),
                    type: 'image/jpeg'
                });
            }

            const res = await Apis.post(endpoints['register'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 201 || res.status === 200) {
                Alert.alert("Thành công", "Tài khoản của bạn đã được khởi tạo thành công!", [
                    { text: "Đăng nhập ngay", onPress: () => navigation.navigate('login') }
                ]);
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error.response?.data || error.message);
            Alert.alert("Lỗi hệ thống", "Không thể đăng ký. Hãy kiểm tra xem Username/Email có bị trùng lặp không!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>Đăng ký thành viên</Text>
                    
                    {/* Khu vực chọn Ảnh đại diện đồng bộ */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarWrapper}>
                            <Avatar.Image 
                                size={100} 
                                source={avatar ? { uri: avatar.uri } : require('../../assets/icon.png')}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.cameraButton} onPress={pickAvatar}>
                                <IconButton icon="camera" iconColor="#fff" size={20} style={{ margin: 0 }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.avatarLabel}>Chọn ảnh đại diện của bạn</Text>
                    </View>

                    <Text style={styles.sectionLabel}>Thông tin cá nhân</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TextInput label="Họ" mode="outlined" value={lastName} onChangeText={setLastName} style={[styles.input, { width: '48%' }]} activeOutlineColor="#F2A0B6" />
                        <TextInput label="Tên" mode="outlined" value={firstName} onChangeText={setFirstName} style={[styles.input, { width: '48%' }]} activeOutlineColor="#F2A0B6" />
                    </View>

                    <TextInput label="Số điện thoại" mode="outlined" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={styles.input} activeOutlineColor="#F2A0B6" />
                    <TextInput label="Địa chỉ Email" mode="outlined" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} activeOutlineColor="#F2A0B6" />

                    <Text style={styles.sectionLabel}>Thông tin tài khoản</Text>
                    <TextInput label="Tên tài khoản (Username)" mode="outlined" value={username} onChangeText={setUsername} style={styles.input} activeOutlineColor="#F2A0B6" />
                    <TextInput label="Mật khẩu" mode="outlined" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} activeOutlineColor="#F2A0B6" />
                    
                    <TextInput 
                        label="Xác nhận mật khẩu" 
                        mode="outlined" 
                        secureTextEntry 
                        value={confirmPassword} 
                        onChangeText={setConfirmPassword} 
                        style={styles.input} 
                        activeOutlineColor="#F2A0B6"
                        error={hasErrors()}
                    />
                    <HelperText type="error" visible={hasErrors()}>Mật khẩu xác nhận chưa trùng khớp!</HelperText>

                    <Text style={styles.sectionLabel}>Bạn tham gia với tư cách là:</Text>
                    <RadioButton.Group onValueChange={value => setRole(value)} value={role}>
                        <View style={styles.radioContainer}>
                            <View style={styles.radioItem}>
                                <RadioButton value="candidate" color="#F2A0B6" />
                                <Text style={styles.radioText}>Ứng viên (Tìm việc)</Text>
                            </View>
                            <View style={styles.radioItem}>
                                <RadioButton value="employer" color="#F2A0B6" />
                                <Text style={styles.radioText}>Nhà tuyển dụng</Text>
                            </View>
                        </View>
                    </RadioButton.Group>

                    {loading ? (
                        <ActivityIndicator color="#F2A0B6" size="large" style={{ marginTop: 20 }} />
                    ) : (
                        <Button mode="contained" onPress={handleRegister} style={styles.btn} buttonColor="#F2A0B6">
                            Hoàn tất đăng ký
                        </Button>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 20, paddingTop: 0 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
    sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 15, marginBottom: 8 },
    input: { marginBottom: 10, backgroundColor: '#fff' },
    radioContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    radioItem: { flexDirection: 'row', alignItems: 'center' },
    radioText: { fontSize: 14, color: '#555', marginLeft: 5 },
    btn: { marginTop: 20, paddingVertical: 5, borderRadius: 10, marginBottom: 30 },
    avatarContainer: { alignItems: 'center', marginBottom: 20 },
    avatarWrapper: { position: 'relative', marginBottom: 5 },
    avatar: { backgroundColor: '#f0f0f0' },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: -3,
        backgroundColor: '#F2A0B6',
        borderRadius: 20,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    avatarLabel: { fontSize: 12, color: '#888', marginTop: 5 },
});

export default Register;