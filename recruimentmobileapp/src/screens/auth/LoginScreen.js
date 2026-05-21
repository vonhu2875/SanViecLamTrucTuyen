import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../../configs/Contexts';
import API, { endpoints } from '../../configs/Apis';
import { globalStyles } from '../../theme/globalStyles';

export default function LoginScreen({ navigation }) {
  // Đổi từ email thành username để khớp hoàn toàn với cấu trúc AbstractUser của Django
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const { loginUser } = useContext(AuthContext); // Hàm cập nhật state user/token vào Context

  const handleLogin = async () => {
    // 1. Kiểm tra validate dữ liệu thô tại Client
    if (!username.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      console.log('Đang gửi request đăng nhập cho username:', username);
      
      // 2. Gọi API đăng nhập với đúng cặp key Backend Django cần (username & password)
      const response = await API.post(endpoints['login'], {
        username: username.trim(),
        password: password
      });

      console.log('Kết quả API trả về:', response.data);

      // 3. Đưa thông tin đăng nhập thành công vào Context hệ thống
      // (Giả sử Backend trả về object có chứa thông tin user và token, điều chỉnh theo API thực tế của bạn)
      if (response.data) {
        await loginUser(response.data); 
        Alert.alert('Thành công', 'Đăng nhập thành công!');
        // Luồng điều hướng sẽ tự động kích hoạt bên AppNavigator nhờ Context thay đổi state
      } else {
        Alert.alert('Thất bại', 'Không nhận được phản hồi hợp lệ từ máy chủ!');
      }

    } catch (error) {
      console.log('Chi tiết lỗi Đăng nhập:', error);
      
      // Bọc lót an toàn tuyệt đối tránh lỗi "Cannot read property of undefined"
      let errorMsg = 'Không thể kết nối tới Server Backend. Vui lòng kiểm tra lại địa chỉ IP trong Apis.js!';
      
      if (error.response) {
        // Server có phản hồi nhưng trả về mã lỗi (400, 401, 403, 500...)
        errorMsg = error.response.data?.detail || 
                   error.response.data?.message || 
                   error.response.data?.non_field_errors?.[0] ||
                   'Tài khoản hoặc mật khẩu không chính xác!';
      } else if (error.message) {
        errorMsg = error.message;
      }

      Alert.alert('Đăng nhập thất bại', errorMsg);
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
        
        {/* Phần Header / Logo */}
        <View style={globalStyles.headerContainer}>
          <Image 
            source={require('../../../assets/jobmate-logo.png')} // Đảm bảo đường dẫn logo của bạn đúng, hoặc dùng icon tạm thời
            style={globalStyles.logo}
            defaultSource={require('../../../assets/jobmate-logo.png')}
          />
          <Text style={globalStyles.appName}>JobMate</Text>
          <Text style={globalStyles.slogan}>Kết nối cơ hội – Dẫn lối thành công</Text>
        </View>

        {/* Khung Card chứa Form nhập liệu */}
        <View style={globalStyles.card}>
          
          {/* Ô nhập Tài khoản (Username) */}
          <Text style={globalStyles.label}>Tên tài khoản</Text>
          <View style={globalStyles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#6B7280" style={globalStyles.inputIcon} />
            <TextInput
              style={globalStyles.input}
              placeholder="Nhập username của bạn (ví dụ: candidate1)"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Ô nhập Mật khẩu */}
          <Text style={globalStyles.label}>Mật khẩu</Text>
          <View style={globalStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={globalStyles.inputIcon} />
            <TextInput
              style={globalStyles.input}
              placeholder="••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Ionicons 
                name={secureText ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>

          {/* Nút Đăng nhập */}
          <TouchableOpacity 
            style={[globalStyles.loginButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={globalStyles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Dòng chuyển màn sang Đăng ký */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: '#F2A0B6', fontWeight: 'bold', fontSize: 14 }}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}