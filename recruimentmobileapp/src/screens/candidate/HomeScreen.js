// src/screens/candidate/HomeScreen.js

import React, { useContext, useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dùng các Component của React Native Paper
import { Text, Searchbar, ActivityIndicator, Card, Chip, IconButton, TouchableRipple } from 'react-native-paper';

// Import hệ thống định dạng, màu sắc và Context của bạn
import { AuthContext } from '../../configs/Contexts';
import { globalStyles } from '../../theme/globalStyles';
import { COLORS } from '../../constants/Colors'; 

// Import dịch vụ API vừa tạo ở Bước 1
import { jobService } from '../../services/jobService';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hàm gọi API nạp dữ liệu từ Server
  const loadJobsFromServer = async (query = '', isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await jobService.getJobList(query);
      setJobs(data || []);
    } catch (error) {
      Alert.alert('Thông báo', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động tải danh sách khi mở màn hình
  useEffect(() => {
    loadJobsFromServer();
  }, []);

  // Lắng nghe khi người dùng gõ tìm kiếm (Có độ trễ nhẹ hoặc kích hoạt khi bấm nút tìm)
  const handleSearch = (query) => {
    setSearchQuery(query);
    loadJobsFromServer(query);
  };

  // Xử lý khi nhấn nút Lưu/Hủy Lưu việc làm trực tiếp trên danh sách
  const handleToggleSave = async (jobId, currentStatus) => {
    try {
      // Tối ưu UI: Đổi trạng thái icon ngay lập tức trên màn hình trước để tạo cảm giác mượt mà
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, saved: !currentStatus } : job
        )
      );

      // Gọi API thật lên server cập nhật cơ sở dữ liệu
      await jobService.toggleSaveJob(jobId);
    } catch (error) {
      // Nếu API lỗi, hoàn tác trạng thái cũ của Icon và báo lỗi
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, saved: currentStatus } : job
        )
      );
      Alert.alert('Thất bại', 'Không thể thực hiện thao tác lưu. Hãy đăng nhập lại.');
    }
  };

  // Component Card hiển thị từng công việc
  const renderJobCard = ({ item }) => (
    <Card style={globalStyles.jobCardFrame} elevation={1}>
      {/* Tương tác chạm 1: Bấm vào thân Card chuyển hướng tới trang Chi tiết */}
      <TouchableRipple 
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} 
        borderRadius={12}
      >
        <Card.Content style={globalStyles.jobCardContent}>
          
          <View style={globalStyles.jobCardRow}>
            {/* Ảnh đại diện chữ cái đầu tên công ty */}
            <View style={globalStyles.jobAvatarBox}>
              <Text style={globalStyles.jobAvatarText}>
                {item?.employer_name ? item.employer_name.charAt(0).toUpperCase() : 'J'}
              </Text>
            </View>

            {/* Thông tin công việc */}
            <View style={globalStyles.jobTextContainer}>
              <Text style={globalStyles.jobTitle} numberOfLines={1}>
                {item?.title || 'Chưa cập nhật tên công việc'}
              </Text>
              <Text style={globalStyles.jobCompany} numberOfLines={1}>
                {item?.employer_name || 'Công ty ẩn danh'}
              </Text>
            </View>

            {/* Tương tác chạm 2: Nút Bookmark lưu tin bài */}
            <IconButton
              icon={item?.saved ? "bookmark" : "bookmark-outline"}
              iconColor={item?.saved ? COLORS.primary : COLORS.textLighter}
              size={22}
              style={globalStyles.jobBookmarkBtn}
              onPress={() => handleToggleSave(item.id, item.saved)} 
            />
          </View>

          {/* Các nhãn thông tin phụ (Lương, Nơi làm việc) */}
          <View style={globalStyles.jobTagRow}>
            <Chip icon="cash" style={globalStyles.jobChip} textStyle={globalStyles.jobChipText}>
              {item?.salary || 'Thỏa thuận'}
            </Chip>
            <Chip icon="map-marker" style={globalStyles.jobChip} textStyle={globalStyles.jobChipText}>
              {item?.location || 'Toàn quốc'}
            </Chip>
          </View>

        </Card.Content>
      </TouchableRipple>
    </Card>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      
      {/* Thanh Header phía trên */}
      <View style={globalStyles.homeHeader}>
        <Text style={globalStyles.homeBrandText}>
          <Text style={{ color: COLORS.textDarker }}>Job</Text>
          <Text style={{ color: COLORS.primary }}>Mate</Text>
        </Text>
        
        <TouchableOpacity style={globalStyles.homeAvatarBtn}>
          <Text style={globalStyles.homeAvatarText}>
            {user?.last_name ? user.last_name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách cuộn chính */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderJobCard}
        contentContainerStyle={globalStyles.homeContentPadding}
        showsVerticalScrollIndicator={false}
        
        // Vuốt xuống để cập nhật dữ liệu mới từ Server
        refreshing={refreshing}
        onRefresh={() => loadJobsFromServer(searchQuery, true)}
        
        ListHeaderComponent={
          <View>
            <Text style={globalStyles.homeWelcomeTitle}>
              Chào {user?.last_name || 'bạn'},
            </Text>
            <Text style={globalStyles.homeWelcomeSub}>
              Bạn muốn tìm công việc gì hôm nay?
            </Text>

            {/* Tìm kiếm kết nối API */}
            <Searchbar
              placeholder="Tìm việc làm, công ty..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={globalStyles.homeSearchBar}
              inputStyle={globalStyles.homeSearchInput}
              iconColor={COLORS.textLighter}
              placeholderTextColor={COLORS.textLighter}
            />
            
            <Text style={globalStyles.homeSectionTitle}>
              Việc làm nổi bật
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator animating={true} color={COLORS.primary} size="large" style={{ marginTop: 50 }} />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 50, color: COLORS.textLighter }}>
              Không tìm thấy việc làm nào phù hợp.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}