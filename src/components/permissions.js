import { PermissionsAndroid, Platform, Alert, Linking } from "react-native";

export const requestCameraAudioPermission = async () => {
  if (Platform.OS === "android") {
    try {
     
      // Check if permissions are already granted
      const cameraPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      const audioPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      // If both are already granted, return true
      if (cameraPermission && audioPermission) {
        return true;
      }

      // Request permissions
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === "granted";
      const audioGranted = granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === "granted";

      if (cameraGranted && audioGranted) {
        return true;
      } else {
        // Show detailed alert based on what was denied
        const deniedPermissions = [];
        if (!cameraGranted) deniedPermissions.push("Camera");
        if (!audioGranted) deniedPermissions.push("Microphone");

        Alert.alert(
          "Permissions Required",
          `${deniedPermissions.join(" and ")} permissions are required for video calls. Please grant them in Settings.`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return false;
      }
    } catch (err) {
      Alert.alert(
        "Permission Error",
        "Failed to request permissions. Please try again.",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
      return false;
    }
  }
  
  // For iOS, assume permissions will be handled by the system
  return true;
};

export const checkCameraAudioPermissions = async () => {
  if (Platform.OS === "android") {
    try {
      const cameraPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      const audioPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      return {
        camera: cameraPermission,
        audio: audioPermission,
        both: cameraPermission && audioPermission,
      };
    } catch (error) {
      return {
        camera: false,
        audio: false,
        both: false,
      };
    }
  }
  
  // For iOS, assume permissions are available
  return {
    camera: true,
    audio: true,
    both: true,
  };
};

// Enhanced permission request with retry mechanism
export const requestPermissionsWithRetry = async (maxRetries = 3) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    attempts++;
    
    const result = await requestCameraAudioPermission();
    if (result) {
      return true;
    }
    
    if (attempts < maxRetries) {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
};