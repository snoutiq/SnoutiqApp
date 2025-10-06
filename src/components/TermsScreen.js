import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const TermsOfService = ({navigation}) => {
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons onPress={() => navigation.pop()} name='chevron-back' size={20} style={{color:"black"}}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#7C3AED', '#EC4899']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.heroTitle}>Terms of Service</Text>
          <Text style={styles.heroSubtitle}>Last updated: October 3, 2025</Text>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.introText}>
            Please read these Terms of Service carefully before using NaukrionXpert Private Limited services.
          </Text>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Use License</Text>
            <Text style={styles.paragraph}>
              Permission is granted to temporarily download one copy of the materials on NaukrionXpert's application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </Text>
            <Text style={styles.subTitle}>Under this license you may not:</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Modify or copy the materials</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Use the materials for any commercial purpose</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Attempt to decompile or reverse engineer any software</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Remove any copyright or proprietary notations</Text>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Account</Text>
            <Text style={styles.paragraph}>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
            </Text>
            <Text style={styles.paragraph}>
              You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The service and its original content, features, and functionality are and will remain the exclusive property of NaukrionXpert Private Limited and its licensors.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Termination</Text>
            <Text style={styles.paragraph}>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </Text>
            <Text style={styles.paragraph}>
              Upon termination, your right to use the service will immediately cease. If you wish to terminate your account, you may simply discontinue using the service.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              In no event shall NaukrionXpert Private Limited, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions about these Terms, please contact us at:
            </Text>
            <View style={styles.contactBox}>
              <Text style={styles.contactText}>📧 contact.naukrion@gmail.com</Text>
              <Text style={styles.contactText}>📞 +91 96341 65605</Text>
              <Text style={styles.contactText}>
                📍 Plot 5, Royal Apartment, Nobel Enclave, Sector 22, Gurugram Haryana, India - 122015
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using NaukrionXpert, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfService;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: scale(40),
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: '#111827',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: scale(40),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(30),
  },
  heroSection: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(30),
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  heroSubtitle: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    opacity: 0.95,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(25),
  },
  introText: {
    fontSize: moderateScale(15),
    color: '#374151',
    lineHeight: verticalScale(24),
    marginBottom: verticalScale(20),
    fontStyle: 'italic',
  },
  section: {
    marginBottom: verticalScale(25),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: verticalScale(12),
  },
  subTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#374151',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(8),
  },
  paragraph: {
    fontSize: moderateScale(14),
    color: '#4B5563',
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(12),
    textAlign: 'justify',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginLeft: scale(10),
    marginBottom: verticalScale(8),
  },
  bullet: {
    fontSize: moderateScale(14),
    color: '#7C3AED',
    marginRight: scale(10),
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#4B5563',
    lineHeight: verticalScale(22),
  },
  contactBox: {
    backgroundColor: '#F3F4F6',
    padding: scale(16),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(12),
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  contactText: {
    fontSize: moderateScale(13),
    color: '#374151',
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(6),
  },
  footer: {
    backgroundColor: '#FEF3C7',
    padding: scale(16),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(20),
  },
  footerText: {
    fontSize: moderateScale(13),
    color: '#92400E',
    lineHeight: verticalScale(20),
    textAlign: 'center',
  },
});