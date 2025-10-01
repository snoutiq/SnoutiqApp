import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordScreen from '../auth/ForgotPasswordScreen';
import LoginScreen from '../auth/LoginScreen';
import SignUpScreen from '../auth/SignUpScreen';
import SplashScreen from '../auth/SplashScreen';
import WelcomeScreen from '../auth/WelcomeScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
<<<<<<< HEAD
    <Stack.Screen name="SplashScreen" component={SplashScreen} />
    <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
    <Stack.Screen name="login" component={LoginScreen} />
=======
    <Stack.Screen name="Login" component={LoginScreen} />
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

export default AuthStack;