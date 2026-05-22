// src/navigation/AppNavigator.js

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Lấy AuthContext để biết user đã đăng nhập chưa
import { AuthContext } from '../configs/Contexts';

// Import Screens Auth
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Import Screens Main Flow (Candidate)
import HomeScreen from '../screens/candidate/HomeScreen';

// import SavedJobsScreen from '../screens/candidate/SavedJobsScreen'; 
// import ProfileScreen from '../screens/candidate/ProfileScreen'; 

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- 1. Tạo Cụm Bottom Tabs cho Candidate ---
function CandidateTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F2A0B6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = 'home-outline';
          else if (route.name === 'SavedTab') iconName = 'bookmark-outline';
          else if (route.name === 'ProfileTab') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      {/* Các tab dưới đây bạn tạo file rỗng rồi import vào sau nhé */}
      {/* <Tab.Screen name="SavedTab" component={SavedJobsScreen} options={{ tabBarLabel: 'Đã lưu' }} /> */}
      {/* <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Hồ sơ' }} /> */}
    </Tab.Navigator>
  );
}

// --- 2. Cấu hình Luồng chính (App Navigator) ---
export default function AppNavigator() {
  // Lấy state đăng nhập từ Context (Chỉnh lại token state trong Contexts.js nếu cần)
  const { user } = useContext(AuthContext); 

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* LUỒNG XÁC THỰC (Khi chưa có user) */}
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} /> 
          </>
        ) : (
          /* LUỒNG BÊN TRONG APP (Khi đã đăng nhập) */
          <>
            {user.role === 'Candidate' || user.role === 'candidate' ? (
               <Stack.Screen name="CandidateMain" component={CandidateTabs} />
            ) : (
               // Chỗ này mốt sẽ để component EmployerTabs
               <Stack.Screen name="EmployerMain" component={CandidateTabs} /> 
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}