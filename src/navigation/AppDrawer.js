import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MainStack from './MainStack';
import SettingsStack from './SettingsStack';

const Drawer = createDrawerNavigator();

const AppDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 320,
        },
      }}
    >
      <Drawer.Screen 
        name="MainStack" 
        component={MainStack}
        options={{ title: 'Home' }}
      />
      <Drawer.Screen 
        name="SettingsStack" 
        component={SettingsStack}
        options={{ title: 'Settings' }}
      />
    </Drawer.Navigator>
  );
};

export default AppDrawer;