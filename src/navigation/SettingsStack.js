import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import HomePage from '../components/HomePage';
import SettingsScreen from '../components/SettingsScreen';

const Stack = createNativeStackNavigator();

const SettingsStack = () => (
    <>
        <StatusBar
            backgroundColor="#1783BB"
            barStyle="light-content"
            translucent={false}
        />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsMain" component={SettingsScreen} />
            <Stack.Screen name="HomePage" component={HomePage} />
        </Stack.Navigator>
    </>
);

export default SettingsStack;