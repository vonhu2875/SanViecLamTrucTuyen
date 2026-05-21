// src/components/common/FormInput.js

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../theme/globalStyles';

export default function FormInput({ 
  label, 
  iconName, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  keyboardType = 'default',
  autoCapitalize = 'none' 
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && <Text style={globalStyles.label}>{label}</Text>}
      <View style={globalStyles.inputContainer}>
        <Ionicons name={iconName} size={20} color="#8E8E93" style={globalStyles.inputIcon} />
        <TextInput
          style={globalStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#C7C7CC"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}