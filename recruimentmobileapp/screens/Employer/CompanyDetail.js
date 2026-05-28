import React, { useContext, useEffect, useState } from 'react';
import {
    View, StyleSheet, ScrollView, Alert, SafeAreaView,
    TouchableOpacity, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import {
    Avatar, Button, Card, Text, List, IconButton,
    TextInput, ActivityIndicator, Divider, Chip, Icon
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyUserContext from '../../configs/Contexts';
import Apis, { endpoints } from '../../configs/Apis';

const CompanyDetail = ({ route, navigation }) => {
    const [user] = useContext(MyUserContext);

    // companyId được truyền từ Profile (chỉ candidate/guest mới cần dùng)
    const companyId = route?.params?.companyId;

    const isOwner = user?.role === 'employer';

    // ─── State ───────────────────────────────────────────────
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form fields
    const [name, setName]             = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress]       = useState('');
    const [website, setWebsite]       = useState('');
    const [logo, setLogo]             = useState(null); // file object từ ImagePicker

    // ─── Load dữ liệu ────────────────────────────────────────
    useEffect(() => {
        loadCompany();
    }, []);

    const loadCompany = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            let response;

            if (isOwner) {
                // Employer dùng current-company để luôn lấy đúng công ty của mình
                response = await Apis.get(endpoints['current-company'], {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                // Candidate / guest dùng /companies/{id}/
                response = await Apis.get(endpoints['company-details'](companyId));
            }

            const data = response.data;
            setCompany(data);
            syncFormFields(data);
        } catch (err) {
            console.error('Lỗi tải thông tin công ty:', err);
            Alert.alert('Lỗi', 'Không thể tải thông tin công ty. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const syncFormFields = (data) => {
        setName(data.name || '');
        setDescription(data.description || '');
        setAddress(data.address || '');
        setWebsite(data.website || '');
        setLogo(null);
    };

    // ─── Chọn logo mới ───────────────────────────────────────
    const pickLogo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Thông báo', 'Ứng dụng cần quyền truy cập thư viện ảnh!');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8
        });
        if (!result.canceled) {
            setLogo(result.assets[0]);
        }
    };

    // ─── Lưu chỉnh sửa ───────────────────────────────────────
    const handleSave = async () => {
        if (!name.trim() || !address.trim()) {
            Alert.alert('Thông báo', 'Tên công ty và địa chỉ không được để trống!');
            return;
        }

        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('token');

            const form = new FormData();
            form.append('name', name.trim());
            form.append('description', description.trim());
            form.append('address', address.trim());
            if (website.trim()) form.append('website', website.trim());

            if (logo && logo.uri) {
                form.append('logo', {
                    uri: logo.uri,
                    name: logo.uri.split('/').pop() || 'logo.jpg',
                    type: 'image/jpeg'
                });
            }

            // Employer chỉ được PATCH qua current-company
            const response = await Apis.patch(endpoints['current-company'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setCompany(response.data);
                syncFormFields(response.data);
                setIsEditing(false);
                Alert.alert('Thành công', 'Thông tin công ty đã được cập nhật!');
            }
        } catch (err) {
            console.error('Lỗi cập nhật công ty:', err);
            Alert.alert('Thất bại', 'Cập nhật thất bại. Vui lòng thử lại!');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        syncFormFields(company);
        setIsEditing(false);
    };

    // ─── Render ───────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#F2A0B6" />
                <Text style={{ marginTop: 12, color: '#888' }}>Đang tải thông tin...</Text>
            </SafeAreaView>
        );
    }

    if (!company) {
        return (
            <SafeAreaView style={styles.center}>
                <Avatar.Icon size={64} icon="office-building-off" backgroundColor="#eee" />
                <Text style={{ marginTop: 12, color: '#888' }}>Không tìm thấy thông tin công ty.</Text>
                <Button mode="outlined" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
                    Quay lại
                </Button>
            </SafeAreaView>
        );
    }

    // Logo hiển thị: ưu tiên ảnh mới chọn, sau đó ảnh cũ từ server
    const logoUri = logo?.uri || company.logo;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Header Card: Logo + tên + trạng thái ── */}
                    <Card style={styles.headerCard}>
                        <Card.Content style={styles.headerContent}>
                            {/* Logo */}
                            <TouchableOpacity
                                onPress={isEditing ? pickLogo : undefined}
                                activeOpacity={isEditing ? 0.7 : 1}
                                style={styles.logoWrapper}
                            >
                                {logoUri ? (
                                    <Image source={{ uri: logoUri }} style={styles.logo} />
                                ) : (
                                    <Avatar.Icon
                                        size={90}
                                        icon="office-building"
                                        style={{ backgroundColor: '#F9E4EC' }}
                                        color="#F2A0B6"
                                    />
                                )}
                                {isEditing && (
                                    <View style={styles.cameraOverlay}>
                                        <Text style={{ color: '#fff', fontSize: 10 }}>Đổi logo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Tên công ty */}
                            <Text style={styles.companyName}>{company.name}</Text>
                            <View style={styles.addressContainer}>
                                {/* Dùng Icon của react-native-paper với thuộc tính source */}
                                <Icon source="map-marker-outline" size={16} color="#6B7280" />
                                
                                <Text style={styles.companyAddress}>
                                    {company.address}
                                </Text>
                            </View>

                            {/* Badge trạng thái duyệt - chỉ hiện cho employer */}
                            {isOwner && (
                                <View style={styles.badgeRow}>
                                    {company.is_approved ? (
                                        <Chip icon="check-circle" style={styles.chipApproved} textStyle={{ color: '#2e7d32', fontSize: 12 }}>
                                            Đã được duyệt
                                        </Chip>
                                    ) : (
                                        <Chip icon="clock-outline" style={styles.chipPending} textStyle={{ color: '#e65100', fontSize: 12 }}>
                                            Chờ kiểm duyệt
                                        </Chip>
                                    )}
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* ── Card thông tin chi tiết ── */}
                    <Card style={styles.infoCard}>
                        <Card.Title
                            title="Thông tin công ty"
                            titleStyle={styles.cardTitle}
                            right={(props) =>
                                isOwner && !isEditing ? (
                                    <IconButton
                                        {...props}
                                        icon="pencil-outline"
                                        iconColor="#F2A0B6"
                                        onPress={() => setIsEditing(true)}
                                    />
                                ) : null
                            }
                        />
                        <Divider />
                        <Card.Content style={{ paddingTop: 10 }}>
                            {isEditing ? (
                                /* ── Chế độ chỉnh sửa ── */
                                <View>
                                    <TextInput
                                        label="Tên công ty *"
                                        value={name}
                                        onChangeText={setName}
                                        mode="outlined"
                                        activeOutlineColor="#F2A0B6"
                                        style={styles.input}
                                    />
                                    <TextInput
                                        label="Địa chỉ *"
                                        value={address}
                                        onChangeText={setAddress}
                                        mode="outlined"
                                        activeOutlineColor="#F2A0B6"
                                        style={styles.input}
                                    />
                                    <TextInput
                                        label="Website"
                                        value={website}
                                        onChangeText={setWebsite}
                                        mode="outlined"
                                        activeOutlineColor="#F2A0B6"
                                        keyboardType="url"
                                        autoCapitalize="none"
                                        style={styles.input}
                                    />
                                    <TextInput
                                        label="Giới thiệu công ty"
                                        value={description}
                                        onChangeText={setDescription}
                                        mode="outlined"
                                        activeOutlineColor="#F2A0B6"
                                        multiline
                                        numberOfLines={5}
                                        style={[styles.input, { minHeight: 120 }]}
                                    />

                                    <View style={styles.buttonRow}>
                                        <Button
                                            mode="outlined"
                                            onPress={handleCancel}
                                            style={styles.rowButton}
                                            textColor="#666"
                                            disabled={saving}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            mode="contained"
                                            onPress={handleSave}
                                            loading={saving}
                                            disabled={saving}
                                            style={styles.rowButton}
                                            buttonColor="#F2A0B6"
                                        >
                                            Lưu lại
                                        </Button>
                                    </View>
                                </View>
                            ) : (
                                /* ── Chế độ xem ── */
                                <View>
                                    <List.Item
                                        title="Tên công ty"
                                        description={company.name || 'Chưa cập nhật'}
                                        left={props => <List.Icon {...props} icon="office-building" color="#F2A0B6" />}
                                        titleStyle={styles.listTitle}
                                    />
                                    <Divider style={styles.divider} />

                                    <List.Item
                                        title="Địa chỉ"
                                        description={company.address || 'Chưa cập nhật'}
                                        left={props => <List.Icon {...props} icon="map-marker" color="#F2A0B6" />}
                                        titleStyle={styles.listTitle}
                                    />
                                    <Divider style={styles.divider} />

                                    <List.Item
                                        title="Website"
                                        description={company.website || 'Chưa cập nhật'}
                                        left={props => <List.Icon {...props} icon="web" color="#F2A0B6" />}
                                        titleStyle={styles.listTitle}
                                        descriptionStyle={company.website ? styles.websiteText : {}}
                                    />
                                    <Divider style={styles.divider} />

                                    <List.Item
                                        title="Giới thiệu"
                                        description={company.description || 'Chưa có mô tả'}
                                        left={props => <List.Icon {...props} icon="text-box-outline" color="#F2A0B6" />}
                                        titleStyle={styles.listTitle}
                                        descriptionNumberOfLines={6}
                                        descriptionStyle={{ lineHeight: 20 }}
                                    />
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* ── Nút đăng tin (chỉ employer đã được duyệt) ── */}
                    {isOwner && company.is_approved && !isEditing && (
                        <Button
                            mode="contained"
                            icon="plus"
                            buttonColor="#F2A0B6"
                            onPress={() => navigation.navigate('PostJob')}
                            style={styles.postJobButton}
                            contentStyle={{ paddingVertical: 4 }}
                        >
                            Đăng tin tuyển dụng mới
                        </Button>
                    )}

                    {/* ── Thông báo chờ duyệt cho employer chưa được duyệt ── */}
                    {isOwner && !company.is_approved && !isEditing && (
                        <Card style={styles.warningCard}>
                            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <List.Icon icon="alert-circle-outline" color="#e65100" style={{ margin: 0 }} />
                                <Text style={styles.warningText}>
                                    Tài khoản đang chờ Admin kiểm duyệt. Sau khi được duyệt bạn mới có thể đăng tin tuyển dụng.
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    // Header Card
    headerCard: {
        borderRadius: 16,
        backgroundColor: '#fff',
        elevation: 2,
        marginBottom: 16,
    },
    headerContent: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 12,
    },
    logoWrapper: {
        width: 90,
        height: 90,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: '#F9E4EC',
        elevation: 2,
    },
    logo: {
        width: 90,
        height: 90,
        resizeMode: 'cover',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(242,160,182,0.85)',
        alignItems: 'center',
        paddingVertical: 4,
    },
    companyName: {
        width: '100%',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 4,
    },
    addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 4,
    marginTop: 6,
    maxWidth: '95%',
    },

    companyAddress: {
        fontSize: 14,
        color: '#4B5563',
        flexShrink: 1,
        textAlign: 'center',
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 4,
    },
    chipApproved: {
        backgroundColor: '#E8F5E9',
        borderColor: '#a5d6a7',
    },
    chipPending: {
        backgroundColor: '#FFF3E0',
        borderColor: '#ffcc80',
    },
    // Info Card
    infoCard: {
        borderRadius: 16,
        backgroundColor: '#fff',
        elevation: 2,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    listTitle: {
        fontSize: 12,
        color: '#999',
    },
    divider: {
        marginHorizontal: 16,
        backgroundColor: '#f0f0f0',
    },
    websiteText: {
        color: '#1565C0',
    },
    // Form inputs
    input: {
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 8,
    },
    rowButton: {
        width: '48%',
        borderRadius: 10,
    },
    // Post job button
    postJobButton: {
        borderRadius: 12,
        marginBottom: 12,
    },
    // Warning card
    warningCard: {
        borderRadius: 12,
        backgroundColor: '#FFF8F0',
        borderLeftWidth: 3,
        borderLeftColor: '#e65100',
        elevation: 0,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#bf360c',
        lineHeight: 19,
        marginLeft: 4,
    },
});

export default CompanyDetail;