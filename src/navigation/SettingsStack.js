import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../components/SettingsScreen';

const Stack = createNativeStackNavigator();

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
  </Stack.Navigator>
);

export default SettingsStack;