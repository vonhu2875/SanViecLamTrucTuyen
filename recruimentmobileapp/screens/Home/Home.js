import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Image, SafeAreaView, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Searchbar, Chip, IconButton, Button, TextInput, Avatar } from 'react-native-paper';
import MyUserContext from '../../configs/Contexts'; 
import Apis, { endpoints } from '../../configs/Apis';
import Styles from '../../styles/Styles';

const Home = ({ navigation }) => {
    const [user] = useContext(MyUserContext);
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]); // 🌟 State lưu danh sách danh mục từ Backend
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // State quản lý bộ lọc nâng cao
    const [location, setLocation] = useState('');
    const [categoryId, setCategoryId] = useState(''); // 🌟 Sẽ được cập nhật khi ấn vào Tab danh mục
    const [skillName, setSkillName] = useState(''); 
    const [salaryMin, setSalaryMin] = useState('');   
    const [salaryMax, setSalaryMax] = useState('');   
    const [ordering, setOrdering] = useState('-created_date'); 
    const [showFilter, setShowFilter] = useState(false); 
    const [isJobFeature, setJobFeature] = useState(false);
    // State quản lý danh sách so sánh
    const [compareList, setCompareList] = useState([]); // mảng job objects đã chọn
    const hasCompareBar = compareList.length >= 2;

    const toggleCompare = (job) => {
        setCompareList(prev => {
            const exists = prev.find(j => j.id === job.id);
            if (exists) return prev.filter(j => j.id !== job.id);
            if (prev.length >= 4) {
                Alert.alert('Giới hạn', 'Chỉ được chọn tối đa 4 công việc để so sánh.');
                return prev;
            }
            return [...prev, job];
        });
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    // State phục vụ phân trang vô tận
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // 🌟 1. Hàm lấy danh sách danh mục ngành nghề từ Backend khi vào App
    const fetchCategories = async () => {
        try {
            const response = await Apis.get(endpoints['categories']);
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh mục ngành nghề:", error);
        }
    };

    // Hàm gọi API lấy danh sách Job từ Django Backend
    const fetchJobs = async (isRefresh = false) => {
        try {
            if (!isRefresh) 
                setLoading(true);
            setNextPageUrl(null);

            const params = new URLSearchParams();
            if (searchQuery) 
                params.append('search', searchQuery);
            if (ordering) 
                params.append('ordering', ordering);
            if (location) 
                params.append('location', location);
            
            // Đẩy id danh mục đang chọn lên Backend để lọc
            if (categoryId) 
                params.append('category', categoryId); 
            
            if (skillName) 
                params.append('skills__name', skillName); 
            if (salaryMin) 
                params.append('salary_min__gte', salaryMin);
            if (salaryMax) 
                params.append('salary_max__lte', salaryMax);
            if (isJobFeature)
                params.append('is_featured', 'true')

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const response = await Apis.get(`${endpoints['jobs']}${queryString}`);
            const data = response.data;
            
            if (data && data.results) {
                setJobs(data.results);
                setNextPageUrl(data.results.length > 0 ? data.next : null);
            } else {
                setJobs(data);
                setNextPageUrl(null);
            }
        } catch (error) {
            console.error("Lỗi gọi API Jobs:", error);
            Alert.alert("Lỗi", "Không thể tải danh sách công việc.");
        } finally {
            setLoading(false);
        }
    };

    const loadMoreJobs = async () => {
        if (!nextPageUrl || loadingMore) 
            return;
        try {
            setLoadingMore(true);
            const response = await Apis.get(nextPageUrl);
            if (response.data && response.data.results) {
                setJobs(prevJobs => [...prevJobs, ...response.data.results]); 
                setNextPageUrl(response.data.next); 
            }
        } catch (error) {
            console.error("Lỗi phân trang Jobs:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // 🌟 2. Gọi danh mục 1 lần duy nhất khi màn hình được mở
    useEffect(() => {
        fetchCategories();
    }, []);

    // 🌟 3. Tự động tải lại danh sách Job mỗi khi người dùng đổi từ khóa hoặc đổi Tab danh mục (categoryId)
    useEffect(() => {
        fetchJobs();
    }, [searchQuery, ordering, categoryId, isJobFeature]);

    const formatSalary = (salary) => {
        if (!salary) return "Thỏa thuận";
        const num = parseFloat(salary) / 1000000;
        return `${num.toFixed(0)} triệu`;
    };

    const renderJobItem = ({ item }) => {
        const isSelected = compareList.some(j => j.id === item.id);
        return (
            <Card 
                style={[styles.jobCard, item.is_featured && styles.featuredCard, isSelected && styles.selectedCard]} 
                onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} 
            >
                <Card.Content style={styles.cardContent}>
                    <Image 
                        source={item.employer?.logo ? { uri: item.employer.logo } : require('../../assets/icon.png')} 
                        style={styles.companyLogo}
                    />
                    <View style={styles.infoContainer}>
                        <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.companyName} numberOfLines={1}>{item.employer?.name}</Text>
                        
                        <View style={styles.tagContainer}>
                            <Chip icon="map-marker" style={styles.chip} textStyle={styles.chipText} compact={false}>
                                {item.location}
                            </Chip>
                            <Chip icon="cash" style={styles.salaryChip} textStyle={styles.salaryChipText} compact={false}>
                                {formatSalary(item.salary_min)} - {formatSalary(item.salary_max)}
                            </Chip>
                        </View>
                    </View>

                    {item.is_featured && (
                        <IconButton icon="star" iconColor="#FFD700" size={20} style={styles.starIcon} />
                    )}
                </Card.Content>

                {/* Nút chọn so sánh — góc dưới phải card */}
                <TouchableOpacity
                    style={[styles.compareToggleBtn, isSelected && styles.compareToggleBtnActive]}
                    onPress={() => toggleCompare(item)}
                    activeOpacity={0.8}
                >
                    <IconButton
                        icon={isSelected ? "check-circle" : "plus-circle-outline"}
                        iconColor={isSelected ? "#fff" : "#F2A0B6"}
                        size={16}
                        style={{ margin: 0 }}
                    />
                    <Text style={[styles.compareToggleText, isSelected && { color: '#fff' }]}>
                        {isSelected ? 'Đã chọn' : 'So sánh'}
                    </Text>
                </TouchableOpacity>
            </Card>
        );
    };

    return (
        <SafeAreaView style={Styles.safeArea}>
            {/* HEADER CHÀO HỎI */}
            <View style={[styles.welcomeHeader, { marginTop: -15 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {user && user.avatar ? (
                        <Avatar.Image size={45} source={{ uri: user.avatar }} style={{ backgroundColor: '#f0f0f0' }} />
                    ) : (
                        <Avatar.Icon size={45} icon="account-circle" color="#F2A0B6" style={{ backgroundColor: '#FFEBF0' }} />
                    )}
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.helloText}>
                            {user ? `Xin chào, ${user.first_name || user.username}` : 'Chào mừng bạn!'}
                        </Text>
                        <Text style={styles.subHelloText}>
                            {user?.role === 'employer' ? 'Hôm nay đăng tin gì mới?' : 'Tìm công việc mơ ước của bạn ngay'}
                        </Text>
                    </View>
                </View>
                <IconButton icon="bell-outline" iconColor="#333" size={24} style={{ backgroundColor: '#fff', elevation: 1, margin: 0 }} />
            </View>
            
            {/* THANH TÌM KIẾM CHÍNH */}
            <View style={{ paddingHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Searchbar
                    placeholder="Tìm tiêu đề, công ty..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { flex: 1 }]}
                    inputStyle={styles.searchInput}
                />
                <IconButton
                    icon={showFilter ? "filter-remove" : "filter-variant"}
                    iconColor={showFilter ? "#F2A0B6" : "#666"}
                    size={26}
                    style={{ marginTop: 10, marginLeft: 8, backgroundColor: '#fff', elevation: 2 }}
                    onPress={() => setShowFilter(!showFilter)}
                />
            </View>

            {/* PANEL BỘ LỌC NÂNG CAO */}
            {showFilter && (
                <Card style={styles.filterCard}>
                    <Card.Content>
                        <View style={styles.filterRow}>
                            <TextInput mode="outlined" placeholder="Địa điểm (Vd: Hà Nội)" value={location} onChangeText={setLocation} style={styles.filterInput} activeOutlineColor="#F2A0B6" dense />
                            <TextInput mode="outlined" placeholder="Kỹ năng" value={skillName} onChangeText={setSkillName} style={styles.filterInput} activeOutlineColor="#F2A0B6" dense />
                        </View>
                        <View style={[styles.filterRow, { marginTop: 8 }]}>
                            <TextInput mode="outlined" placeholder="Lương tối thiểu" value={salaryMin} onChangeText={setSalaryMin} keyboardType="numeric" style={styles.filterInput} activeOutlineColor="#F2A0B6" dense />
                            <TextInput mode="outlined" placeholder="Lương tối đa" value={salaryMax} onChangeText={setSalaryMax} keyboardType="numeric" style={styles.filterInput} activeOutlineColor="#F2A0B6" dense />
                        </View>
                        <View style={styles.sortContainer}>
                            <Text style={styles.sortLabel}>Sắp xếp theo:</Text>
                            <Button mode={ordering === '-created_date' ? 'contained' : 'outlined'} compact buttonColor={ordering === '-created_date' ? '#F2A0B6' : undefined} textColor={ordering === '-created_date' ? '#fff' : '#666'} style={styles.sortButton} onPress={() => setOrdering('-created_date')}>Ngày đăng</Button>
                            <Button mode={ordering === '-salary_max' ? 'contained' : 'outlined'} compact buttonColor={ordering === '-salary_max' ? '#F2A0B6' : undefined} textColor={ordering === '-salary_max' ? '#fff' : '#666'} style={styles.sortButton} onPress={() => setOrdering('-salary_max')}>Lương cao</Button>
                        </View>
                        <Button mode="contained" buttonColor="#F2A0B6" style={{ marginTop: 12 }} onPress={() => { fetchJobs(); setShowFilter(false); }}>Áp dụng bộ lọc</Button>
                    </Card.Content>
                </Card>
            )}

            
            <View style={{ marginBottom: 10 }}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryContainer}
                >
                    {/* Tab "Tất cả" mặc định */}
                    <TouchableOpacity 
                        style={[styles.categoryTab, (categoryId === '' && !isJobFeature) && styles.activeCategoryTab]}
                        onPress={() => {
                            setCategoryId('');
                            setJobFeature(false);
                        }}
                    >
                        <Text style={[styles.categoryTabText, (categoryId === '' && !isJobFeature) && styles.activeCategoryTabText]}>
                            Tất cả việc làm
                        </Text>
                    </TouchableOpacity>

                    {/* Tab "Nổi bật" */}
                    <TouchableOpacity 
                        style={[styles.categoryTab, isJobFeature === true && styles.activeCategoryTab]}
                        onPress={() => {
                            setCategoryId('');    // Reset danh mục để chỉ tập trung lọc nổi bật
                            setJobFeature(true);  // Kích hoạt nổi bật
                        }}
                    >
                        <Text style={[styles.categoryTabText, isJobFeature === true && styles.activeCategoryTabText]}>
                            Nổi bật
                        </Text>
                    </TouchableOpacity>

        
                    {categories.map((cat) => (
                        <TouchableOpacity 
                            key={cat.id}
                            style={[styles.categoryTab, (categoryId === cat.id && !isJobFeature) && styles.activeCategoryTab]} 
                            onPress={() => {
                                setCategoryId(cat.id);
                                setJobFeature(false);
                            }}
                        >
                            <Text style={[styles.categoryTabText, (categoryId === cat.id && !isJobFeature) && styles.activeCategoryTabText]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                        ))}
                </ScrollView>
            </View>

            {/* DANH SÁCH CÔNG VIỆC */}
            {loading ? (
                <View style={[Styles.container, { justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color="#F2A0B6" />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderJobItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[
                        styles.listContainer,
                        hasCompareBar && styles.listContainerWithCompareBar,
                    ]}
                    refreshing={loading}
                    onRefresh={() => fetchJobs(true)}
                    onEndReached={loadMoreJobs}
                    onEndReachedThreshold={0.1} 
                    initialNumToRender={6}
                    maxToRenderPerBatch={10}
                    ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#F2A0B6" style={{ marginVertical: 10 }} /> : null}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Hiện tại chưa có công việc nào phù hợp.</Text>
                    }
                />
            )}
            {/* FLOATING BAR SO SÁNH */}
            {hasCompareBar && (
                <View style={styles.floatingCompareBar}>
                    <View style={styles.floatingCompareHeader}>
                        <TouchableOpacity
                            style={styles.floatingCompareAction}
                            onPress={() => navigation.navigate('CompareJobs', { jobIds: compareList.map(j => j.id) })}
                            activeOpacity={0.9}
                        >
                            <IconButton icon="swap-horizontal" iconColor="#fff" size={20} style={{ margin: 0 }} />
                            <Text style={styles.floatingCompareText}>
                                So sánh {compareList.length} việc làm
                            </Text>
                        </TouchableOpacity>
                        <IconButton
                            icon="close"
                            iconColor="#fff"
                            size={18}
                            style={styles.floatingCloseBtn}
                            onPress={clearCompare}
                        />
                    </View>
                    <View style={styles.floatingBadgeRow}>
                        {compareList.map(j => (
                            <View key={j.id} style={styles.floatingBadge}>
                                <Text style={styles.floatingBadgeText} numberOfLines={1}>{j.title}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // 🌟 THÊM STYLES CHO THANH TAB NGANG ĐẸP MẮT
    categoryContainer: {
        paddingHorizontal: 16,
        paddingVertical: 5,
        alignItems: 'center',
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 1,
    },
    activeCategoryTab: {
        backgroundColor: '#FFEBF0',
        borderColor: '#F2A0B6',
    },
    categoryTabText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    activeCategoryTabText: {
        color: '#F2A0B6',
        fontWeight: 'bold',
    },
    
    welcomeHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16,paddingBottom: 8 },
    helloText: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    subHelloText: { fontSize: 12, color: '#666', marginTop: 2 },
    searchBar: { marginTop: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
    searchInput: { fontSize: 15 },
    filterCard: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 3 },
    filterRow: { flexDirection: 'row', justifyContent: 'space-between' },
    filterInput: { width: '48%', backgroundColor: '#fff' },
    sortContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    sortLabel: { fontSize: 13, color: '#555', fontWeight: '500', marginRight: 10 },
    sortButton: { marginRight: 8 },
    listContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 },
    listContainerWithCompareBar: { paddingBottom: 170 },
    jobCard: { backgroundColor: '#ffffff', borderRadius: 15, marginBottom: 12, marginVertical: 8, elevation: 2 },
    featuredCard: { borderLeftWidth: 5, borderLeftColor: '#F2A0B6' },
    cardContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    companyLogo: { width: 60, height: 60, borderRadius: 10, resizeMode: 'cover' },
    infoContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', paddingRight: 10 },
    companyName: { fontSize: 14, color: '#666', marginTop: 2 },
    tagContainer: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', gap: 6 },
    chip: {
        backgroundColor: '#f0f0f0',
        alignSelf: 'flex-start',
        maxWidth: '100%',
        marginBottom: 4,
        paddingVertical: 4,
    },
    chipText: { fontSize: 12, color: '#555', lineHeight: 18 },
    salaryChip: {
        backgroundColor: '#FFEBF0',
        alignSelf: 'flex-start',
        maxWidth: '100%',
        marginBottom: 4,
        paddingVertical: 4,
    },
    salaryChipText: { fontSize: 12, color: '#F2A0B6', fontWeight: '600', lineHeight: 18 },
    starIcon: { margin: 0, position: 'absolute', top: 5, right: 5 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#888' },

    // So sánh
    selectedCard: { borderWidth: 2, borderColor: '#F2A0B6', backgroundColor: '#FFF5F7' },
    compareToggleBtn: {
        flexDirection: 'row', alignItems: 'center',
        alignSelf: 'flex-end',
        marginRight: 12, marginBottom: 8,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, borderWidth: 1, borderColor: '#F2A0B6',
        backgroundColor: '#fff',
        gap: 2,
    },
    compareToggleBtnActive: { backgroundColor: '#F2A0B6', borderColor: '#F2A0B6' },
    compareToggleText: { fontSize: 12, color: '#F2A0B6', fontWeight: '600' },

    floatingCompareBar: {
        position: 'absolute', bottom: 16, left: 16, right: 16,
        backgroundColor: '#F2A0B6',
        borderRadius: 16, padding: 14,
        elevation: 8,
        shadowColor: '#F2A0B6', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    floatingCompareHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    floatingCompareAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    floatingCompareText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
    floatingCloseBtn: {
        margin: 0,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    floatingBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    floatingBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
        maxWidth: 140,
    },
    floatingBadgeText: { fontSize: 11, color: '#fff' },
});

export default Home;