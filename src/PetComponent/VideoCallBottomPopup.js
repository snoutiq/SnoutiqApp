import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  RtcSurfaceView,
  VideoSourceType,
} from "react-native-agora";

const APP_ID = "e20a4d60afd8494eab490563ad2e61d1";
const TOKEN = null;

const { width, height } = Dimensions.get("window");

const VideoCallScreen = ({ route, navigation }) => {
  const { doctor, channelName, uid: paramUid, role: paramRole, patientId } = route.params;

  // Generate UID safely
  const uid = paramUid ? Number(paramUid) : Math.floor(Math.random() * 100000);
  
  // ✅ FIXED: Both users should be broadcasters in Communication mode
  const role = ClientRoleType.ClientRoleBroadcaster;
  const isHost = paramRole === "host";

  const [engine, setEngine] = useState(null);
  const [remoteUid, setRemoteUid] = useState(null);
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true); // ✅ NEW: Track camera position
  const [remoteVideoState, setRemoteVideoState] = useState("stopped");
  
  const engineRef = useRef(null);
  const remoteUidRef = useRef(null);

  useEffect(() => {
    console.log("Initializing VideoCallScreen:", { 
      channelName, 
      uid, 
      role,
      roleType: paramRole 
    });
    initAgora();
    
    return () => {
      cleanup();
    };
  }, []);

  // Update ref when remoteUid changes
  useEffect(() => {
    remoteUidRef.current = remoteUid;
  }, [remoteUid]);

  // Cleanup function
  const cleanup = () => {
    console.log("Cleaning up Agora engine");
    if (engineRef.current) {
      try {
        engineRef.current.leaveChannel();
        engineRef.current.release();
        engineRef.current = null;
        setEngine(null);
      } catch (error) {
        console.log("Cleanup error:", error);
      }
    }
  };

  // Request permissions for Android
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        
        console.log("Permission results:", granted);
        
        if (
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert(
            "Permissions required",
            "Camera and microphone permissions are required for video calls"
          );
          return false;
        }
        return true;
      } catch (error) {
        console.log("Permission error:", error);
        return false;
      }
    }
    return true;
  };

  // Initialize Agora
  const initAgora = async () => {
    try {
      console.log("Starting Agora initialization...");
      
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert("Error", "Permissions denied");
        navigation.goBack();
        return;
      }

      // Create and initialize engine
      const agoraEngine = createAgoraRtcEngine();
      
      // Set engine event handlers FIRST
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log("✅ onJoinChannelSuccess:", connection, "elapsed:", elapsed);
          setJoined(true);
        },
        onUserJoined: (connection, remoteUid, elapsed) => {
          console.log("✅ onUserJoined:", remoteUid, "elapsed:", elapsed);
          setRemoteUid(remoteUid);
          setRemoteVideoState("starting");
        },
        onUserOffline: (connection, remoteUid, reason) => {
          console.log("❌ onUserOffline:", remoteUid, "reason:", reason);
          setRemoteUid(null);
          setRemoteVideoState("stopped");
          if (remoteUidRef.current === remoteUid) {
            Alert.alert("Call Ended", "The other user has left the call");
          }
        },
        onError: (error, msg) => {
          console.log("⚠️ Agora error:", error, msg);
          Alert.alert("Connection Error", `Error ${error}: ${msg}`);
        },
        onLeaveChannel: (connection, stats) => {
          console.log("ℹ️ Left channel", stats);
          setJoined(false);
          setRemoteUid(null);
          setRemoteVideoState("stopped");
        },
        onLocalVideoStateChanged: (source, state, error) => {
          console.log("📹 Local video state changed:", state, error);
        },
        onRemoteVideoStateChanged: (remoteUid, state, reason, elapsed) => {
          console.log("📹 Remote video state changed:", remoteUid, "state:", state, "reason:", reason);
          
          if (state === 0) {
            setRemoteVideoState("stopped");
          } else if (state === 1) {
            setRemoteVideoState("starting");
          } else if (state === 2) {
            setRemoteVideoState("running");
          } else if (state === 3) {
            setRemoteVideoState("failed");
          }
        },
        onRemoteAudioStateChanged: (remoteUid, state, reason, elapsed) => {
          console.log("🔊 Remote audio state changed:", remoteUid, state, reason);
        },
      });

      // Initialize engine
      const response = agoraEngine.initialize({
        appId: APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });
      
      console.log("Engine initialize response:", response);

      // Enable video module
      agoraEngine.enableVideo();
      
      // Set video encoder configuration
      agoraEngine.setVideoEncoderConfiguration({
        dimensions: { width: 640, height: 360 },
        frameRate: 15,
        bitrate: 0,
      });

      // ✅ FIXED: Always start preview and enable tracks for both users
      console.log("Starting local video preview...");
      agoraEngine.startPreview();
      agoraEngine.enableLocalAudio(true);
      agoraEngine.enableLocalVideo(true);

      // ✅ FIXED: Join channel with broadcaster role for both
      const joinOptions = {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      };

      console.log("Joining channel with options:", joinOptions);
      
      const joinResult = agoraEngine.joinChannel(
        TOKEN, 
        channelName, 
        uid, 
        joinOptions
      );
      
      console.log("Join channel result:", joinResult);

      // Store engine references
      engineRef.current = agoraEngine;
      setEngine(agoraEngine);

    } catch (error) {
      console.log("❌ Agora initialization error:", error);
      Alert.alert("Initialization Error", "Failed to initialize video call");
      navigation.goBack();
    }
  };

  // Controls
  const toggleMute = () => {
    if (engineRef.current) {
      try {
        engineRef.current.muteLocalAudioStream(!isMuted);
        setIsMuted(!isMuted);
        console.log("Local audio muted:", !isMuted);
      } catch (error) {
        console.log("Toggle mute error:", error);
      }
    }
  };

  const toggleSpeaker = () => {
    if (engineRef.current) {
      try {
        engineRef.current.setEnableSpeakerphone(!isSpeakerOn);
        setIsSpeakerOn(!isSpeakerOn);
        console.log("Speaker on:", !isSpeakerOn);
      } catch (error) {
        console.log("Toggle speaker error:", error);
      }
    }
  };

  // ✅ NEW: Toggle camera on/off
  const toggleCamera = () => {
    if (engineRef.current) {
      try {
        engineRef.current.muteLocalVideoStream(!isCameraOff);
        setIsCameraOff(!isCameraOff);
        console.log("Camera off:", !isCameraOff);
      } catch (error) {
        console.log("Toggle camera error:", error);
      }
    }
  };

  // ✅ NEW: Switch between front and back camera
  const switchCamera = () => {
    if (engineRef.current && !isCameraOff) {
      try {
        engineRef.current.switchCamera();
        setIsFrontCamera(!isFrontCamera);
        console.log("Switched to:", !isFrontCamera ? "front" : "back", "camera");
      } catch (error) {
        console.log("Switch camera error:", error);
        Alert.alert("Error", "Failed to switch camera");
      }
    } else if (isCameraOff) {
      Alert.alert("Camera Off", "Please turn on your camera first");
    }
  };

  const endCall = () => {
    console.log("Ending call...");
    cleanup();

    // Navigate to RatingScreen after call ends
    navigation.navigate("RatingScreen", {
      doctorId: doctor.id,
      userId: patientId,
    });
  };

  // Render remote video with state handling
  const renderRemoteVideo = () => {
    if (!remoteUid) {
      return (
        <View style={styles.waitingContainer}>
          <Text style={styles.infoText}>
            {joined ? "Waiting for the other user..." : "Connecting..."}
          </Text>
          {doctor && <Text style={styles.doctorText}>Calling: {doctor.name}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.remoteVideoContainer}>
        <RtcSurfaceView
          style={styles.remoteVideo}
          canvas={{ uid: remoteUid }}
          key={`remote-${remoteUid}`}
        />
        
        {/* Video state overlay */}
        {remoteVideoState !== "running" && remoteVideoState !== "stopped" && (
          <View style={styles.videoStateOverlay}>
            <Text style={styles.videoStateText}>
              {remoteVideoState === "starting" && "Video starting..."}
              {remoteVideoState === "failed" && "Video failed"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Remote Video */}
      <View style={styles.videoContainer}>
        {renderRemoteVideo()}

        {/* Local Video - Show for all users */}
        {joined && (
          <View style={styles.localVideoContainer}>
            {!isCameraOff ? (
              <RtcSurfaceView
                style={styles.localVideo}
                canvas={{ uid: 0 }}
                key={`local-${uid}`}
              />
            ) : (
              <View style={[styles.localVideo, styles.cameraOffView]}>
                <Text style={styles.cameraOffIcon}>📷</Text>
                <Text style={styles.cameraOffText}>Camera Off</Text>
              </View>
            )}
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                You ({isHost ? "Doctor" : "Patient"})
              </Text>
            </View>
            
            {/* ✅ NEW: Camera flip button */}
            {!isCameraOff && (
              <TouchableOpacity 
                style={styles.flipCameraButton}
                onPress={switchCamera}
              >
                <Text style={styles.flipCameraIcon}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Text style={styles.controlButtonText}>
            {isMuted ? "🔇" : "🎤"}
          </Text>
          <Text style={styles.controlLabel}>{isMuted ? "Unmute" : "Mute"}</Text>
        </TouchableOpacity>

        {/* ✅ NEW: Camera toggle button */}
        <TouchableOpacity
          style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
          onPress={toggleCamera}
        >
          <Text style={styles.controlButtonText}>
            {isCameraOff ? "📷" : "📹"}
          </Text>
          <Text style={styles.controlLabel}>
            {isCameraOff ? "Camera On" : "Camera Off"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleSpeaker}>
          <Text style={styles.controlButtonText}>
            {isSpeakerOn ? "🔊" : "🔈"}
          </Text>
          <Text style={styles.controlLabel}>
            {isSpeakerOn ? "Speaker" : "Earpiece"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.endButton]} 
          onPress={endCall}
        >
          <Text style={styles.controlButtonText}>📞</Text>
          <Text style={styles.controlLabel}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          Status: {joined ? (remoteUid ? `Connected to user ${remoteUid}` : "Waiting for participant...") : "Connecting..."}
        </Text>
        <Text style={styles.channelText}>
          Channel: {channelName} | Your UID: {uid} | Role: {isHost ? "Doctor" : "Patient"}
        </Text>
        <Text style={styles.videoStateText}>
          Video: {remoteVideoState} | Camera: {isFrontCamera ? "Front" : "Back"}
        </Text>
      </View>
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  videoContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#000"
  },
  waitingContainer: { 
    alignItems: "center", 
    justifyContent: "center",
    flex: 1
  },
  remoteVideoContainer: {
    width: width,
    height: height * 0.7,
    position: 'relative',
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "#222",
  },
  videoStateOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -25 }],
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 8,
  },
  videoStateText: {
    color: "#fff",
    fontSize: 14,
  },
  localVideoContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    width: width * 0.3,
    height: height * 0.2,
  },
  localVideo: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cameraOffView: {
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOffIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  cameraOffText: {
    color: "#fff",
    fontSize: 10,
  },
  roleBadge: {
    position: "absolute",
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  flipCameraButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  flipCameraIcon: {
    fontSize: 16,
  },
  infoText: { 
    color: "#fff", 
    fontSize: 18, 
    marginBottom: 10 
  },
  doctorText: { 
    color: "#ccc", 
    fontSize: 16 
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    gap: 15,
  },
  controlButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 30,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: { 
    backgroundColor: "#dc2626" 
  },
  controlButtonText: { 
    color: "#fff", 
    fontSize: 20,
    marginBottom: 4
  },
  controlLabel: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center"
  },
  endButton: { 
    backgroundColor: "red" 
  },
  statusBar: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
  },
  statusText: { 
    color: "#fff", 
    fontSize: 16,
    marginBottom: 2
  },
  channelText: { 
    color: "#ccc", 
    fontSize: 12,
    marginBottom: 2
  }
})
