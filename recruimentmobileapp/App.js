import React, { useReducer } from 'react';
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//Tạo một hàm riêng quản lý bộ các Tab dưới đáy màn hình
function MainTabs() {
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
        {{ title: 'Trang chủ', tabBarIcon: ({ color, size }) => 
          (
            <IconButton icon="home" iconColor={color} size={size} style={{margin: 0}} />
          )
        }} 
      />

      {/* Tab Cá Nhân */}
      <Tab.Screen name="profile" component={Profile} options=
        {{ title: 'Cá nhân', tabBarIcon: ({ color, size }) => 
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
              </>
            ) : 
            (
              <>
                  <Stack.Screen name="MainApp" component={MainTabs} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </MyUserContext.Provider>
    </PaperProvider>
  );
}