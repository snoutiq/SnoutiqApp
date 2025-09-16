import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MessageBubble = memo(({ msg, index, onFeedback }) => {
  if (msg.type === "loading") {
    return (
      <View key={`loader-${index}`} style={styles.loaderContainer}>
        <View style={styles.loaderBubble}>
          <Text style={styles.loaderText}>Thinking</Text>
          <ActivityIndicator size="small" color="#888" style={{ marginLeft: 8 }} />
        </View>
      </View>
    );
  }

  const isUser = msg.sender === "user";
  const isError = msg.isError;

  return (
    <View
      key={msg.id || `msg-${index}`}
      style={[styles.messageRow, isUser ? styles.rowRight : styles.rowLeft]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? styles.userBubble
            : isError
            ? styles.errorBubble
            : styles.aiBubble,
        ]}
      >
        {/* Header for AI */}
        {msg.sender === "ai" && !isError && (
          <View style={styles.headerRow}>
            <Text style={styles.aiIcon}>🐾</Text>
            <Text style={styles.aiHeader}>Pet Health Assistant</Text>
          </View>
        )}

        {/* Header for Error */}
        {isError && (
          <View style={styles.headerRow}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorHeader}>Connection Error</Text>
          </View>
        )}

        {/* Message text */}
        <Text style={[styles.messageText, isUser && { color: "white" }]}>
          {msg.displayedText !== undefined ? msg.displayedText : msg.text}
        </Text>

        {/* Timestamp */}
        {msg.timestamp && (
          <Text
            style={[
              styles.timestamp,
              isUser
                ? styles.timestampUser
                : isError
                ? styles.timestampError
                : styles.timestampAI,
            ]}
          >
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        )}

        {/* Feedback buttons */}
        {msg.sender === "ai" && !isError && (
          <View style={styles.feedbackRow}>
            <TouchableOpacity onPress={() => onFeedback(1, msg.timestamp)}>
              <Text style={styles.feedbackGood}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onFeedback(-1, msg.timestamp)}>
              <Text style={styles.feedbackBad}>👎</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  const prevMsg = prevProps.msg;
  const nextMsg = nextProps.msg;

  return (
    prevMsg.id === nextMsg.id &&
    prevMsg.displayedText === nextMsg.displayedText &&
    prevMsg.text === nextMsg.text &&
    prevMsg.type === nextMsg.type
  );
});

export default MessageBubble;

const styles = StyleSheet.create({
  loaderContainer: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 8 },
  loaderBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loaderText: { fontSize: 14, color: "#666" },

  messageRow: { flexDirection: "row", marginVertical: 4 },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },

  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 10,
  },
  userBubble: { backgroundColor: "#2563eb", alignSelf: "flex-end" },
  aiBubble: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
  errorBubble: { backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fca5a5" },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  aiIcon: { fontSize: 14, marginRight: 6 },
  aiHeader: { fontSize: 13, fontWeight: "600", color: "#444" },
  errorIcon: { fontSize: 14, marginRight: 6 },
  errorHeader: { fontSize: 13, fontWeight: "600", color: "#dc2626" },

  messageText: { fontSize: 15, color: "#111" },

  timestamp: { marginTop: 4, fontSize: 11 },
  timestampUser: { color: "#bfdbfe" },
  timestampAI: { color: "#6b7280" },
  timestampError: { color: "#dc2626" },

  feedbackRow: { flexDirection: "row", marginTop: 6 },
  feedbackGood: { fontSize: 18, color: "green", marginRight: 10 },
  feedbackBad: { fontSize: 18, color: "red" },
});
