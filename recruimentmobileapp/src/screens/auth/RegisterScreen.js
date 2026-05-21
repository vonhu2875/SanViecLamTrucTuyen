import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import API, { endpoints } from '../../configs/Apis';
import { globalStyles } from '../../theme/globalStyles';

export default function RegisterScreen({ navigation }) {
  // 1. Quản lý State Form dữ liệu
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate'); // Mặc định là ứng viên theo model ('candidate', 'employer')
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);

  // 2. Hàm chọn ảnh đại diện từ thư viện máy
  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để cập nhật avatar!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  // 3. Hàm xử lý Đăng ký tài khoản
  const handleRegister = async () => {
    // Validate dữ liệu thô tại Client
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      // TỰ ĐỘNG XỬ LÝ USERNAME: Cắt chuỗi trước ký tự '@' của email để làm username chuẩn Django AbstractUser
      const generatedUsername = email.split('@')[0] + Math.floor(1000 + Math.random() * 9000); 

      // Tạo FormData để truyền cả file ảnh lẫn text lên Server
      const formData = new FormData();
      formData.append('first_name', fullName.trim()); // Lưu vào first_name của Django
      formData.append('username', generatedUsername);  // Trường bắt buộc của AbstractUser
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password);
      formData.append('role', role); // 'candidate' hoặc 'employer' đúng theo choices trong models.py

      // Bọc xử lý file avatar
      if (avatar) {
        const localUri = avatar.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('avatar', {
          uri: localUri,
          name: filename,
          type: type
        });
      }

      console.log('Đang gửi dữ liệu đăng ký với Username tự sinh:', generatedUsername);

      // Gọi API đăng ký
      const response = await API.post(endpoints['register'], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Phản hồi Đăng ký thành công từ Server:', response.data);
      
      Alert.alert(
        'Thành công', 
        `Đăng ký tài khoản thành công!\nTài khoản đăng nhập của bạn là: ${generatedUsername}`,
        [{ text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') }]
      );

    } catch (error) {
      console.log('Chi tiết lỗi Đăng ký:', error);
      
      let errorMsg = 'Đăng ký thất bại. Vui lòng kiểm tra lại đường truyền mạng hoặc IP trong Apis.js!';
      if (error.response) {
        // Server trả về lỗi cấu trúc chỉ định
        errorMsg = error.response.data?.detail || 
                   error.response.data?.message || 
                   JSON.stringify(error.response.data) ||
                   'Email hoặc tài khoản đã tồn tại trên hệ thống!';
      }
      
      Alert.alert('Lỗi hệ thống', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
    >
      <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Tiêu đề trang */}
        <View style={[globalStyles.headerContainer, { marginBottom: 15 }]}>
          <Text style={[globalStyles.appName, { fontSize: 28 }]}>Tạo tài khoản</Text>
          <Text style={globalStyles.slogan}>Gia nhập JobMate ngay hôm nay</Text>
        </View>

        {/* Khung lựa chọn Vai trò (Role) */}
        <Text style={globalStyles.label}>Bạn là? *</Text>
        <View style={globalStyles.roleContainer}>
          <TouchableOpacity 
            style={[globalStyles.roleButton, role === 'candidate' && globalStyles.roleButtonActive]}
            onPress={() => setRole('candidate')}
          >
            <Text style={[globalStyles.roleText, role === 'candidate' && globalStyles.roleTextActive]}>
              Ứng viên tìm việc
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.roleButton, role === 'employer' && globalStyles.roleButtonActive]}
            onPress={() => setRole('employer')}
          >
            <Text style={[globalStyles.roleText, role === 'employer' && globalStyles.roleTextActive]}>
              Nhà tuyển dụng
            </Text>
          </TouchableOpacity>
        </View>

        {/* Khung Card chính */}
        <View style={globalStyles.card}>
          
          {/* Khu vực Chọn Avatar */}
          <View style={globalStyles.avatarContainer}>
            <TouchableOpacity onPress={pickAvatar} style={globalStyles.avatarPlaceholder}>
              {avatar ? (
                <Image source={{ uri: avatar.uri }} style={{ width: 90, height: 90, borderRadius: 45 }} />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="camera-outline" size={26} color="#9CA3AF" />
                  <Text style={globalStyles.avatarText}>Ảnh đại diện</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={globalStyles.sectionTitle}>Thông tin cá nhân</Text>

          {/* Ô nhập Họ và Tên */}
          <Text style={globalStyles.label}>Họ và tên *</Text>
          <View style={globalStyles.inputContainer}>
            <Ionicons name="person-outline" size={18} color="#6B7280" style={globalStyles.inputIcon} />
            <TextInput
              style={globalStyles.input}
              placeholder="Nhập họ và tên của bạn"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Ô nhập Email */}
          <Text style={globalStyles.label}>Email *</Text>
          <View style={globalStyles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" style={globalStyles.inputIcon} />
            <TextInput
              style={globalStyles.input}
              placeholder="viethung@gmail.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Ô nhập Mật khẩu */}
          <Text style={globalStyles.label}>Mật khẩu *</Text>
          <View style={globalStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={globalStyles.inputIcon} />
            <TextInput
              style={globalStyles.input}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Ô nhập Xác nhận Mật khẩu */}
          <Text style={globalStyles.label}>Xác nhận mật khẩu *</Text>
          <View style={globalStyles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#6B7280" style={globalStyles.inputIcon} />
            <TextInput
              style={globalStyles.input}
              placeholder="Nhập lại mật khẩu phía trên"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureConfirmText}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)}>
              <Ionicons name={secureConfirmText ? "eye-off-outline" : "eye-outline"} size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Nút bấm tiến hành Đăng ký */}
          <TouchableOpacity
            style={[globalStyles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={globalStyles.loginButtonText}>Đăng ký tài khoản</Text>
            )}
          </TouchableOpacity>

          {/* Điều hướng quay lại Login */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: '#F2A0B6', fontWeight: 'bold', fontSize: 14 }}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}