import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
const HelpCenter = ({navigation}) => {
  
  const handleEmail = () => {
    Linking.openURL('mailto:yadavpushp69@gmail.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=919560228168');
  };

  const handleCall = () => {
    Linking.openURL('tel:+919560228168');
  };

  const FAQItem = ({ question, onPress }) => (
    <TouchableOpacity 
      style={styles.faqItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const ContactItem = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.contactIcon}>{icon}</Text>
      </View>
      <View style={styles.contactTextContainer}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons onPress={() => navigation.pop()} name='chevron-back' size={20} style={{color:"black"}}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
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
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to common questions or contact our support team directly.
          </Text>
        </LinearGradient>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqContainer}>
            <FAQItem 
              question="How do I update my profile information?"
              onPress={() => console.log('Navigate to profile update')}
            />
            <FAQItem 
              question="How can I change my password?"
              onPress={() => console.log('Navigate to change password')}
            />
            <FAQItem 
              question="Where can I view my job applications?"
              onPress={() => console.log('Navigate to job applications')}
            />
            <FAQItem 
              question="How do I contact support?"
              onPress={() => console.log('Navigate to contact support')}
            />
          </View>
        </View>

        {/* Contact Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.contactContainer}>
            <ContactItem 
              icon="📧"
              title="Email Support"
              subtitle="yadavpushp69@gmail.com"
              onPress={handleEmail}
            />
            <ContactItem 
              icon="💬"
              title="WhatsApp Chat"
              subtitle="+91 95602 28168"
              onPress={handleWhatsApp}
            />
            <ContactItem 
              icon="📞"
              title="Call Support"
              subtitle="+91 95602 28168"
              onPress={handleCall}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenter;

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
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(25),
    borderRadius: moderateScale(16),
  },
  heroTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
  },
  heroSubtitle: {
    fontSize: moderateScale(15),
    color: '#FFFFFF',
    opacity: 0.95,
    lineHeight: verticalScale(22),
  },
  section: {
    marginTop: verticalScale(30),
    paddingHorizontal: scale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#0891B2',
    marginBottom: verticalScale(15),
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(18),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#374151',
    fontWeight: '400',
  },
  arrow: {
    fontSize: moderateScale(24),
    color: '#D1D5DB',
    fontWeight: '300',
    marginLeft: scale(10),
  },
  contactContainer: {
    gap: verticalScale(15),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(15),
  },
  contactIcon: {
    fontSize: moderateScale(24),
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  contactSubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
});