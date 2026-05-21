// src/configs/Contexts.js

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi mở app
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Lỗi tải dữ liệu bảo mật:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStoredData();
  }, []);

  // Hàm xử lý đăng nhập thành công
  const login = async (userToken, userData) => {
    try {
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
    } catch (error) {
      console.log('Lỗi lưu Token đăng nhập:', error);
    }
  };

  // Hàm xử lý đăng xuất
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.log('Lỗi đăng xuất:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};