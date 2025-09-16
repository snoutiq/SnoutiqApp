import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import Appointment from '../components/Appointments';
import HomePage from '../components/HomePage';
import ProfileScreen from '../components/ProfileScreen';
import SocialMedia from '../components/SocialMedia';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const macDockColors = {
  background: 'rgba(255, 255, 255, 0.9)',
  border: 'rgba(200, 200, 200, 0.5)',
  active: '#1783BB',
  inactive: '#555',
  indicator: '#1783BB',
};

const MacDockTabBar = ({ state, descriptors, navigation }) => {
  const iconScale = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // If keyboard is visible, hide the dock
  if (keyboardVisible) return null;

  return (
    <View style={styles.dockContainer}>
      <View style={styles.dock}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }

            Animated.sequence([
              Animated.timing(iconScale[index], {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(iconScale[index], {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconName = {
            HomePage: 'home-outline',
            SocialMedia: 'images-outline',
            Appointment: 'document-text-outline',
            Profile: 'person-outline'
          }[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.dockIconContainer}
            >
              <Animated.View style={[
                styles.dockIconWrapper,
                isFocused && styles.dockIconWrapperFocused,
                { transform: [{ scale: iconScale[index] }] }
              ]}>
                <Icon 
                  name={iconName} 
                  size={moderateScale(28)} 
                  color={isFocused ? macDockColors.active : macDockColors.inactive} 
                />
              </Animated.View>
              {isFocused && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <MacDockTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true, // This works with keyboard visibility
      }}
    >
      <Tab.Screen name="HomePage" component={HomePage} />
      <Tab.Screen name="SocialMedia" component={SocialMedia} />
      <Tab.Screen name="Appointment" component={Appointment} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: verticalScale(5),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  dock: {
    flexDirection: 'row',
    backgroundColor: macDockColors.background,
    borderRadius: moderateScale(30),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(1),
    marginHorizontal: scale(20),
    borderWidth: 1,
    borderColor: macDockColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      },
    }),
  },
  dockIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconWrapper: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
  },
  dockIconWrapperFocused: {
    backgroundColor: 'rgba(23, 131, 187, 0.15)',
  },
  indicator: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
    backgroundColor: macDockColors.indicator,
  },
});

export default BottomTabs;
