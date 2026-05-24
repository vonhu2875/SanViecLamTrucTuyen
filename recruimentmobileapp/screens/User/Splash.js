import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, SafeAreaView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Styles from '../../styles/Styles'; 
import { COLORS } from '../../constants/Colors'; 

const Splash = ({ navigation }) => {
    // Khởi tạo giá trị cho hiệu ứng fade-in (từ mờ 0 đến rõ 1)
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Bắt đầu chạy animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200, // Thời gian mờ dần là 1.2s
            useNativeDriver: true,
        }).start();

        // Tự động chuyển sang Onboarding sau 2.5 giây
        const timer = setTimeout(() => {
            navigation.replace('onboarding'); 
        }, 2500);

        return () => clearTimeout(timer); // Xóa timer khi unmount để tránh lỗi rò rỉ bộ nhớ
    }, [fadeAnim, navigation]);

    return (
        <SafeAreaView style={[Styles.safeArea, { backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' }]}>
            <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                <View style={Styles.logoGlowContainer}>
                    <Image
                        source={require('../../assets/jobmate-logo.png')} 
                        style={Styles.splashLogo}
                    />
                </View>
                <Text style={Styles.splashTitle}>JOBMATE</Text>
                <Text style={Styles.splashSlogan}>Kết nối việc làm mơ ước</Text>
                
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
            </Animated.View>
        </SafeAreaView>
    );
};

export default Splash;