import React, { useState, useContext } from 'react';
import { View, ActivityIndicator, Alert, ScrollView, StyleSheet, Image } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import  MyUserContext  from '../../configs/Contexts'; 
import API, { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Styles from '../../styles/Styles';
import { SafeAreaView } from 'react-native';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState();
    const [loading, setLoading] = useState(false);
    const [secureText, setSecureText] = useState(true);

    const validate = () => {
        if (!username.trim() || !password.trim()) {
            setErr('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!');
            return false;
        }
        return true;
    }
    const [, dispatch] = useContext(MyUserContext); 

    const handleLogin = async () => {
        if(validate() === true) {
            setErr("");
            
        try {
            setLoading(true);
            let res = await API.post(endpoints['login'], {
                'client_id': 'yLisKdKddyPvgj4g5QQTokzH9dluVNzopuCrgO0r',
                'client_secret': 'TiMhZWHZM3bCLXmTXoqXuM6GN2S7DqIfLki5O9WawUl0Az5ej3rYoTIulp21Th0Z2MObNQvpSrsF5L8Ry2TFARCi0IFe8quSCRjXjeQqbv7Uhl3Dziij6euKRqit0heX',
                'username': username.trim(),
                'password': password,
                'grant_type': 'password'
            });

            console.log(res.data);
            await AsyncStorage.setItem('token', res.data.access_token);
            let u = await authApis(res.data.access_token).get(endpoints['current-user']);
                console.info(u.data);
            dispatch({
                "type": "LOGIN",
                "payload": u.data
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Đăng nhập thất bại', 'Vui lòng kiểm tra lại Tài khoản và Mật khẩu!');
        } finally {
            setLoading(false);
        }
        }
    };

    return (
        <SafeAreaView style={Styles.safeArea}>
            <ScrollView contentContainerStyle={Styles.container}>
                <View style={Styles.formContainer}>
                    <Image
                    source={require('../../assets/jobmate-logo.png')}
                    style={Styles.logoIcon}
                    />
                    <Text style={Styles.title}>JOBMATE</Text>
                    <Text style={Styles.subtitle}>Kết nối cơ hội – Dẫn lối thành công</Text>

                    <TextInput
                        label="Tên tài khoản"
                        value={username}
                        mode="outlined"
                        activeOutlineColor="#F2A0B6"
                        onChangeText={setUsername}
                        style={Styles.input}
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="account" />}
                    />

                    <TextInput
                        label="Mật khẩu"
                        value={password}
                        mode="outlined"
                        activeOutlineColor="#F2A0B6"
                        onChangeText={setPassword}
                        secureTextEntry={secureText}
                        style={Styles.input}
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="lock" />}
                        right={<TextInput.Icon icon={secureText ? "eye-off" : "eye"} onPress={() => setSecureText(!secureText)} />}
                    />

                    {loading ? (
                        <ActivityIndicator size="small" color="#F2A0B6" style={Styles.input} />
                    ) : (
                        <Button 
                            mode="contained" 
                            onPress={handleLogin}
                            buttonColor="#F2A0B6"
                            style={Styles.button}
                        >
                            Đăng nhập
                        </Button>
                    )}
                </View>
                <View style={Styles.registerContainer}>
                    <Text style={Styles.registerText}>Bạn chưa có tài khoản? </Text>
                    <Text 
                        style={Styles.registerLink} 
                        onPress={() => navigation.navigate('register')}
                    >
                        Đăng ký ngay
                    </Text>
                </View>
                <View style={Styles.guestContainer}>
                    <Text 
                        style={Styles.guestLink} 
                        onPress={() => {
                            // Nạp một Object ảo đánh dấu đây là Khách vào Context để mở khóa TabNavigator
                            dispatch({
                                "type": "LOGIN",
                                "payload": { username: "guest", role: "GUEST", first_name: "Khách", last_name: "" }
                            });
                        }}
                    >
                        Tiếp tục với tư cách Khách
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>

    );
};

export default Login;