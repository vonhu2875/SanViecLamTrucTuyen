import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { Card, Text, Searchbar, Chip, IconButton } from 'react-native-paper';
import MyUserContext from '../../configs/Contexts'; // Gọi Context để check xem có phải Guest không
import Apis, { endpoints } from '../../configs/Apis';
import Styles from '../../styles/Styles';
const Home = ({ navigation }) => {
    const [user] = useContext(MyUserContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Hàm gọi API lấy danh sách Job từ Django Backend
    const fetchJobs = async () => {
    try {
        setLoading(true);
        const response = await Apis.get(endpoints['jobs'], {
            params: searchQuery ? { search: searchQuery } : {}
        });
        const data = response.data;
        
        if (data && data.results) {
            setJobs(data.results);
        } else {
            setJobs(data);
        }
        } catch (error) {
            console.error("Lỗi gọi API Jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Tự động chạy khi mở màn hình hoặc khi người dùng gõ tìm kiếm
    useEffect(() => {
        fetchJobs();
    }, [searchQuery]);

    // Định dạng tiền tệ VND
    const formatSalary = (salary) => {
        if (!salary) return "Thỏa thuận";
        const num = parseFloat(salary) / 1000000;
        return `${num.toFixed(0)} triệu`;
    };

    // Render từng dòng Job trong danh sách
    const renderJobItem = ({ item }) => (
        <Card 
            style={[styles.jobCard, item.is_featured && styles.featuredCard]} 
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} // Bấm vào để sang xem chi tiết
        >
            <Card.Content style={styles.cardContent}>
                <Image 
                    source={item.employer?.logo ? { uri: item.employer.logo } : require('../../assets/icon.png')} 
                    style={styles.companyLogo}
                />
                
                <View style={styles.infoContainer}>
                    {/* Tên Job */}
                    <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
                    {/* Tên Công ty */}
                    <Text style={styles.companyName} numberOfLines={1}>{item.employer?.name}</Text>
                    
                    {/* Địa điểm & Mức lương */}
                    <View style={styles.tagContainer}>
                        <Chip icon="map-marker" style={styles.chip} textStyle={styles.chipText}>{item.location}</Chip>
                        <Chip icon="cash" style={styles.salaryChip} textStyle={styles.salaryChipText}>
                            {formatSalary(item.salary_min)} - {formatSalary(item.salary_max)}
                        </Chip>
                    </View>
                </View>

                {/* Nếu là gói tin tuyển dụng nổi bật (is_featured), gắn thêm ngôi sao */}
                {item.is_featured && (
                    <IconButton icon="star" iconColor="#FFD700" size={20} style={styles.starIcon} />
                )}
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={Styles.safeArea}>
            {/* Thanh tìm kiếm - Kết nối trực tiếp bộ lọc search_fields của Django */}
            <Searchbar
                placeholder="Tìm tiêu đề, công ty, địa điểm..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
            />

            {/* Trạng thái Loading khi đang tải dữ liệu */}
            {loading ? (
                <View style={[Styles.container, { justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color="#F2A0B6" />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderJobItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    // Kéo xuống để reload cập nhật Job mới
                    refreshing={loading}
                    onRefresh={fetchJobs}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Hiện tại chưa có công việc nào phù hợp.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    searchBar: {
        marginTop: 50,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
    },
    
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 30,
    },
    jobCard: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        marginBottom: 12,
        marginVertical: 8,
        elevation: 2,
    },
    featuredCard: {
        borderLeftWidth: 5,
        borderLeftColor: '#F2A0B6',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    companyLogo: {
        width: 60,
        height: 60,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        paddingRight: 10,
    },
    companyName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    tagContainer: {
        flexDirection: 'row',
        marginTop: 10,
        flexWrap: 'wrap'
    },
    chip: {
        backgroundColor: '#f0f0f0',
        marginRight: 6,
        height: 28,
        justifyContent: 'space-evenly',
        alignItems:'stretch',
        marginBottom: 6,
    },
    chipText: {
        fontSize: 11,
        color: '#555',
    },
    salaryChip: {
        backgroundColor: '#FFEBF0',
        height: 28,
        justifyContent: 'center',
    },
    salaryChipText: {
        fontSize: 11,
        color: '#F2A0B6',
        fontWeight: '600',
    },
    starIcon: {
        margin: 0,
        position: 'absolute',
        top: 5,
        right: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#888',
    },
});

export default Home;