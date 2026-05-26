
import { StyleSheet, Dimensions } from "react-native";

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
    },
    container:
    {
        flexGrow: 1,
        justifyContent: 'center',
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
        marginTop: 15,
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
    },
    // === APPLICANT LIST ===
    appListRoot: { flex: 1 },
    appListHeader: { padding: 16, paddingTop: 50, paddingBottom: 8 },
    appListTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
    appListSearchbar: { marginBottom: 12 },
    appListChipRow: { flexDirection: 'row', gap: 8 },
    appListFlatList: { padding: 16, paddingTop: 50, paddingBottom: 40 },
    appListEmpty: { alignItems: 'center', marginTop: 60 },
    appListEmptyText: { marginTop: 12, fontStyle: 'italic' },

    // Applicant card
    appCard: { marginBottom: 12 },
    appCardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    appCardAvatar: { marginRight: 12 },
    appCardInfo: { flex: 1 },
    appCardName: { fontSize: 15, fontWeight: 'bold' },
    appCardEmail: { fontSize: 12 },
    appCardJobTitle: { fontSize: 12 },
    appCardStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    appCardDate: { fontSize: 11 },
    appCardCoverLetter: { fontSize: 13, fontStyle: 'italic', marginBottom: 10 },
    appCardActions: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
    appCardActionBtns: { flexDirection: 'row', gap: 6 },

    // === COMPANY PROFILE ===
    cpScrollContainer: { paddingBottom: 40 },
    cpBanner: { height: 150, justifyContent: 'center', alignItems: 'center', paddingTop: 5 },
    cpBannerTitle: { fontSize: 25, fontWeight: 'bold' },
    cpAvatarWrapper: { alignItems: 'center', marginTop: -48, marginBottom: 12 },
    cpAvatarBorder: { borderRadius: 999, borderWidth: 4, elevation: 4 },
    cpCompanyNameBlock: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 },
    cpCompanyName: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    cpCompanyAddress: { fontSize: 13, marginTop: 4, textAlign: 'center' },
    cpChipWrapper: { marginTop: 10 },
    cpInfoSection: { paddingHorizontal: 16, gap: 12 },
    cpCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cpCardRowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    cpCardLabel: { fontSize: 11 },
    cpCardValue: { fontSize: 14, marginTop: 2 },
    cpCardValueLink: { fontSize: 14, marginTop: 2, color: '#3B82F6' },
    cpCardValueBody: { fontSize: 14, marginTop: 2, lineHeight: 20 },
    cpAccountTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
    cpDivider: { marginBottom: 12 },
    cpLogoutWrapper: { paddingHorizontal: 16, marginTop: 24 },
    cpLogoutBtn: { borderColor: '#EF4444', borderRadius: 10, paddingVertical: 4 },

    // === EMPLOYER DASHBOARD ===
    dashScrollContainer: { padding: 16, paddingTop: 50, paddingBottom: 40 },
    dashPageTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    dashSubtitle: { fontSize: 14, marginBottom: 20 },
    dashStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    dashStatCard: { flex: 1 },
    dashStatCardContent: { alignItems: 'center', paddingVertical: 14 },
    dashStatNumber: { fontSize: 22, fontWeight: 'bold', marginTop: 6 },
    dashStatLabel: { fontSize: 11, textAlign: 'center' },
    dashBreakdownCard: { marginBottom: 24 },
    dashBreakdownTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
    dashBreakdownRow: { flexDirection: 'row', justifyContent: 'space-around' },
    dashBreakdownItem: { alignItems: 'center' },
    dashBreakdownNumber: { fontSize: 20, fontWeight: 'bold' },
    dashBreakdownLabel: { fontSize: 12 },
    dashBreakdownDivider: { width: 1 },
    dashJobsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    dashJobsTitle: { fontSize: 16, fontWeight: 'bold' },
    dashJobsCount: { fontSize: 12 },
    dashEmptyCardContent: { alignItems: 'center', paddingVertical: 30 },
    dashEmptyText: { marginTop: 12, fontStyle: 'italic' },
    dashJobCard: { marginBottom: 12 },
    dashJobCardInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    dashJobCardLeft: { flex: 1, marginRight: 10 },
    dashJobTitle: { fontSize: 15, fontWeight: 'bold' },
    dashJobMeta: { fontSize: 13, marginTop: 4 },
    dashJobSalary: { fontSize: 13 },
    dashJobDeadline: { fontSize: 12, marginTop: 2 }
});

export default Styles;