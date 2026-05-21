// src/components/common/AppHeader.js

import React from 'react';
import { View, Text, Image } from 'react-native';
import { globalStyles } from '../../theme/globalStyles';

export default function AppHeader() {
  return (
    <View style={globalStyles.headerContainer}>
      <Image 
        source={require('../../../assets/jobmate-logo.png')}
        style={globalStyles.logo}
        resizeMode="contain"
      />
      <Text style={globalStyles.appName}>JobMate</Text>
      <Text style={globalStyles.slogan}>Kết nối cơ hội – Dẫn lối thành công</Text>
    </View>
  );
}