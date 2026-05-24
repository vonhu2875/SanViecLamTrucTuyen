import React, { useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';

// Import chuẩn 100% theo 2 file tách biệt của thầy mà bạn vừa làm xong
import MyUserContext from './configs/Contexts';
import MyUserReducer from './reducers/reducers';

// Import các màn hình (Lát nữa chúng ta sẽ tạo file sau)
import Home from './screens/Home/Home';
import Login from './screens/User/Login';
import Profile from './screens/User/Profile';

import Splash from './screens/User/Splash'; 
import Onboarding from './screens/User/Onboarding';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  // Khởi tạo useReducer dùng chung cho toàn bộ dự án theo đúng bài giảng
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <PaperProvider>
      {/* Bao bọc toàn bộ App bằng Context để chia sẻ trạng thái đăng nhập */}
      <MyUserContext.Provider value={[user, dispatch]}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user === null ? (
              <>
                <Stack.Screen name="splash" component={Splash} />
                <Stack.Screen name="onboarding" component={Onboarding} />
                <Stack.Screen name="login" component={Login} />
              </>
            ) : 
            (
              <>
                  <Tab.Screen name="profile" component={Profile} options={{ title: 'Cá nhân' }} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </MyUserContext.Provider>
    </PaperProvider>
  );
}