// src/screens/auth/OnboardingScreen.js

import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../theme/globalStyles';

// Import các components dùng chung đúng folder cấu trúc
import CustomButton from '../../components/common/CustomButton';
import OnboardingItem from '../../components/common/OnboardingItem';

const ONBOARDING_DATA = [
  { id: '1', title: 'Tìm công việc phù hợp', description: 'Khám phá hàng ngàn cơ hội việc làm chất lượng.', icon: '🔍' },
  { id: '2', title: 'Kết nối nhà tuyển dụng', description: 'Ứng tuyển nhanh chóng và dễ dàng.', icon: '🤝' },
  { id: '3', title: 'Bắt đầu sự nghiệp', description: 'Tạo hồ sơ và ứng tuyển mọi lúc mọi nơi.', icon: '🚀' },
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
      
      {/* Cụm nút Bỏ qua */}
      <View style={globalStyles.onboardSkipContainer}>
        {currentIndex < ONBOARDING_DATA.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={globalStyles.onboardSkipText}>Bỏ qua</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách slide trượt ngang gọi Component riêng biệt */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_DATA}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
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
          renderItem={({ item }) => <OnboardingItem item={item} width={width} />}
        />
      </View>

      {/* Chân trang: Hệ thống dots báo vị trí + Nút điều hướng */}
      <View style={globalStyles.onboardFooter}>
        <View style={globalStyles.onboardDotRow}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                globalStyles.onboardDot,
                {
                  backgroundColor: currentIndex === index ? '#F2A0B6' : '#E5E7EB',
                  width: currentIndex === index ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

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