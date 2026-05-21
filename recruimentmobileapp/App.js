// App.js 

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';

import { AuthProvider } from './src/configs/Contexts';
import AppNavigator from './src/navigation/AppNavigator';

// Import đầy đủ 3 màn hình theo tiến trình cấu trúc của bạn
import SplashScreen from './src/screens/auth/SplashScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen'; // Mới thêm
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/candidate/HomeScreen'; // Mới thêm

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />

          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash" // Ép buộc luôn khởi động vào Splash đầu tiên
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#FAFAFA' },
              }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}