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
} from "react-native-agora";

const APP_ID = "e20a4d60afd8494eab490563ad2e61d1";
const TOKEN = null;

const { width, height } = Dimensions.get("window");

const VideoCallScreen = ({ route, navigation }) => {
  const { doctor, channelName, uid: paramUid, role: paramRole } = route.params;

  // Generate UID safely
  const uid = paramUid ? Number(paramUid) : Math.floor(Math.random() * 100000);
  const role =
    paramRole === "host"
      ? ClientRoleType.ClientRoleAudience
      : ClientRoleType.ClientRoleBroadcaster;

  const [engine, setEngine] = useState(null);
  const [remoteUid, setRemoteUid] = useState(null);
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [remoteVideoState, setRemoteVideoState] = useState("stopped"); // stopped, starting, running, failed
  
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
        
        // For audience, only audio permission is strictly required
        if (granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permissions required",
            "Microphone permission is required for audio in video calls"
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
          
          // For audience, setup remote video subscription
          if (role === ClientRoleType.ClientRoleAudience) {
            console.log("Audience joined successfully");
          }
        },
        onUserJoined: (connection, remoteUid, elapsed) => {
          console.log("✅ onUserJoined:", remoteUid, "elapsed:", elapsed);
          setRemoteUid(remoteUid);
          setRemoteVideoState("starting");
          
          // For audience role, manually subscribe to remote video
          if (role === ClientRoleType.ClientRoleAudience && agoraEngine) {
            try {
              // Subscribe to remote video stream
              agoraEngine.muteRemoteVideoStream(remoteUid, false);
              agoraEngine.muteRemoteAudioStream(remoteUid, false);
              console.log("Subscribed to remote user:", remoteUid);
            } catch (error) {
              console.log("Error subscribing to remote stream:", error);
            }
          }
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
          
          // Update remote video state
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

      // Enable video module (required even for audience to receive video)
      agoraEngine.enableVideo();
      
      // Set video encoder configuration
      agoraEngine.setVideoEncoderConfiguration({
        dimensions: { width: 640, height: 360 },
        frameRate: 15,
        bitrate: 0,
      });

      // For broadcaster only, start local video and preview
      if (role === ClientRoleType.ClientRoleBroadcaster) {
        console.log("Starting local video preview for broadcaster...");
        agoraEngine.startPreview();
        
        // Enable local audio/video for broadcaster
        agoraEngine.enableLocalAudio(true);
        agoraEngine.enableLocalVideo(true);
      } else {
        console.log("Audience role - no local video preview");
        // Disable local video for audience to save resources
        agoraEngine.enableLocalVideo(false);
      }

      // Join channel with options
      const joinOptions = {
        clientRoleType: role,
        publishMicrophoneTrack: role === ClientRoleType.ClientRoleBroadcaster,
        publishCameraTrack: role === ClientRoleType.ClientRoleBroadcaster,
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

  // Controls - simplified for audience
  const toggleMute = () => {
    if (engineRef.current) {
      try {
        // For audience, this mutes incoming audio
        engineRef.current.muteAllRemoteAudioStreams(!isMuted);
        setIsMuted(!isMuted);
        console.log("All remote audio muted:", !isMuted);
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

  const endCall = () => {
    console.log("Ending call...");
    cleanup();
    navigation.goBack();
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
        {remoteVideoState !== "running" && (
          <View style={styles.videoStateOverlay}>
            <Text style={styles.videoStateText}>
              {remoteVideoState === "starting" && "Video starting..."}
              {remoteVideoState === "stopped" && "Video stopped"}
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

        {/* Local Video - Only show for broadcaster */}
        {role === ClientRoleType.ClientRoleBroadcaster && joined && (
          <View style={styles.localVideoContainer}>
            <RtcSurfaceView
              style={styles.localVideo}
              canvas={{ uid: 0 }} // 0 for local user
              key={`local-${uid}`}
            />
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>You (Host)</Text>
            </View>
          </View>
        )}

        {/* Role indicator for audience */}
        {role === ClientRoleType.ClientRoleAudience && joined && (
          <View style={styles.audienceBadge}>
            <Text style={styles.audienceBadgeText}>You (Viewer)</Text>
          </View>
        )}
      </View>

      {/* Controls - Different controls for audience vs broadcaster */}
      <View style={styles.controls}>
        {role === ClientRoleType.ClientRoleBroadcaster ? (
          // Broadcaster controls
          <>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={toggleMute}
            >
              <Text style={styles.controlButtonText}>
                {isMuted ? "🔇" : "🎤"}
              </Text>
              <Text style={styles.controlLabel}>{isMuted ? "Unmute" : "Mute"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleSpeaker}>
              <Text style={styles.controlButtonText}>
                {isSpeakerOn ? "🔊" : "🔈"}
              </Text>
              <Text style={styles.controlLabel}>{isSpeakerOn ? "Speaker" : "Earpiece"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={endCall}>
              <Text style={styles.controlButtonText}>📞</Text>
              <Text style={styles.controlLabel}>End</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Audience controls
          <>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={toggleMute}
            >
              <Text style={styles.controlButtonText}>
                {isMuted ? "🔇" : "🔊"}
              </Text>
              <Text style={styles.controlLabel}>{isMuted ? "Unmute" : "Mute"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleSpeaker}>
              <Text style={styles.controlButtonText}>
                {isSpeakerOn ? "📢" : "📱"}
              </Text>
              <Text style={styles.controlLabel}>{isSpeakerOn ? "Speaker" : "Phone"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={endCall}>
              <Text style={styles.controlButtonText}>📞</Text>
              <Text style={styles.controlLabel}>Leave</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Status */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          Status: {joined ? (remoteUid ? `Connected to user ${remoteUid}` : "Waiting for participant...") : "Connecting..."}
        </Text>
        <Text style={styles.channelText}>Channel: {channelName} | Your UID: {uid} | Role: {paramRole === "audience" ? "Viewer" : "Host"}</Text>
        <Text style={styles.videoStateText}>Video: {remoteVideoState}</Text>
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
    // ...StyleSheet.absoluteFillObject,
    // backgroundColor: "rgba(0,0,0,0.7)",
    // justifyContent: "center",
    // alignItems: "center",
  },
  videoStateText: {
    // color: "#fff",
    // fontSize: 16,
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
    borderWidth: 1,
    borderColor: "#fff",
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
  audienceBadge: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
    borderRadius: 8,
  },
  audienceBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
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
    backgroundColor: "#555" 
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
  },
});

// import React, { useEffect, useRef, useState, useMemo } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Dimensions,
//   StatusBar,
//   Platform,
//   PermissionsAndroid,
// } from "react-native";
// import { WebView } from "react-native-webview";
// import { Ionicons } from "@expo/vector-icons";
// import { socket } from "../context/Socket";

// const { width, height } = Dimensions.get("window");

// const VideoCallScreen = ({ route, navigation }) => {
//   const { doctor, channelName, patientId, callId, role, uid } = route.params;
  
//   // Safe channel name
//   const safeChannel = useMemo(() => {
//     return (channelName || "default_channel")
//       .replace(/[^a-zA-Z0-9_]/g, "")
//       .slice(0, 63);
//   }, [channelName]);

//   const isHost = role === "host";
//   const userId = uid || Math.floor(Math.random() * 1e6);

//   // Refs
//   const webViewRef = useRef(null);

//   // State
//   const [callStatus, setCallStatus] = useState("requesting_permission");
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCameraOff, setIsCameraOff] = useState(false);
//   const [hasPermissions, setHasPermissions] = useState(false);

//   // Camera and Audio Permissions
//   const requestPermissions = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const permissions = await PermissionsAndroid.requestMultiple([
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         ]);

//         const cameraGranted = permissions[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted';
//         const audioGranted = permissions[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted';
        
//         if (cameraGranted && audioGranted) {
//           setHasPermissions(true);
//           setCallStatus("connecting");
//           // Initialize Agora after permissions are granted
//           setTimeout(() => {
//             webViewRef.current?.injectJavaScript(`
//               initAgora();
//               true;
//             `);
//           }, 1000);
//         } else {
//           Alert.alert(
//             "Permissions Required",
//             "Camera and microphone permissions are required for video calls.",
//             [
//               {
//                 text: "Cancel",
//                 onPress: () => navigation.goBack(),
//                 style: "cancel"
//               },
//               {
//                 text: "Try Again",
//                 onPress: requestPermissions
//               }
//             ]
//           );
//         }
//       } catch (err) {
//         console.warn(err);
//         setCallStatus("error");
//       }
//     } else {
//       // For iOS, permissions are handled differently
//       setHasPermissions(true);
//       setCallStatus("connecting");
//     }
//   };

//   useEffect(() => {
//     requestPermissions();
//   }, []);

//   // Simplified HTML content with better error handling
//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Video Call</title>
//         <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.2.js"></script>
//         <style>
//             * {
//                 margin: 0;
//                 padding: 0;
//                 box-sizing: border-box;
//             }
//             body {
//                 background: #000;
//                 font-family: -apple-system, BlinkMacSystemFont, sans-serif;
//                 overflow: hidden;
//                 width: 100vw;
//                 height: 100vh;
//             }
//             #container {
//                 width: 100%;
//                 height: 100%;
//                 position: relative;
//                 background: #000;
//             }
//             #remoteVideo {
//                 width: 100%;
//                 height: 100%;
//                 background: #000;
//                 position: relative;
//             }
//             #localVideo {
//                 position: absolute;
//                 top: 20px;
//                 right: 20px;
//                 width: 120px;
//                 height: 160px;
//                 background: #000;
//                 border-radius: 12px;
//                 border: 2px solid #4f46e5;
//                 z-index: 100;
//             }
//             .placeholder {
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 flex-direction: column;
//                 color: white;
//                 width: 100%;
//                 height: 100%;
//                 text-align: center;
//             }
//             .controls {
//                 position: absolute;
//                 bottom: 30px;
//                 left: 50%;
//                 transform: translateX(-50%);
//                 display: flex;
//                 gap: 15px;
//                 z-index: 1000;
//             }
//             .control-btn {
//                 width: 60px;
//                 height: 60px;
//                 border-radius: 50%;
//                 border: none;
//                 background: rgba(255, 255, 255, 0.2);
//                 color: white;
//                 font-size: 24px;
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 backdrop-filter: blur(10px);
//             }
//             .control-btn:active {
//                 transform: scale(0.95);
//             }
//             .control-btn.end-call {
//                 background: #dc2626;
//             }
//             .control-btn.active {
//                 background: #dc2626;
//             }
//             .status {
//                 position: absolute;
//                 top: 20px;
//                 left: 20px;
//                 background: rgba(0, 0, 0, 0.7);
//                 color: white;
//                 padding: 10px 15px;
//                 border-radius: 20px;
//                 font-size: 12px;
//                 z-index: 1000;
//             }
//             .hidden {
//                 display: none !important;
//             }
//             .video-element {
//                 width: 100%;
//                 height: 100%;
//                 object-fit: cover;
//             }
//         </style>
//     </head>
//     <body>
//         <div id="container">
//             <!-- Remote Video -->
//             <div id="remoteVideo">
//                 <div id="waitingMessage" class="placeholder">
//                     <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
//                     <div>Waiting for ${isHost ? "patient" : "doctor"} to join...</div>
//                 </div>
//             </div>

//             <!-- Local Video -->
//             <div id="localVideo">
//                 <div id="localPlaceholder" class="placeholder">
//                     <div style="font-size: 24px;">📷</div>
//                     <div style="font-size: 10px; margin-top: 5px;">Loading...</div>
//                 </div>
//             </div>

//             <!-- Status -->
//             <div class="status" id="statusIndicator">REQUESTING PERMISSIONS</div>

//             <!-- Controls -->
//             <div class="controls hidden" id="controls">
//                 <button class="control-btn" id="muteBtn" onclick="toggleMute()">🎤</button>
//                 <button class="control-btn" id="cameraBtn" onclick="toggleCamera()">📹</button>
//                 <button class="control-btn end-call" onclick="endCall()">📞</button>
//             </div>

//             <!-- Permission Message -->
//             <div id="permissionMessage" class="placeholder">
//                 <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
//                 <div>Camera and microphone access required</div>
//                 <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">Please allow permissions when prompted</div>
//             </div>
//         </div>

//         <script>
//             const APP_ID = "e20a4d60afd8494eab490563ad2e61d1";
//             const CHANNEL = "${safeChannel}";
//             const UID = ${userId};
            
//             let client;
//             let localAudioTrack;
//             let localVideoTrack;
//             let isMuted = false;
//             let isCameraOff = false;
//             let remoteUsers = {};

//             function updateStatus(message) {
//                 document.getElementById('statusIndicator').textContent = message;
//                 console.log('Status:', message);
//             }

//             async function initAgora() {
//                 try {
//                     updateStatus('INITIALIZING...');
                    
//                     // Hide permission message
//                     document.getElementById('permissionMessage').classList.add('hidden');
                    
//                     // Create client
//                     client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
                    
//                     // Setup event handlers
//                     setupEventHandlers();
                    
//                     // Join channel
//                     updateStatus('JOINING CHANNEL...');
//                     await client.join(APP_ID, CHANNEL, null, UID);
//                     console.log("Joined channel successfully as UID:", UID);
                    
//                     // Create and publish local tracks
//                     await setupLocalTracks();
                    
//                     updateStatus('CONNECTED');
//                     document.getElementById('controls').classList.remove('hidden');
                    
//                     // Notify React Native
//                     window.ReactNativeWebView?.postMessage(JSON.stringify({
//                         type: "call-connected",
//                         data: { channel: CHANNEL, uid: UID }
//                     }));
                    
//                 } catch (error) {
//                     console.error("Agora initialization failed:", error);
//                     updateStatus('ERROR');
//                     window.ReactNativeWebView?.postMessage(JSON.stringify({
//                         type: "call-error",
//                         data: { error: error.message }
//                     }));
//                 }
//             }

//             function setupEventHandlers() {
//                 client.on("user-published", async (user, mediaType) => {
//                     console.log("User published:", user.uid, mediaType);
//                     try {
//                         await client.subscribe(user, mediaType);
                        
//                         if (mediaType === "video") {
//                             // Hide waiting message
//                             document.getElementById('waitingMessage').classList.add('hidden');
                            
//                             // Create video element for remote user
//                             const remoteVideoContainer = document.getElementById('remoteVideo');
//                             const videoElement = document.createElement('video');
//                             videoElement.id = 'remote-video-' + user.uid;
//                             videoElement.className = 'video-element';
//                             videoElement.autoplay = true;
//                             videoElement.playsinline = true;
                            
//                             remoteVideoContainer.appendChild(videoElement);
//                             user.videoTrack.play(videoElement.id);
                            
//                             console.log("Remote video started playing");
//                         }
                        
//                         if (mediaType === "audio") {
//                             user.audioTrack.play();
//                         }
//                     } catch (error) {
//                         console.error("Subscribe error:", error);
//                     }
//                 });

//                 client.on("user-unpublished", (user, mediaType) => {
//                     console.log("User unpublished:", user.uid, mediaType);
//                     if (mediaType === "video") {
//                         const videoElement = document.getElementById('remote-video-' + user.uid);
//                         if (videoElement) {
//                             videoElement.remove();
//                         }
//                     }
//                 });

//                 client.on("user-left", (user) => {
//                     console.log("User left:", user.uid);
//                     const videoElement = document.getElementById('remote-video-' + user.uid);
//                     if (videoElement) {
//                         videoElement.remove();
//                     }
                    
//                     // Show waiting message if no remote users
//                     if (Object.keys(remoteUsers).length === 0) {
//                         document.getElementById('waitingMessage').classList.remove('hidden');
//                     }
//                 });
//             }

//             async function setupLocalTracks() {
//                 try {
//                     updateStatus('STARTING CAMERA...');
                    
//                     // Create local tracks with better error handling
//                     localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack().catch(err => {
//                         console.warn("Microphone access failed:", err);
//                         return null;
//                     });
                    
//                     localVideoTrack = await AgoraRTC.createCameraVideoTrack({
//                         encoderConfig: "480p_8",
//                         optimizationMode: "detail"
//                     }).catch(err => {
//                         console.warn("Camera access failed:", err);
//                         return null;
//                     });
                    
//                     // Play local video if available
//                     if (localVideoTrack) {
//                         const localVideoElement = document.getElementById('localVideo');
//                         localVideoTrack.play(localVideoElement);
//                         document.getElementById('localPlaceholder').classList.add('hidden');
//                         console.log("Local camera started");
//                     }
                    
//                     // Publish tracks
//                     const tracksToPublish = [];
//                     if (localAudioTrack) tracksToPublish.push(localAudioTrack);
//                     if (localVideoTrack) tracksToPublish.push(localVideoTrack);
                    
//                     if (tracksToPublish.length > 0) {
//                         await client.publish(tracksToPublish);
//                         console.log("Local tracks published");
//                     }
                    
//                 } catch (error) {
//                     console.error("Local tracks setup failed:", error);
//                     throw error;
//                 }
//             }

//             async function toggleMute() {
//                 if (localAudioTrack) {
//                     isMuted = !isMuted;
//                     await localAudioTrack.setEnabled(!isMuted);
                    
//                     const muteBtn = document.getElementById('muteBtn');
//                     muteBtn.textContent = isMuted ? "🔇" : "🎤";
//                     muteBtn.className = isMuted ? "control-btn active" : "control-btn";
                    
//                     window.ReactNativeWebView?.postMessage(JSON.stringify({
//                         type: "audio-toggled",
//                         data: { muted: isMuted }
//                     }));
//                 }
//             }

//             async function toggleCamera() {
//                 if (localVideoTrack) {
//                     isCameraOff = !isCameraOff;
//                     await localVideoTrack.setEnabled(!isCameraOff);
                    
//                     const cameraBtn = document.getElementById('cameraBtn');
//                     cameraBtn.textContent = isCameraOff ? "📷" : "📹";
//                     cameraBtn.className = isCameraOff ? "control-btn active" : "control-btn";
                    
//                     const localPlaceholder = document.getElementById('localPlaceholder');
//                     if (isCameraOff) {
//                         localPlaceholder.classList.remove('hidden');
//                         localPlaceholder.innerHTML = '<div style="font-size: 24px;">📷</div><div style="font-size: 10px; margin-top: 5px;">Camera Off</div>';
//                     } else {
//                         localPlaceholder.classList.add('hidden');
//                     }
                    
//                     window.ReactNativeWebView?.postMessage(JSON.stringify({
//                         type: "camera-toggled",
//                         data: { cameraOff: isCameraOff }
//                     }));
//                 }
//             }

//             function endCall() {
//                 window.ReactNativeWebView?.postMessage(JSON.stringify({
//                     type: "end-call",
//                     data: { channel: CHANNEL }
//                 }));
//             }

//             async function cleanup() {
//                 try {
//                     if (localAudioTrack) {
//                         localAudioTrack.close();
//                     }
//                     if (localVideoTrack) {
//                         localVideoTrack.close();
//                     }
//                     if (client) {
//                         await client.leave();
//                     }
//                 } catch (error) {
//                     console.error("Cleanup error:", error);
//                 }
//             }

//             // Handle page visibility changes
//             document.addEventListener('visibilitychange', function() {
//                 if (!document.hidden && localVideoTrack && isCameraOff === false) {
//                     // Try to restart camera if page becomes visible again
//                     setTimeout(() => {
//                         if (localVideoTrack) {
//                             localVideoTrack.setEnabled(true);
//                         }
//                     }, 1000);
//                 }
//             });

//             // Initialization will be triggered by React Native after permissions
//             updateStatus('READY');
            
//         </script>
//     </body>
//     </html>
//   `;
// // console.log("WebView message:", message);

//   // Handle WebView messages
//   const handleWebViewMessage = (event) => {
//     try {
//       const message = JSON.parse(event.nativeEvent.data);
//       console.log("WebView message:", message);
      
//       switch (message.type) {
//         case "call-connected":
//           setCallStatus("connected");
//           break;
//         case "call-error":
//           setCallStatus("error");
//           Alert.alert("Call Error", message.data.error);
//           break;
//         case "end-call":
//           handleEndCall();
//           break;
//         case "audio-toggled":
//           setIsMuted(message.data.muted);
//           break;
//         case "camera-toggled":
//           setIsCameraOff(message.data.cameraOff);
//           break;
//       }
//     } catch (error) {
//       console.error("WebView message error:", error);
//     }
//   };

//   // End call function
//   const handleEndCall = async () => {
//     Alert.alert(
//       "End Call",
//       "Are you sure you want to end the call?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "End Call",
//           style: "destructive",
//           onPress: () => {
//             // Cleanup WebView resources
//             webViewRef.current?.injectJavaScript(`
//               cleanup();
//               true;
//             `);
            
//             socket.emit("call-ended", { 
//               callId, 
//               channel: safeChannel,
//               doctorId: doctor.id,
//               patientId 
//             });
//             navigation.goBack();
//           },
//         },
//       ]
//     );
//   };

//   // Get status color
//   const getStatusColor = () => {
//     switch (callStatus) {
//       case "connected":
//         return "#16a34a";
//       case "connecting":
//       case "requesting_permission":
//         return "#f59e0b";
//       case "error":
//         return "#dc2626";
//       default:
//         return "#6b7280";
//     }
//   };

//   // Get status text
//   const getStatusText = () => {
//     switch (callStatus) {
//       case "requesting_permission":
//         return "REQUESTING PERMISSION";
//       case "connecting":
//         return "CONNECTING";
//       case "connected":
//         return "CONNECTED";
//       case "error":
//         return "ERROR";
//       default:
//         return callStatus.toUpperCase();
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#000" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerInfo}>
//           <Text style={styles.headerTitle}>Video Consultation</Text>
//           <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
//           <Text style={styles.roleText}>Role: {isHost ? "Doctor" : "Patient"}</Text>
//         </View>
//         <TouchableOpacity 
//           style={styles.closeButton}
//           onPress={handleEndCall}
//         >
//           <Ionicons name="close" size={24} color="#fff" />
//         </TouchableOpacity>
//         <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
//           <Text style={styles.statusText}>{getStatusText()}</Text>
//         </View>
//       </View>

//       {/* Control Status */}
//       <View style={styles.controlStatus}>
//         <Text style={styles.controlStatusText}>
//           Audio: {isMuted ? "Muted" : "On"} | Camera: {isCameraOff ? "Off" : "On"}
//         </Text>
//       </View>

//       {/* WebView for Video Call */}
//       <WebView
//         ref={webViewRef}
//         source={{ html: htmlContent }}
//         style={styles.webview}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         mediaPlaybackRequiresUserAction={false}
//         allowsInlineMediaPlayback={true}
//         allowsFullscreenVideo={false}
//          geolocationEnabled={true} 
//         mediaCapturePermissionGrantType="grant"
//          originWhitelist={["*"]}  
//         onMessage={handleWebViewMessage}
//         onError={(syntheticEvent) => {
//           const { nativeEvent } = syntheticEvent;
//           console.error('WebView error: ', nativeEvent);
//           setCallStatus("error");
//         }}
//         onLoadStart={() => console.log("WebView loading...")}
//         onLoadEnd={() => console.log("WebView loaded")}
//         onContentProcessDidTerminate={() => {
//           console.log("WebView process terminated, reloading...");
//           webViewRef.current?.reload();
//         }}
//       />

//       {/* Permission/Connection Status Overlay */}
//       {(callStatus === "requesting_permission" || callStatus === "connecting") && (
//         <View style={styles.overlay}>
//           <View style={styles.overlayContent}>
//             <Text style={styles.overlayIcon}>
//               {callStatus === "requesting_permission" ? "🔒" : "📞"}
//             </Text>
//             <Text style={styles.overlayTitle}>
//               {callStatus === "requesting_permission" 
//                 ? "Camera & Microphone Access" 
//                 : "Connecting to Call"}
//             </Text>
//             <Text style={styles.overlayText}>
//               {callStatus === "requesting_permission"
//                 ? "Please allow camera and microphone permissions to start the video call"
//                 : "Please wait while we connect you to the video call"}
//             </Text>
//             {callStatus === "requesting_permission" && (
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={requestPermissions}
//               >
//                 <Text style={styles.permissionButtonText}>Grant Permissions</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 15,
//     backgroundColor: "#000",
//   },
//   headerInfo: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   doctorName: {
//     fontSize: 14,
//     color: "#9ca3af",
//     marginTop: 2,
//   },
//   roleText: {
//     fontSize: 12,
//     color: "#6b7280",
//     marginTop: 2,
//   },
//   closeButton: {
//     padding: 8,
//     marginLeft: 10,
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     marginLeft: 10,
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   controlStatus: {
//     paddingHorizontal: 20,
//     paddingBottom: 10,
//   },
//   controlStatusText: {
//     fontSize: 12,
//     color: "#9ca3af",
//     textAlign: "center",
//   },
//   webview: {
//     flex: 1,
//     backgroundColor: "#000",
//   },
//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   overlayContent: {
//     backgroundColor: "#1f2937",
//     padding: 30,
//     borderRadius: 20,
//     alignItems: "center",
//     maxWidth: 300,
//   },
//   overlayIcon: {
//     fontSize: 64,
//     marginBottom: 20,
//   },
//   overlayTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   overlayText: {
//     fontSize: 14,
//     color: "#9ca3af",
//     textAlign: "center",
//     lineHeight: 20,
//   },
//   permissionButton: {
//     backgroundColor: "#4f46e5",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 10,
//     marginTop: 20,
//   },
//   permissionButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// export default VideoCallScreen;