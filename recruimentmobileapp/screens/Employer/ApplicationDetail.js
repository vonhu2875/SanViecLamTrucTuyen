// screens/Employer/ApplicationDetail.js
import React, { useState, useRef } from 'react';
import {
    View, ScrollView, StyleSheet, Alert,
    TouchableOpacity, TextInput, KeyboardAvoidingView,
    Platform, Keyboard,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApis, endpoints } from '../../configs/Apis';
import { COLORS } from '../../constants/Colors';

const STATUS_CONFIG = {
    pending:  { label: 'Chờ xem xét',  color: '#F59E0B', bg: '#FEF3C7', icon: 'clock-outline' },
    reviewed: { label: 'Đang xem xét', color: '#3B82F6', bg: '#EFF6FF', icon: 'eye-outline' },
    accepted: { label: 'Đã duyệt',     color: '#10B981', bg: '#E8F5E9', icon: 'check-circle-outline' },
    rejected: { label: 'Từ chối',      color: '#EF4444', bg: '#FFEBEE', icon: 'close-circle-outline' },
};

const normalizeCvUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    if (trimmed.startsWith('//')) {
        return `https:${trimmed}`;
    }
    return `https://${trimmed}`;
};

/** Cloudinary đôi khi trả PDF dưới /image/upload/ — chuẩn hóa sang /raw/upload/ */
const fixCloudinaryCvUrl = (url) => {
    const normalized = normalizeCvUrl(url);
    if (!normalized) return null;

    if (
        normalized.includes('res.cloudinary.com') &&
        normalized.includes('/image/upload/') &&
        /\.(pdf|doc|docx)($|\?)/i.test(normalized)
    ) {
        return normalized.replace('/image/upload/', '/raw/upload/');
    }
    return normalized;
};

/** Mở PDF/Word trên mobile qua Google Docs viewer (ổn định hơn mở link trực tiếp) */
const getCvViewerUrl = (fileUrl) => {
    if (/\.(pdf|doc|docx)($|\?)/i.test(fileUrl)) {
        return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
    }
    return fileUrl;
};

const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <MaterialCommunityIcons name={icon} size={15} color="#9CA3AF" style={{ width: 20 }} />
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue} numberOfLines={2}>{value || '—'}</Text>
    </View>
);

const ApplicationDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { application: initialApp, jobTitle, onStatusUpdate } = route.params;

    const [app, setApp] = useState(initialApp);
    const [comment, setComment] = useState(initialApp.employer_comment || '');
    const [saving, setSaving] = useState(false);
    const [openingCv, setOpeningCv] = useState(false);

    const openCvFile = async () => {
        const cvUrl = fixCloudinaryCvUrl(app.cv_file);
        if (!cvUrl) {
            Alert.alert('Thông báo', 'Ứng viên chưa đính kèm CV.');
            return;
        }

        const viewerUrl = getCvViewerUrl(cvUrl);

        try {
            setOpeningCv(true);
            await WebBrowser.openBrowserAsync(viewerUrl, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                showTitle: true,
            });
        } catch (error) {
            console.error('Lỗi mở CV:', error, cvUrl);
            Alert.alert(
                'Không mở được CV',
                'Không thể mở file trên thiết bị. Hãy thử lại hoặc kiểm tra kết nối mạng.'
            );
        } finally {
            setOpeningCv(false);
        }
    };

    const scrollRef = useRef(null);
    const commentRef = useRef(null);

    const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
    const candidateName = (app.candidate?.first_name || app.candidate?.last_name)
        ? `${app.candidate.last_name || ''} ${app.candidate.first_name || ''}`.trim()
        : app.candidate?.username || 'Ứng viên ẩn danh';

    const doReview = async (newStatus) => {
        const newCfg = STATUS_CONFIG[newStatus];
        Alert.alert(
            `Xác nhận: ${newCfg.label}`,
            `Cập nhật hồ sơ của ${candidateName} sang "${newCfg.label}"?`,
            [
                { text: 'Huỷ', style: 'cancel' },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            const token = await AsyncStorage.getItem('token');
                            const payload = {
                                status: newStatus,
                                employer_comment: comment.trim() || `Đã cập nhật: ${newCfg.label}`,
                            };
                            const res = await authApis(token).patch(
                                `${endpoints['applications']}${app.id}/review/`,
                                payload
                            );
                            const updated = res.data || { ...app, ...payload };
                            setApp(updated);
                            setComment(updated.employer_comment || '');
                            if (onStatusUpdate) onStatusUpdate(updated);
                            Alert.alert('Thành công', `Đã cập nhật: ${newCfg.label}`);
                        } catch (err) {
                            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const saveCommentOnly = async () => {
        Keyboard.dismiss();
        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const payload = { status: app.status, employer_comment: comment.trim() };
            const res = await authApis(token).patch(
                `${endpoints['applications']}${app.id}/review/`,
                payload
            );
            const updated = res.data || { ...app, ...payload };
            setApp(updated);
            setComment(updated.employer_comment || '');
            if (onStatusUpdate) onStatusUpdate(updated);
            Alert.alert('Đã lưu', 'Nhận xét của bạn đã được lưu.');
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể lưu nhận xét.');
        } finally {
            setSaving(false);
        }
    };

    // Khi focus vào ô nhận xét → scroll xuống cuối để form không bị bàn phím che
    const handleCommentFocus = () => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 300); // delay 300ms chờ bàn phím mở xong
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#F9FAFB' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
        >
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Thông tin ứng viên ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin ứng viên</Text>
                    <View style={styles.avatarRow}>
                        {app.candidate?.avatar ? (
                            <Avatar.Image size={64} source={{ uri: app.candidate.avatar }} />
                        ) : (
                            <Avatar.Text
                                size={64}
                                label={candidateName.substring(0, 2).toUpperCase()}
                                style={{ backgroundColor: COLORS.primaryLight || '#FCE4EC' }}
                                color={COLORS.primary}
                            />
                        )}
                        <View style={{ marginLeft: 14, flex: 1 }}>
                            <Text style={styles.candidateName}>{candidateName}</Text>
                            {/* Status pill — tự vẽ, không dùng Chip */}
                            <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                                <MaterialCommunityIcons name={cfg.icon} size={13} color={cfg.color} />
                                <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.infoBlock}>
                        <InfoRow icon="email-outline"    label="Email"    value={app.candidate?.email} />
                        <InfoRow icon="phone-outline"    label="SĐT"      value={app.candidate?.phone} />
                        <InfoRow icon="calendar-outline" label="Ngày nộp" value={
                            app.created_date ? new Date(app.created_date).toLocaleDateString('vi-VN') : null
                        } />
                    </View>
                </View>

                {/* ── Vị trí ứng tuyển ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vị trí ứng tuyển</Text>
                    <View style={styles.infoBlock}>
                        <InfoRow icon="briefcase-outline"  label="Vị trí"   value={app.job_title || jobTitle} />
                        <InfoRow icon="domain"             label="Công ty"  value={app.company_name} />
                        <InfoRow icon="map-marker-outline" label="Địa điểm" value={app.job_location} />
                    </View>
                </View>

                {/* ── Thư giới thiệu ── */}
                {app.cover_letter ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thư giới thiệu</Text>
                        <Text style={styles.coverLetter}>"{app.cover_letter}"</Text>
                    </View>
                ) : null}

                {/* ── CV ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hồ sơ CV</Text>
                    <TouchableOpacity
                        style={[styles.cvBtn, (!app.cv_file || openingCv) && { opacity: 0.4 }]}
                        onPress={openCvFile}
                        disabled={!app.cv_file || openingCv}
                    >
                        {openingCv ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <MaterialCommunityIcons name="file-document-outline" size={18} color={COLORS.primary} />
                        )}
                        <Text style={[styles.cvBtnText, { color: COLORS.primary }]}>
                            {openingCv ? 'Đang mở...' : (app.cv_file ? 'Mở CV' : 'Chưa có CV')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Nhận xét / Đánh giá ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nhận xét / Đánh giá</Text>
                    <TextInput
                        ref={commentRef}
                        style={styles.commentInput}
                        multiline
                        numberOfLines={5}
                        placeholder="Nhập nhận xét về ứng viên này..."
                        placeholderTextColor="#9CA3AF"
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                        onFocus={handleCommentFocus}   // ← scroll lên khi focus
                        scrollEnabled={false}           // để ScrollView cha scroll, không scroll bên trong
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={[styles.saveCommentBtn, saving && { opacity: 0.6 }]}
                        onPress={saveCommentOnly}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="content-save-outline" size={16} color="#fff" />
                                <Text style={styles.saveCommentText}>Lưu nhận xét</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── Nút hành động ── */}
                <View style={styles.actionSection}>
                    {(app.status === 'pending' || app.status === 'reviewed') && (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.rejectBtn, saving && { opacity: 0.5 }]}
                                onPress={() => doReview('rejected')}
                                disabled={saving}
                            >
                                <MaterialCommunityIcons name="close-circle-outline" size={18} color="#EF4444" />
                                <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Từ chối</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.acceptBtn, saving && { opacity: 0.5 }]}
                                onPress={() => doReview('accepted')}
                                disabled={saving}
                            >
                                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
                                <Text style={[styles.actionBtnText, { color: '#fff' }]}>Duyệt hồ sơ</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {(app.status === 'accepted' || app.status === 'rejected') && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.resetBtn, saving && { opacity: 0.5 }]}
                            onPress={() => doReview('pending')}
                            disabled={saving}
                        >
                            <MaterialCommunityIcons name="refresh" size={18} color="#6B7280" />
                            <Text style={[styles.actionBtnText, { color: '#6B7280' }]}>Đặt lại trạng thái</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    content: { padding: 14 },

    section: {
        backgroundColor: '#fff', borderRadius: 12,
        padding: 14, marginBottom: 12,
        elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: '#9CA3AF',
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
    },

    avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    candidateName: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6 },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    statusPillText: { fontSize: 12, fontWeight: '600' },

    infoBlock: { gap: 9 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
    infoLabel: { fontSize: 13, color: '#6B7280', width: 70 },
    infoValue: { fontSize: 13, color: '#111827', flex: 1, fontWeight: '500' },

    coverLetter: { fontSize: 13, color: '#6B7280', fontStyle: 'italic', lineHeight: 20 },

    cvBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: COLORS.primary,
        borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14,
        alignSelf: 'flex-start',
    },
    cvBtnText: { fontSize: 14, fontWeight: '600' },

    commentInput: {
        borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
        padding: 10, fontSize: 14, color: '#111827',
        minHeight: 110, backgroundColor: '#F9FAFB',
    },
    saveCommentBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, backgroundColor: '#6B7280',
        borderRadius: 8, paddingVertical: 10, marginTop: 10,
    },
    saveCommentText: { color: '#fff', fontSize: 14, fontWeight: '600' },

    actionSection: { marginTop: 4 },
    actionRow: { flexDirection: 'row', gap: 10 },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6,
        borderRadius: 10, paddingVertical: 13,
    },
    rejectBtn: { borderWidth: 1.5, borderColor: '#EF4444', backgroundColor: '#fff' },
    acceptBtn: { backgroundColor: '#10B981' },
    resetBtn:  { borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
    actionBtnText: { fontSize: 14, fontWeight: '700' },
});

export default ApplicationDetail;