import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const AboutAppScreen = ({ navigation }) => {
  const openWebsite = () => {
    Linking.openURL('https://naukrion.com/');
  };

  const openContact = () => {
    Linking.openURL('mailto:contact.naukrion@gmail.com');
  };

  const openSocial = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} contentContainerStyle={styles.contentContainer}>
    <ScrollView >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color="#333" 
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>About The App</Text>
      </View>

      {/* App Logo and Basic Info */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo}
        />
        <Text style={styles.appName}>Naukrion Job Connect</Text>
      </View>

      {/* App Description */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What is Naukrion?</Text>
        <Text style={styles.cardText}>
          Naukrion is a revolutionary job search and application platform designed to connect job seekers with their dream opportunities and help employers find top talent.
        </Text>
        <Text style={styles.cardText}>
          Our mission is to simplify the job search process while providing powerful tools for both candidates and recruiters.
        </Text>
      </View>

      {/* Key Features */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Key Features</Text>
        
        <View style={styles.featureItem}>
          <MaterialIcons name="work" size={20} color="#1783BB" style={styles.featureIcon} />
          <Text style={styles.featureText}>Smart job matching algorithm</Text>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialIcons name="send" size={20} color="#1783BB" style={styles.featureIcon} />
          <Text style={styles.featureText}>One-click job applications</Text>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialIcons name="notifications" size={20} color="#1783BB" style={styles.featureIcon} />
          <Text style={styles.featureText}>Real-time application tracking</Text>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialIcons name="verified-user" size={20} color="#1783BB" style={styles.featureIcon} />
          <Text style={styles.featureText}>Verified employer profiles</Text>
        </View>
      </View>

      {/* Company Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About NaukrionXpert</Text>
        <Text style={styles.cardText}>
          Naukrion Job Connect is developed by NaukrionXpert Private Limited, a HR technology company headquartered in Gurugram, India.
        </Text>
        <Text style={styles.cardText}>
          Founded in 2025, we're committed to transforming the recruitment industry through innovative technology solutions.
        </Text>
        
        <TouchableOpacity style={styles.linkButton} onPress={openWebsite}>
          <Text style={styles.linkButtonText}>Visit Our Website</Text>
          <Ionicons name="open-outline" size={16} color="#1783BB" />
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Us</Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={openContact}>
          <MaterialIcons name="email" size={20} color="#1783BB" />
          <Text style={styles.contactText}>contact.naukrion@gmail.com</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('tel:+919634165605')}>
          <MaterialIcons name="phone" size={20} color="#1783BB" />
          <Text style={styles.contactText}>+91 96341 65605</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('https://goo.gl/maps/your-address')}>
          <MaterialIcons name="location-on" size={20} color="#1783BB" />
          <Text style={styles.contactText}>Plot 5, Royal Apartment, Nobel Enclave, Sector 22, Gurugram, Haryana</Text>
        </TouchableOpacity>
      </View>

      {/* Social Media */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connect With Us</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={() => openSocial('https://twitter.com/naukrion')}>
            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton} onPress={() => openSocial('https://linkedin.com/company/naukrion')}>
            <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton} onPress={() => openSocial('https://facebook.com/naukrion')}>
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton} onPress={() => openSocial('https://instagram.com/naukrion')}>
            <Ionicons name="logo-instagram" size={24} color="#E1306C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Copyright */}
      <Text style={styles.copyrightText}>
        © 2025 NaukrionXpert Private Limited. All rights reserved.
      </Text>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backIcon: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  logoContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    padding: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1783BB',
    marginBottom: 15,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  linkButtonText: {
    color: '#1783BB',
    fontWeight: '600',
    marginRight: 5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  copyrightText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default AboutAppScreen;