import React, { useState, useContext } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, List, IconButton, ActivityIndicator } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import Apis, { endpoints } from '../../configs/Apis';
import MyUserContext from '../../configs/Contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const ApplyJob = ({ route, navigation }) => {
    const { jobId, jobTitle } = route.params; // Lấy dữ liệu từ trang JobDetail ném sang
    const [user] = useContext(MyUserContext);
    
    const [coverLetter, setCoverLetter] = useState('');
    const [fileCV, setFileCV] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Hàm chọn File từ điện thoại
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], // Chỉ nhận PDF/Word
            });

            if (!result.canceled) {
                setFileCV(result.assets[0]); // Lưu thông tin file vào state
            }
        } catch (err) {
            console.error("Lỗi chọn file:", err);
        }
    };

    // 2. Hàm nộp hồ sơ lên Server
    const handleApply = async () => {
        if (!fileCV) {
            Alert.alert("Thông báo", "Vui lòng chọn file CV của bạn!");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');

            const formData = new FormData();
            formData.append('job', jobId);
            formData.append('cover_letter', coverLetter);
            
            // Xử lý định dạng file cho FormData
            formData.append('cv_file', {
                uri: fileCV.uri,
                name: fileCV.name,
                type: fileCV.mimeType || 'application/pdf', 
            });

            const res = await Apis.post(endpoints['apply-job'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (res.status === 201) {
                Alert.alert("Thành công", "Hồ sơ của bạn đã được gửi tới nhà tuyển dụng!");
                navigation.goBack(); // Nộp xong thì quay lại trang chi tiết
            }
        } catch (error) {
            console.error("Lỗi nộp đơn:", error.response?.data || error.message);
            if (error.response && error.response.data && error.response.data.detail)
                Alert.alert("Thông báo", error.response.data.detail);
            else
                Alert.alert("Lỗi", "Không thể nộp hồ sơ lúc này. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.header}>Ứng tuyển vị trí:</Text>
                    <Text style={styles.jobName}>{jobTitle}</Text>

                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.label}>1. Tải lên CV của bạn (PDF/Word)</Text>
                            <Button 
                                icon="file-upload" 
                                mode="outlined" 
                                onPress={pickDocument}
                                style={styles.fileBtn}
                                textColor="#F2A0B6"
                            >
                                {fileCV ? "Chọn file khác" : "Bấm để chọn file"}
                            </Button>
                            
                            {fileCV && (
                                <List.Item
                                    title={fileCV.name}
                                    left={props => <List.Icon {...props} icon="check-circle" color="green" />}
                                    right={props => <IconButton {...props} icon="close" onPress={() => setFileCV(null)} />}
                                    style={styles.fileInfo}
                                />
                            )}

                            <Text style={[styles.label, { marginTop: 20 }]}>2. Thư giới thiệu (Không bắt buộc)</Text>
                            <TextInput
                                mode="outlined"
                                placeholder="Viết một vài dòng giới thiệu về bản thân bạn..."
                                multiline
                                numberOfLines={6}
                                value={coverLetter}
                                onChangeText={setCoverLetter}
                                style={styles.input}
                                outlineColor="#eee"
                                activeOutlineColor="#F2A0B6"
                            />
                        </Card.Content>
                    </Card>

                    {loading ? (
                        <ActivityIndicator color="#F2A0B6" size="large" style={{ marginTop: 20 }} />
                    ) : (
                        <Button 
                            mode="contained" 
                            onPress={handleApply}
                            style={styles.submitBtn}
                            buttonColor="#F2A0B6"
                        >
                            Xác nhận nộp hồ sơ
                        </Button>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { paddingLeft: 20, paddingRight: 20, paddingBottom: 30 },
    header: { fontSize: 16, color: '#666' },
    jobName: { fontSize: 20, fontWeight: 'bold', color: '#F2A0B6', marginBottom: 20, marginTop: 20 },
    card: { backgroundColor: '#fff', elevation: 2, borderRadius: 12 },
    label: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#333' },
    fileBtn: { marginVertical: 10, borderStyle: 'dashed', borderWidth: 1.5 },
    fileInfo: { backgroundColor: '#f0f9f0', borderRadius: 8, marginTop: 5 },
    input: { backgroundColor: '#fff', fontSize: 14, paddingTop: 10 },
    submitBtn: { marginTop: 30, paddingVertical: 5, borderRadius: 10 },
});

export default ApplyJob;