import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '../components/HomePage';
import SettingsScreen from '../components/SettingsScreen';

const Stack = createNativeStackNavigator();

const SettingsStack = () => (
    <>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsMain" component={SettingsScreen} />
            <Stack.Screen name="HomePage" component={HomePage} />
        </Stack.Navigator>
    </>
);

export default SettingsStack;