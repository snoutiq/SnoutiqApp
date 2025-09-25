import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../auth/LoginScreen';
import EditPetProfile from '../components/EditPetProfile';
import PetParentEdit from '../components/PetParentEdit';
import SettingsScreen from '../components/SettingsScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={BottomTabs} />
   <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false, title: 'Login Screen' }} />
   <Stack.Screen name="PetParentEdit" component={PetParentEdit} options={{ headerShown: false, title: 'Pet Parent Edit' }} />
   <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false, title: 'Setting Screen' }} />
    <Stack.Screen name="EditPetProfile" component={EditPetProfile} options={{ headerShown: false, title: 'Edit Pet Profile' }} />
    
     </Stack.Navigator>
);

export default MainStack;