import React, { useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import chuẩn 100% theo các file của bà
import MyUserContext from './configs/Contexts';
import MyUserReducer from './reducers/reducers';
import { EmployerProvider } from './configs/EmployerContext';

// Các màn hình Auth
import Splash from './screens/User/Splash'; 
import Onboarding from './screens/User/Onboarding';
import Login from './screens/User/Login';
import Home from './screens/Home/Home';

// IMPORT CÁC MÀN HÌNH STACK PHỤ CỦA EMPLOYER
import EmployerTabs from './screens/Employer/EmployerTabs'; // File Tab gom Dashboard, JobManagement, CompanyProfile
   
import ApplicantList from './screens/Employer/ApplicantList';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  // Khởi tạo useReducer dùng chung cho toàn bộ dự án theo đúng bài giảng
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <PaperProvider>
      {/* Bao bọc toàn bộ App bằng Context để chia sẻ trạng thái đăng nhập */}
      <MyUserContext.Provider value={[user, dispatch]}>
        
        {/* ĐƯA EMPLOYERPROVIDER RA ĐÂY: Nằm ngoài Navigator để tránh lỗi cấu trúc */}
        <EmployerProvider> 
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user === null ? (
                <>
                  <Stack.Screen name="splash" component={Splash} />
                  <Stack.Screen name="onboarding" component={Onboarding} />
                  <Stack.Screen name="login" component={Login} />
                </>
              ) : (user.role === 'employer' || user.role === 'EMPLOYER') ? (
                // Bỏ <> bọc ngoài, để Screen trực tiếp
                <>
                  <Stack.Screen name="EmployerMain" component={EmployerTabs} />
                  <Stack.Screen
                    name="ApplicantList"
                    component={ApplicantList}
                    options={{ headerShown: true, title: 'Danh sách ứng viên' }}
                  />
                </>
              ) : (
                <Stack.Screen name="Home" component={Home} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </EmployerProvider>

      </MyUserContext.Provider>
    </PaperProvider>
  );
}