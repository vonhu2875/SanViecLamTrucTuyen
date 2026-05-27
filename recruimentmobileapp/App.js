import React, { useContext, useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton, Provider as PaperProvider } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import chuẩn 100% theo các file của bà
import MyUserContext from './configs/Contexts';
import MyUserReducer from './reducers/reducers';
import { EmployerProvider } from './configs/EmployerContext';

// Các màn hình Auth
import Splash from './screens/User/Splash'; 
import Onboarding from './screens/User/Onboarding';

import JobDetail from './screens/User/JobDetail';
import ApplyJob from './screens/User/ApplyJob';
import Register from './screens/User/Register';
import SavedJobs from './screens/User/SavedJob';
import PostJob from './screens/User/PostJob';
import Profile from './screens/User/Profile';
import Login from './screens/User/Login';
import Home from './screens/Home/Home';
import EmployerDashboard from './screens/Employer/EmployerDashboard';
import ApplicationDetail from './screens/Employer/ApplicationDetail';
import CompanyDetail from './screens/Employer/CompanyDetail';

import ApplicantList from './screens/Employer/ApplicantList';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//Tạo một hàm riêng quản lý bộ các Tab dưới đáy màn hình
function MainTabs() {
  const [user] = useContext(MyUserContext); // Lấy thông tin user để điều kiện hiển thị tab
  return (
    <Tab.Navigator 
      screenOptions={{ 
        tabBarActiveTintColor: '#F2A0B6',
        tabBarInactiveTintColor: '#666',
        headerShown: false
      }}
    >
      {/* Tab Trang Chủ */}
      <Tab.Screen name="home" component={Home} options=
        {{ headerShown: true,
          headerLeft: () => null,
          headerTintColor: '#F2A0B6',
          title: 'Trang chủ', tabBarIcon: ({ color, size }) => 
          (
            <IconButton icon="home" iconColor={color} size={size} style={{margin: 0}} />
          )
        }} 
      />
      {user && user.role === 'candidate' && 
        <Tab.Screen name="savedJobs" component={SavedJobs} options=
          {{
            headerShown: true,
            headerLeft: () => null,
            headerTintColor: '#F2A0B6',
            title: 'Công việc đã lưu',
            tabBarLabel: 'Đã lưu',
            tabBarIcon: ({ color, size }) => 
            (
              <IconButton icon="bookmark" iconColor={color} size={size} style={{margin: 0}} />
            )
          }} 
        />
      }
      {user && user.role === 'employer' &&
        (<>
        
        <Tab.Screen name="EmployerMain" component={EmployerDashboard} options={{
            headerShown: true, 
            title: 'Tin tuyển dụng đã đăng',
              tabBarLabel: 'Tin đã đăng',
              headerTintColor: '#F2A0B6',
              tabBarIcon: ({ color, size }) => (<IconButton
              icon="briefcase-check"
              iconColor={color}
              
              size={size}
              style={{ margin: 0 }}
            />)
            }}
        />
        <Tab.Screen
              name="ApplicantList"
              component={ApplicantList}
              options={{ headerShown: true, 
              tabBarLabel: 'Ứng viên',
              headerTintColor: '#F2A0B6',
              title: 'Danh sách ứng viên',
                tabBarIcon: ({ color, size }) => (
                <IconButton icon="account-group-outline" iconColor={color} size={size} style={{ margin: 0 }}/>
              )
              }}
            />
        </>)
      }
      {/* Tab Cá Nhân */}
      <Tab.Screen name="profile" component={Profile} 
        options=
        {{ 
          headerShown: true,
          headerLeft: () => null,
          headerTintColor: '#F2A0B6',
          tabBarLabel: 'Cá nhân',
          title: 'Thông tin cá nhân',
          tabBarIcon: ({ color, size }) => 
          (
            <IconButton icon="account" iconColor={color} size={size} style={{margin: 0}} />
          )
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
 
  return (
    <PaperProvider>
      <MyUserContext.Provider value={[user, dispatch]}>        
        <EmployerProvider> 
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user === null ? (
                <>
                  <Stack.Screen name="splash" component={Splash} />
                  <Stack.Screen name="onboarding" component={Onboarding} />
                  <Stack.Screen name="login" component={Login} />
                  <Stack.Screen name="register" component={Register} options={{ 
                    headerShown: true,
                    title: 'Đăng ký',
                    headerTintColor: '#F2A0B6'
                  }} />
                </>
              ) : (
                <Stack.Screen name="MainApp" component={MainTabs} />
              )}
 
              <Stack.Screen name="JobDetail" component={JobDetail} options={{ 
                headerShown: true,
                title: 'Chi tiết công việc',
                headerTintColor: '#F2A0B6'
              }} />
              <Stack.Screen name="ApplyJob" component={ApplyJob} options={{ 
                headerShown: true, 
                title: 'Nộp hồ sơ ứng tuyển',
                headerTintColor: '#F2A0B6'
              }} />
              <Stack.Screen name="PostJob" component={PostJob} options={{ 
                headerShown: true,
                headerTintColor: '#F2A0B6',
                title: 'Đăng Tin Tuyển Dụng',
              }} />
              <Stack.Screen name="StackApplicantList" component={ApplicantList} options={{
                headerShown: true,
                headerTintColor: '#F2A0B6',
                title: 'Danh sách ứng viên',
              }} />
              <Stack.Screen name="ApplicationDetail" component={ApplicationDetail} options={{ 
                headerShown: true,
                title: 'Chi tiết hồ sơ',
                headerTintColor: '#F2A0B6'
              }} />
              <Stack.Screen name="CompanyDetail" component={CompanyDetail} options={{ 
                headerShown: true,
                title: 'Thông tin công ty',
                headerTintColor: '#F2A0B6'
                }} />
            </Stack.Navigator>
          </NavigationContainer>
        </EmployerProvider>
      </MyUserContext.Provider>
    </PaperProvider>
  );
}
 







