
import { StyleSheet, Dimensions, Platform, StatusBar } from "react-native";

// Lấy chiều cao màn hình (Để ngay dưới chỗ import, trên chữ const Styles)
const { height } = Dimensions.get('window');

const Styles = StyleSheet.create({
    colorMain: {
        primary: '#F2A0B6',
        secondary: '#F2A0B9',
        background: '#FFF0F2', 
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF0F2',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        paddingBottom: Platform.OS === 'android' ? 16 : 0,
    },
    container: 
    { 
        flexGrow: 1,
        justifyContent: 'center',
        padding: 15
    },
    formContainer: {
         padding: 20,
         justifyContent: 'center',
    },
    logoIcon: {
        width: 80,
        height: 80,
        alignSelf: 'center',
        resizeMode: 'contain'
    },
    title: { 
        marginTop: 5,
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#F2A0B6', 
        textAlign: 'center', 
        letterSpacing: 1.5,
    },
    subtitle: { 
        fontSize: 14, 
        color: 'gray', 
        textAlign: 'center', 
        marginBottom: 40, 
        marginTop: 5 
    },
    input: { 
        marginBottom: 15, 
        backgroundColor: '#fff',
        
    },
    button: {
        marginTop: 10, 
        paddingVertical: 5,
        backgroundColor: '#F2A0B9',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#666',
        fontSize: 14,
    },
    registerLink: {
        color: '#F2A0B6',
        fontWeight: 'bold',
        fontSize: 14,
    },
    guestContainer: 
    {
        alignItems: 'center',
        marginTop: 15,
    },
    guestLink: {
        color: '#666',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
    // === THÊM CHO SPLASH SCREEN ===
    splashLogo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    logoGlowContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF', // Tạo nền trắng nhẹ bo tròn quanh logo
        borderRadius: 40,
        marginBottom: 20,
        elevation: 5, // Đổ bóng nhẹ cho Android
        shadowColor: '#F2A0B6', // Đổ bóng cho iOS
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    splashTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#F2A0B6',
        letterSpacing: 2,
        marginBottom: 8,
    },
    splashSlogan: {
        fontSize: 16,
        color: '#6B7280', // Màu textLighter
        fontStyle: 'italic',
    },

    // === THÊM CHO ONBOARDING SCREEN ===
    onboardingTitle: {
        color: '#111827', // textDarker - Dùng màu đen đậm nhất cho nổi
        fontSize: 30, // To hơn (cũ là 24)
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1, // Hơi thưa chữ ra xíu cho sang
        lineHeight: 36,
    },
    onboardingDesc: {
        color: '#4B5563', // textLight - Dùng màu xám vừa, dễ đọc hơn (cũ là textLighter)
        fontSize: 17, // To hơn xíu (cũ là 16)
        marginTop: 20, // Xa title hơn xíu
        textAlign: 'center',
        paddingHorizontal: 25, // Bóp nội dung vào giữa
        lineHeight: 26,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30, // Đẩy lên cao xíu
    },
    indicator: {
        height: 10, // To hơn xíu
        width: 10,
        backgroundColor: '#D1D5DB', // Màu border đậm hơn tí cho dễ thấy trên nền hồng
        marginHorizontal: 6,
        borderRadius: 5,
    },
    onboardingBottom: {
        marginBottom: 50, // Giảm marginBottom để gom cụm lại
        paddingHorizontal: 30,
    },
    fancyIllustrationContainer: {
        height: height * 0.4, // Chiếm 40% chiều cao cho phần nhìn
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBgGlow: {
        width: height * 0.25,
        height: height * 0.25,
        backgroundColor: '#FFFFFF',
        borderRadius: height * 0.125, // Bo tròn tuyệt đối
        justifyContent: 'center',
        alignItems: 'center',
        // Đổ bóng cho giống bên Splash
        elevation: 8, 
        shadowColor: '#F2A0B6',
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    onboardingTextCtn: {
        marginTop: 30, // Khoảng cách giữa icon và chữ
    }
});

export default Styles;