// src/theme/globalStyles.js

import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/Colors'; // Đã import bảng màu tập trung

export const globalStyles = StyleSheet.create({
  // ============================================
  // CÁC STYLE DÙNG CHUNG (LOGIN, REGISTER)
  // ============================================
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 140, 
    height: 140,
    marginBottom: 12,
  },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  slogan: {
    fontSize: 14,
    color: COLORS.textLighter,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20, 
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12, 
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
  },
  loginButton: {
    backgroundColor: COLORS.primary, 
    height: 52,
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ============================================
  // KHUNG SPLASH SCREEN
  // ============================================
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  splashLogo: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  splashSlogan: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textLighter,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 40,
  },

  // ============================================
  // KHUNG ONBOARDING
  // ============================================
  onboardSkipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 40,
  },
  onboardSkipText: {
    color: COLORS.textLighter,
    fontSize: 16,
    fontWeight: '500',
  },
  onboardItemContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardIconCircle: {
    backgroundColor: COLORS.primaryLight, 
    marginBottom: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  onboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  onboardDescription: {
    fontSize: 15,
    color: COLORS.textLighter,
    textAlign: 'center',
    lineHeight: 22,
  },
  onboardFooter: {
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 30,
    alignItems: 'center',
  },
  onboardDotRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  onboardDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // ============================================
  // GIAO DIỆN ĐĂNG KÝ (REGISTER)
  // ============================================
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 4,
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLighter,
  },
  roleTextActive: {
    color: COLORS.primary,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  avatarText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 8,
  },

  // ============================================
  // GIAO DIỆN HEADER CỦA HOMESCREEN
  // ============================================
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  homeBrandText: {
    fontSize: 26,
    fontWeight: '900',
  },
  homeAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primaryPastel,
  },
  homeAvatarText: {
    color: COLORS.primaryPastel,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // ============================================
  // NỘI DUNG CUỘN CỦA HOMESCREEN
  // ============================================
  homeContentPadding: {
    padding: 20,
  },
  homeWelcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDarker,
    marginBottom: 4,
  },
  homeWelcomeSub: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  homeSearchBar: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 0,
    marginBottom: 25,
  },
  homeSearchInput: {
    fontSize: 14,
    minHeight: 48,
    alignSelf: 'center',
  },
  homeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDarker,
    marginBottom: 15,
  },

  // ============================================
  // CARD HIỂN THỊ TIN TUYỂN DỤNG
  // ============================================
  jobCardFrame: {
    marginBottom: 15,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  jobCardContent: {
    padding: 16,
  },
  jobCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobAvatarText: {
    color: COLORS.primaryPastel,
    fontWeight: 'bold',
    fontSize: 16,
  },
  jobTextContainer: {
    flex: 1,
    paddingRight: 30,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDarker,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  jobBookmarkBtn: {
    position: 'absolute',
    right: -10,
    top: -5,
  },
  jobTagRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  jobChip: {
    backgroundColor: COLORS.backgroundLight,
    height: 28,
    borderRadius: 6,
  },
  jobChipText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});