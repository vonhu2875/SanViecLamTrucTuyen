// screens/Employer/EmployerTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';

import EmployerDashboard from '../Employer/EmployerDashboard';
import CompanyProfile from '../Employer/CompanyProfile';
import ApplicantList from '../Employer/ApplicantList';  // ← thêm

const Tab = createBottomTabNavigator();

const EmployerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#FFFFFF', paddingBottom: 5, height: 60 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'EmployerDashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'ApplicantList') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'CompanyProfile') {
            iconName = focused ? 'office-building' : 'office-building-outline';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="EmployerDashboard"
        component={EmployerDashboard}
        options={{ title: 'Trang chủ' }}
      />
      <Tab.Screen
        name="ApplicantList"
        component={ApplicantList}
        options={{ title: 'Ứng viên' }}
      />
      <Tab.Screen
        name="CompanyProfile"
        component={CompanyProfile}
        options={{ title: 'Công ty' }}
      />
    </Tab.Navigator>
  );
};

export default EmployerTabs;