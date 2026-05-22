// components/common/CustomButton.js

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../theme/globalStyles';

export default function CustomButton({ title, onPress, loading = false }) {
  return (
    <TouchableOpacity 
      style={globalStyles.loginButton} 
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={globalStyles.loginButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}