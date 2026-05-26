// screens/Employer/CompanyProfile.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Card, Avatar, Chip, Button, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import MyUserContext from '../../configs/Contexts';
import { EmployerContext } from '../../configs/EmployerContext';
import { COLORS } from '../../constants/Colors';
import Styles from '../../styles/Styles';

const CompanyProfile = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const { company, setCompany } = useContext(EmployerContext);
    const [loading, setLoading] = useState(false);

    const loadCurrentCompany = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['current-company']);
            if (res.data) setCompany(res.data);
        } catch (error) {
            console.log("Chưa có hồ sơ công ty:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!company) loadCurrentCompany();
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc muốn đăng xuất không?',
            [
                { text: 'Huỷ', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('token');
                        dispatch({ type: 'LOGOUT' });
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={[Styles.cpScrollContainer, { backgroundColor: COLORS.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* BANNER + LOGO */}
            <View style={[Styles.cpBanner, { backgroundColor: COLORS.primary }]}>
                <Text style={[Styles.cpBannerTitle, { color: COLORS.white }]}>
                    Hồ sơ Doanh nghiệp
                </Text>
            </View>

            {/* AVATAR NỔI LÊN */}
            <View style={Styles.cpAvatarWrapper}>
                <View style={[Styles.cpAvatarBorder, { borderColor: COLORS.white, backgroundColor: COLORS.white }]}>
                    <Avatar.Image
                        size={90}
                        source={
                            company?.logo
                                ? { uri: company.logo }
                                : require('../../assets/jobmate-logo.png')
                        }
                        style={{ backgroundColor: COLORS.primaryLight }}
                    />
                </View>
            </View>

            {/* TÊN CÔNG TY + BADGE */}
            <View style={Styles.cpCompanyNameBlock}>
                <Text style={[Styles.cpCompanyName, { color: COLORS.textDarker }]}>
                    {company?.name || 'Chưa cập nhật tên công ty'}
                </Text>
                <Text style={[Styles.cpCompanyAddress, { color: COLORS.textLight }]}>
                    {company?.address || 'Chưa có địa chỉ'}
                </Text>
                <View style={Styles.cpChipWrapper}>
                    {company?.is_approved ? (
                        <Chip
                            icon="check-decagram"
                            style={{ backgroundColor: '#10B981' }}
                            textStyle={{ color: COLORS.white, fontWeight: 'bold' }}
                        >
                            Đã xác minh · Được phép đăng tin
                        </Chip>
                    ) : (
                        <Chip
                            icon="clock-fast"
                            style={{ backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B' }}
                            textStyle={{ color: '#B45309' }}
                        >
                            Chờ Admin phê duyệt
                        </Chip>
                    )}
                </View>
            </View>

            {/* THÔNG TIN CHI TIẾT */}
            <View style={Styles.cpInfoSection}>

                {/* Website */}
                <Card style={{ backgroundColor: COLORS.cardBg }} elevation={2}>
                    <Card.Content>
                        <View style={Styles.cpCardRow}>
                            <Avatar.Icon
                                size={40} icon="web"
                                style={{ backgroundColor: COLORS.primaryLight }}
                                color={COLORS.primary}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={[Styles.cpCardLabel, { color: COLORS.textMuted }]}>Website</Text>
                                <Text style={Styles.cpCardValueLink}>
                                    {company?.website || 'Chưa có website'}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Mô tả */}
                <Card style={{ backgroundColor: COLORS.cardBg }} elevation={2}>
                    <Card.Content>
                        <View style={Styles.cpCardRowTop}>
                            <Avatar.Icon
                                size={40} icon="information-outline"
                                style={{ backgroundColor: COLORS.primaryLight }}
                                color={COLORS.primary}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={[Styles.cpCardLabel, { color: COLORS.textMuted }]}>Giới thiệu công ty</Text>
                                <Text style={[Styles.cpCardValueBody, { color: COLORS.textDark }]}>
                                    {company?.description || 'Chưa có mô tả.'}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Thông tin tài khoản */}
                <Card style={{ backgroundColor: COLORS.cardBg }} elevation={2}>
                    <Card.Content>
                        <Text style={[Styles.cpAccountTitle, { color: COLORS.textDarker }]}>
                            Thông tin tài khoản
                        </Text>
                        <View style={[Styles.cpCardRow, { marginBottom: 12 }]}>
                            <Avatar.Icon
                                size={38} icon="account-outline"
                                style={{ backgroundColor: COLORS.primaryLight }}
                                color={COLORS.primary}
                            />
                            <View>
                                <Text style={[Styles.cpCardLabel, { color: COLORS.textMuted }]}>Họ tên</Text>
                                <Text style={[Styles.cpCardValue, { color: COLORS.textDarker }]}>
                                    {user?.last_name} {user?.first_name}
                                </Text>
                            </View>
                        </View>
                        <Divider style={Styles.cpDivider} />
                        <View style={Styles.cpCardRow}>
                            <Avatar.Icon
                                size={38} icon="email-outline"
                                style={{ backgroundColor: COLORS.primaryLight }}
                                color={COLORS.primary}
                            />
                            <View>
                                <Text style={[Styles.cpCardLabel, { color: COLORS.textMuted }]}>Email</Text>
                                <Text style={[Styles.cpCardValue, { color: COLORS.textDarker }]}>
                                    {user?.email || 'Chưa có email'}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

            </View>

            {/* NÚT ĐĂNG XUẤT */}
            <View style={Styles.cpLogoutWrapper}>
                <Button
                    mode="outlined"
                    icon="logout"
                    textColor="#EF4444"
                    style={Styles.cpLogoutBtn}
                    onPress={handleLogout}
                >
                    Đăng xuất
                </Button>
            </View>

        </ScrollView>
    );
};

export default CompanyProfile;
