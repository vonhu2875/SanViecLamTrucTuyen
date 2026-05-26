import React, { useContext, useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, IconButton } from 'react-native-paper';

// Import chuẩn Context và Reducer của bạn
import MyUserContext from './configs/Contexts';
import MyUserReducer from './reducers/reducers';

// Import các màn hình
import Home from './screens/Home/Home';
import Login from './screens/User/Login';
import Profile from './screens/User/Profile';
import Splash from './screens/User/Splash'; 
import Onboarding from './screens/User/Onboarding';
import JobDetail from './screens/User/JobDetail';
import ApplyJob from './screens/User/ApplyJob';
import Register from './screens/User/Register';
import SavedJobs from './screens/User/SavedJob';
import PostJob from './screens/User/PostJob';
import ManageJobs from './screens/User/ManageJob';
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
        <Tab.Screen 
          name="ManageJobs" 
          component={ManageJobs} 
          options={{ 
            headerShown: true,
            headerLeft: () => null,
            headerTintColor: '#F2A0B6',
            title: 'Tin Tuyển Dụng Đã Đăng',
            tabBarLabel: 'Tin tuyển dụng',
            tabBarIcon: ({ color, size }) => 
              (
                <IconButton icon="briefcase-check" iconColor={color} size={size} style={{ margin: 0 }} />
              ),
          }} 
        />
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
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user === null ? (
              <>
                <Stack.Screen name="splash" component={Splash} />
                <Stack.Screen name="onboarding" component={Onboarding} />
                <Stack.Screen name="login" component={Login} />
                <Stack.Screen name="register" component={Register} options={{ 
                headerShown: true,
                title: 'Đăng nhập',
                headerTintColor: '#F2A0B6'
              }}
                />
              </>
            ) : 
            (
              <>
                  <Stack.Screen name="MainApp" component={MainTabs} />
              </>
            )}
            <Stack.Screen name="JobDetail" component={JobDetail} options={{ 
                headerShown: true,
                title: 'Chi tiết công việc',
                headerTintColor: '#F2A0B6'
              }}
            />
            
            <Stack.Screen name="ApplyJob" component={ApplyJob} 
                options={{ 
                  headerShown: true, 
                  title: 'Nộp hồ sơ ứng tuyển',
                  headerTintColor: '#F2A0B6'
                }} 
            />
            <Stack.Screen 
                name="PostJob" 
                component={PostJob} 
                options={{ 
                  headerShown: true,
                  headerTintColor: '#F2A0B6',
                  title: 'Đăng Tin Tuyển Dụng',
                }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </MyUserContext.Provider>
    </PaperProvider>
  );
}