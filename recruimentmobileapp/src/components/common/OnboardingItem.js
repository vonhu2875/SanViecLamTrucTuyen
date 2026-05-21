// src/components/common/OnboardingItem.js

import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../theme/globalStyles';

export default function OnboardingItem({ item, width }) {
  const circleSize = width * 0.55;

  return (
    <View style={[globalStyles.onboardItemContainer, { width: width }]}>
      {/* Vòng tròn chứa Icon động */}
      <View style={[
        globalStyles.onboardIconCircle, 
        { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }
      ]}>
        <Text style={{ fontSize: 70 }}>{item.icon}</Text>
      </View>
      
      {/* Tiêu đề quote */}
      <Text style={globalStyles.onboardTitle}>
        {item.title}
      </Text>
      
      {/* Mô tả chi tiết */}
      <Text style={globalStyles.onboardDescription}>
        {item.description}
      </Text>
    </View>
  );
}