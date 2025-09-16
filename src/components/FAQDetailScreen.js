import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {SafeAreaView } from 'react-native-safe-area-context';

const FAQDetailScreen = ({ navigation, route }) => {
  const { faq } = route.params;

  return (
    <SafeAreaView style={[styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Question Section */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{faq.question}</Text>
        </View>

        {/* Answer Section */}
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{faq.answer}</Text>
        </View>

        {/* Still Need Help? */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Still need help?</Text>
          <Text style={styles.helpText}>
            If you didn't find what you were looking for, our support team is ready to help you.
          </Text>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => navigation.navigate('ContactUs')}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  questionContainer: {
    backgroundColor: '#1783BB',
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  answerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  helpContainer: {
    marginTop: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1783BB',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: '80%',
  },
  contactButton: {
    backgroundColor: '#1783BB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default FAQDetailScreen;