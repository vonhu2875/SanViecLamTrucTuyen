// src/screens/auth/OnboardingScreen.js

import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../theme/globalStyles';
import CustomButton from '../../components/common/CustomButton';

// Cập nhật DATA: Thêm trường icon tương ứng với từng quote
const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Tìm công việc phù hợp',
    description: 'Khám phá hàng ngàn cơ hội việc làm chất lượng.',
    icon: '🔍', // Icon tìm kiếm
  },
  {
    id: '2',
    title: 'Kết nối nhà tuyển dụng',
    description: 'Ứng tuyển nhanh chóng và dễ dàng.',
    icon: '🤝', // Icon kết nối/bắt tay
  },
  {
    id: '3',
    title: 'Bắt đầu sự nghiệp',
    description: 'Tạo hồ sơ và ứng tuyển mọi lúc mọi nơi.',
    icon: '🚀', // Icon khởi đầu/tên lửa
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={[globalStyles.container, { flex: 1 }]}>
      
      {/* Nút Bỏ qua */}
      <View style={{ alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 10, height: 40 }}>
        {currentIndex < ONBOARDING_DATA.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '500' }}>Bỏ qua</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách các Slide vuốt ngang */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_DATA}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          // Tối ưu hiệu năng
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const contentOffsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(contentOffsetX / width);
            setCurrentIndex(index);
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: width, paddingHorizontal: 40, alignItems: 'center', justifyContent: 'center' }}>
              {/* Vòng tròn chứa Icon - Đổi động theo item.icon */}
              <View style={{ 
                width: width * 0.55, 
                height: width * 0.55, 
                backgroundColor: '#FFF1F2', 
                borderRadius: (width * 0.55) / 2, 
                marginBottom: 30, 
                justifyContent: 'center', 
                alignItems: 'center',
                // Hiệu ứng đổ bóng nhẹ cho vòng tròn icon
                shadowColor: "#F2A0B6",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
                elevation: 5
              }}>
                <Text style={{ fontSize: 70 }}>{item.icon}</Text>
              </View>
              
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 12 }}>
                {item.title}
              </Text>
              
              <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 }}>
                {item.description}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Chân trang cố định */}
      <View style={{ paddingHorizontal: 30, paddingTop: 10, paddingBottom: 30, alignItems: 'center' }}>
        
        {/* Indicators */}
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === index ? '#F2A0B6' : '#E5E7EB',
                width: currentIndex === index ? 24 : 8,
                marginHorizontal: 4
              }}
            />
          ))}
        </View>

        {/* Nút bấm chuyển trang */}
        <View style={{ width: '100%' }}>
          <CustomButton 
            title={currentIndex === ONBOARDING_DATA.length - 1 ? "Bắt đầu ngay" : "Tiếp tục"} 
            onPress={handleNext} 
          />
        </View>

      </View>
    </SafeAreaView>
  );
}