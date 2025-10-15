import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dimensions,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.3) => size + (scale(size) - size) * factor;

const DESIGN = {
  TYPOGRAPHY: {
    h1: moderateScale(24),
    h2: moderateScale(20),
    h3: moderateScale(18),
    body: moderateScale(15),
    bodySmall: moderateScale(14),
    caption: moderateScale(13),
    tiny: moderateScale(11),
  },
  SPACING: {
    xs: scale(8),
    sm: scale(12),
    md: scale(16),
    lg: scale(20),
    xl: scale(24),
    xxl: scale(32),
  },
  VERTICAL_SPACING: {
    xs: verticalScale(8),
    sm: verticalScale(12),
    md: verticalScale(16),
    lg: verticalScale(20),
    xl: verticalScale(24),
  },
  RADIUS: {
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    full: moderateScale(999),
  },
  COLORS: {
    primary: '#667eea',
    secondary: '#764ba2',
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray400: '#9CA3AF',
    gray600: '#6B7280',
    gray700: '#374151',
    gray900: '#1F2937',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F0F4FF',
  },
};

const PrivacyPolicyScreen = ({ navigation }) => {
  const InfoCard = ({ children, borderColor = DESIGN.COLORS.info }) => (
    <View style={[styles.infoCard, { borderLeftColor: borderColor }]}>
      {children}
    </View>
  );

  const Section = ({ title, children, icon }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon && <Ionicons name={icon} size={scale(20)} color={DESIGN.COLORS.primary} />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const ColoredCard = ({ title, items, color }) => (
    <View style={[styles.coloredCard, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
      <Text style={[styles.coloredCardTitle, { color: color }]}>{title}</Text>
      {items.map((item, index) => (
        <Text key={index} style={[styles.coloredCardItem, { color: color }]}>
          • {item}
        </Text>
      ))}
    </View>
  );

  const Definition = ({ term, definition }) => (
    <View style={styles.definitionCard}>
      <Text style={styles.definitionTerm}>"{term}"</Text>
      <Text style={styles.definitionText}>{definition}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[DESIGN.COLORS.primary, DESIGN.COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={scale(28)} color={DESIGN.COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>Last Updated: May 31, 2025</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Introduction */}
          <InfoCard borderColor={DESIGN.COLORS.info}>
            <Text style={styles.introText}>
              Thinktail Global Pvt. Ltd. ("Thinktail," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or interact with the Snoutiq website or mobile application.
            </Text>
          </InfoCard>

          {/* Section 1 - Definitions */}
          <Section title="1. Definitions" icon="book-outline">
            <Definition 
              term="Personal Data or Personal Information"
              definition="refers to any information relating to an identified or identifiable individual, including sensitive personal data or information (SPDI) under India's Information Technology Rules, 2011."
            />
            <Definition 
              term="User, you, or your"
              definition="means any individual or entity accessing or using Snoutiq."
            />
            <Definition 
              term="Services"
              definition="refers to all features and functionalities offered on Snoutiq, including product browsing, purchasing, veterinary consultations, medical content delivery, and related services."
            />
          </Section>

          {/* Section 2 - Information We Collect */}
          <Section title="2. Information We Collect" icon="information-circle-outline">
            <Text style={styles.sectionIntro}>
              We collect various types of Personal Data from Users through different means: when you browse Snoutiq, register an account, place orders, book services, upload content, or otherwise interact with the Platform.
            </Text>

            <Text style={styles.subsectionTitle}>2.1. Information You Provide Directly</Text>
            
            <ColoredCard 
              title="Account Registration & Profile Data"
              color={DESIGN.COLORS.success}
              items={[
                'Name',
                'Email address',
                'Phone number',
                'Password (hashed and stored securely)',
                'Profile picture (optional)',
                'Delivery address(es)'
              ]}
            />

            <ColoredCard 
              title="Seller/Veterinarian KYC & Professional Data"
              color={DESIGN.COLORS.info}
              items={[
                'Government-issued ID for identity verification',
                'Professional licenses and certifications',
                'Business registration documents',
                'Bank account or payment details (for payouts)'
              ]}
            />

            <ColoredCard 
              title="Transactional Data"
              color={DESIGN.COLORS.warning}
              items={[
                'Order history (products purchased, prices, quantities)',
                'Service bookings (consultation date/time, service details)',
                'Payment information (last four digits of card, UPI ID)'
              ]}
            />

            <ColoredCard 
              title="Medical & Pet Health Data"
              color={DESIGN.COLORS.error}
              items={[
                'Pet details (name, age, breed, medical history)',
                'Information shared during consultations',
                'User-provided pet photos or radiographs'
              ]}
            />

            <ColoredCard 
              title="User-Generated Content & Communications"
              color="#7C3AED"
              items={[
                'Reviews, ratings, feedback, and Q&A',
                'Chat transcripts or call logs',
                'Any content you upload, post, or transmit'
              ]}
            />

            <Text style={styles.subsectionTitle}>2.2. Information Collected Automatically</Text>

            <ColoredCard 
              title="Device & Usage Information"
              color="#6366F1"
              items={[
                'IP address',
                'Browser type and version',
                'Operating system and device model',
                'Unique device identifiers',
                'Log files (access time, pages viewed, errors)'
              ]}
            />

            <View style={styles.cookieCard}>
              <Text style={styles.cookieTitle}>Cookies & Tracking Technologies</Text>
              <Text style={styles.cookieText}>We use cookies, web beacons, local storage, and similar technologies to:</Text>
              <Text style={styles.cookieItem}>• Understand how you navigate and use Snoutiq</Text>
              <Text style={styles.cookieItem}>• Remember your preferences and settings</Text>
              <Text style={styles.cookieItem}>• Deliver targeted advertising</Text>
              <Text style={styles.cookieItem}>• Ensure security and integrity of your session</Text>
              <Text style={styles.cookieNote}>
                You can control cookies via your browser settings; however, disabling essential cookies may impair certain features.
              </Text>
            </View>

            <ColoredCard 
              title="Location Data (if enabled)"
              color="#14B8A6"
              items={[
                'Approximate location (via IP geolocation)',
                'Precise location (if you grant permission)'
              ]}
            />
          </Section>

          {/* Section 3 - How We Use Your Information */}
          <Section title="3. How We Use Your Information" icon="settings-outline">
            <Text style={styles.sectionIntro}>
              We process your Personal Data for the following purposes, always ensuring a lawful basis under applicable data protection laws:
            </Text>

            {[
              {
                title: 'Provision of Services',
                items: [
                  'Create and manage your Snoutiq account',
                  'Facilitate browsing, shopping, and service bookings',
                  'Process payments and remit payouts',
                  'Coordinate shipping and delivery',
                  'Schedule and conduct teleconsultations'
                ],
                color: DESIGN.COLORS.info
              },
              {
                title: 'Verification & Compliance',
                items: [
                  'Verify identity and professional credentials (KYC)',
                  'Prevent fraud and unauthorized access',
                  'Comply with tax and regulatory requirements'
                ],
                color: DESIGN.COLORS.success
              },
              {
                title: 'Customer Support & Dispute Resolution',
                items: [
                  'Respond to inquiries and complaints',
                  'Mediate disputes and initiate refunds',
                  'Enforce our Terms & Conditions'
                ],
                color: DESIGN.COLORS.warning
              },
              {
                title: 'Marketing & Communications',
                items: [
                  'Send transactional emails and notifications',
                  'Send promotional messages (with consent)',
                  'Provide opt-out mechanisms'
                ],
                color: '#7C3AED'
              },
              {
                title: 'Security & Legal Compliance',
                items: [
                  'Protect against security incidents',
                  'Enforce our legal rights',
                  'Comply with applicable laws and court orders'
                ],
                color: DESIGN.COLORS.error
              }
            ].map((item, index) => (
              <ColoredCard 
                key={index}
                title={item.title}
                items={item.items}
                color={item.color}
              />
            ))}
          </Section>

          {/* Section 4 - Sharing & Disclosure */}
          <Section title="4. Sharing & Disclosure" icon="share-social-outline">
            <Text style={styles.sectionIntro}>
              We only share your Personal Data in the following circumstances:
            </Text>

            <InfoCard borderColor={DESIGN.COLORS.success}>
              <Text style={styles.infoCardTitle}>With Your Consent</Text>
              <Text style={styles.infoCardText}>
                When you explicitly authorize us to share your data with third parties.
              </Text>
            </InfoCard>

            <View style={styles.sharingCard}>
              <Text style={styles.sharingTitle}>Service Providers & Third Parties</Text>
              <Text style={styles.sharingText}>
                We engage third parties who process Personal Data on our behalf:
              </Text>
              
              <View style={styles.providerItem}>
                <Text style={styles.providerTitle}>Payment Gateways:</Text>
                <Text style={styles.providerText}>Process payment transactions securely</Text>
              </View>

              <View style={styles.providerItem}>
                <Text style={styles.providerTitle}>Couriers & Logistics:</Text>
                <Text style={styles.providerText}>Receive shipping details to fulfill orders</Text>
              </View>

              <View style={styles.providerItem}>
                <Text style={styles.providerTitle}>Cloud & Hosting:</Text>
                <Text style={styles.providerText}>Store and process encrypted data</Text>
              </View>

              <View style={styles.providerItem}>
                <Text style={styles.providerTitle}>Analytics & Marketing:</Text>
                <Text style={styles.providerText}>Analyze usage and run campaigns</Text>
              </View>

              <Text style={styles.sharingNote}>
                All service providers are contractually obligated to protect Personal Data and only process it on our instructions.
              </Text>
            </View>
          </Section>

          {/* Section 5 - Data Retention */}
          <Section title="5. Data Retention" icon="time-outline">
            {[
              {
                title: 'Account Data & Profile',
                content: 'Retained as long as your account is active, then up to 7 years for statutory compliance.',
                color: DESIGN.COLORS.info
              },
              {
                title: 'Transactional & Order History',
                content: 'Retained for at least 7 years for tax and audit purposes.',
                color: DESIGN.COLORS.success
              },
              {
                title: 'Medical & Pet Health Records',
                content: 'Retained for minimum 7 years to comply with professional guidelines.',
                color: DESIGN.COLORS.error
              },
              {
                title: 'Support & Communication Records',
                content: 'Stored for up to 3 years to resolve disputes and improve service.',
                color: DESIGN.COLORS.warning
              },
              {
                title: 'Marketing & Behavioral Data',
                content: 'Retained for up to 2 years, unless you opt out earlier.',
                color: '#7C3AED'
              }
            ].map((item, index) => (
              <InfoCard key={index} borderColor={item.color}>
                <Text style={[styles.infoCardTitle, { color: item.color }]}>{item.title}</Text>
                <Text style={styles.infoCardText}>{item.content}</Text>
              </InfoCard>
            ))}
          </Section>

          {/* Section 6 - Your Rights */}
          <Section title="6. Your Rights & Choices" icon="shield-checkmark-outline">
            <View style={styles.rightsCard}>
              <Text style={styles.rightsTitle}>6.1. Access, Rectification & Deletion</Text>
              
              <View style={styles.rightItem}>
                <Text style={styles.rightLabel}>Access:</Text>
                <Text style={styles.rightText}>Request a copy of your Personal Data</Text>
              </View>

              <View style={styles.rightItem}>
                <Text style={styles.rightLabel}>Rectification:</Text>
                <Text style={styles.rightText}>Update inaccurate or incomplete data</Text>
              </View>

              <View style={styles.rightItem}>
                <Text style={styles.rightLabel}>Deletion:</Text>
                <Text style={styles.rightText}>Request deletion of your account and data</Text>
              </View>

              <View style={styles.contactBox}>
                <Ionicons name="mail" size={scale(20)} color={DESIGN.COLORS.primary} />
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>To submit a request:</Text>
                  <TouchableOpacity onPress={() => Linking.openURL('mailto:privacy@snoutiq.com')}>
                    <Text style={styles.contactEmail}>privacy@snoutiq.com</Text>
                  </TouchableOpacity>
                  <Text style={styles.contactNote}>We will respond within 30 days</Text>
                </View>
              </View>
            </View>

            <InfoCard borderColor={DESIGN.COLORS.success}>
              <Text style={styles.infoCardTitle}>6.2. Objection & Restriction</Text>
              <Text style={styles.infoCardText}>
                • Opt out of marketing communications{'\n'}
                • Disable cookies via browser settings{'\n'}
                • Request human review of automated decisions
              </Text>
            </InfoCard>

            <InfoCard borderColor={DESIGN.COLORS.info}>
              <Text style={styles.infoCardTitle}>6.3. Data Portability</Text>
              <Text style={styles.infoCardText}>
                Request a machine-readable copy of your data where technically feasible.
              </Text>
            </InfoCard>
          </Section>

          {/* Section 7 - Children's Privacy */}
          <Section title="7. Children's Privacy" icon="people-outline">
            <InfoCard borderColor={DESIGN.COLORS.error}>
              <Text style={styles.warningText}>
                Snoutiq is not directed to children under 18. We do not knowingly collect Personal Data from minors. If you believe we have collected information from a minor, please contact us at privacy@snoutiq.com.
              </Text>
            </InfoCard>
          </Section>

          {/* Section 8 - Security */}
          <Section title="8. Security of Your Information" icon="lock-closed-outline">
            {[
              {
                title: 'Technical & Organizational Measures',
                content: 'We implement industry-standard security practices, including encrypted communication (HTTPS/TLS), data encryption at rest, firewalls, intrusion detection, and regular security audits.',
                color: DESIGN.COLORS.success
              },
              {
                title: 'Breach Notification',
                content: 'In the event of a data breach, we will notify you and relevant authorities within 72 hours, as required by law.',
                color: DESIGN.COLORS.warning
              },
              {
                title: 'Your Role in Security',
                content: 'You are responsible for maintaining the confidentiality of your account credentials. Do not share your password with anyone.',
                color: DESIGN.COLORS.info
              }
            ].map((item, index) => (
              <InfoCard key={index} borderColor={item.color}>
                <Text style={[styles.infoCardTitle, { color: item.color }]}>{item.title}</Text>
                <Text style={styles.infoCardText}>{item.content}</Text>
              </InfoCard>
            ))}
          </Section>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <Text style={styles.contactSectionTitle}>Contact Information</Text>
            <Text style={styles.contactSectionText}>
              If you have questions or concerns regarding this Privacy Policy, please contact:
            </Text>
            
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Ionicons name="shield-checkmark" size={scale(24)} color={DESIGN.COLORS.primary} />
                <Text style={styles.contactCardTitle}>Privacy & Data Protection Team</Text>
              </View>
              
              <Text style={styles.addressText}>
                Thinktail Global Pvt. Ltd. (Snoutiq){'\n'}
                Plot No. 20, Block H-1/A, Sector-63{'\n'}
                Noida-201301, Uttar Pradesh, India
              </Text>

              <View style={styles.emailContainer}>
                <Ionicons name="mail" size={scale(18)} color={DESIGN.COLORS.primary} />
                <TouchableOpacity onPress={() => Linking.openURL('mailto:privacy@snoutiq.com')}>
                  <Text style={styles.emailLink}>privacy@snoutiq.com</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.emailContainer}>
                <Ionicons name="information-circle" size={scale(18)} color={DESIGN.COLORS.info} />
                <TouchableOpacity onPress={() => Linking.openURL('mailto:info@snoutiq.com')}>
                  <Text style={styles.emailLink}>info@snoutiq.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Snoutiq, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your Personal Data as described herein.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.background,
  },
  header: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.md,
    paddingBottom: DESIGN.SPACING.xl,
    borderBottomLeftRadius: DESIGN.RADIUS.xl,
    borderBottomRightRadius: DESIGN.RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: DESIGN.SPACING.xs,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h1,
    fontWeight: '700',
    color: DESIGN.COLORS.white,
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  headerSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  headerPlaceholder: {
    width: scale(28),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DESIGN.SPACING.xxl * 2,
  },
  content: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.xl,
  },
  infoCard: {
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
    marginBottom: DESIGN.SPACING.lg,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  introText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.gray700,
    lineHeight: scale(22),
  },
  section: {
    marginBottom: DESIGN.SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN.SPACING.sm,
    marginBottom: DESIGN.SPACING.md,
  },
  sectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h2,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
  },
  sectionIntro: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.gray700,
    lineHeight: scale(22),
    marginBottom: DESIGN.SPACING.lg,
  },
  subsectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: '600',
    color: DESIGN.COLORS.gray900,
    marginTop: DESIGN.SPACING.lg,
    marginBottom: DESIGN.SPACING.md,
  },
  definitionCard: {
    backgroundColor: DESIGN.COLORS.gray50,
    borderRadius: DESIGN.RADIUS.md,
    padding: DESIGN.SPACING.md,
    marginBottom: DESIGN.SPACING.md,
  },
  definitionTerm: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.SPACING.xs,
  },
  definitionText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray700,
    lineHeight: scale(18),
  },
  coloredCard: {
    borderRadius: DESIGN.RADIUS.md,
    padding: DESIGN.SPACING.md,
    marginBottom: DESIGN.SPACING.md,
    borderWidth: 1,
  },
  coloredCardTitle: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginBottom: DESIGN.SPACING.sm,
  },
  coloredCardItem: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    lineHeight: scale(20),
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  cookieCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: DESIGN.RADIUS.md,
    padding: DESIGN.SPACING.md,
    marginBottom: DESIGN.SPACING.md,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  cookieTitle: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: DESIGN.SPACING.sm,
  },
  cookieText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: '#9A3412',
    marginBottom: DESIGN.SPACING.xs,
  },
  cookieItem: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: '#9A3412',
    lineHeight: scale(18),
  },
  cookieNote: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    color: '#9A3412',
    fontStyle: 'italic',
    marginTop: DESIGN.SPACING.sm,
  },
  sharingCard: {
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
    marginBottom: DESIGN.SPACING.md,
    borderWidth: 1,
    borderColor: DESIGN.COLORS.info + '30',
  },
  sharingTitle: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: '700',
    color: DESIGN.COLORS.info,
    marginBottom: DESIGN.SPACING.sm,
  },
  sharingText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray700,
    marginBottom: DESIGN.SPACING.md,
  },
  providerItem: {
    marginBottom: DESIGN.SPACING.sm,
  },
  providerTitle: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
  },
  providerText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
  },
  sharingNote: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    color: DESIGN.COLORS.info,
    fontStyle: 'italic',
    marginTop: DESIGN.SPACING.sm,
  },
  rightsCard: {
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
    marginBottom: DESIGN.SPACING.md,
    borderWidth: 1,
    borderColor: '#6366F1' + '30',
  },
  rightsTitle: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: DESIGN.SPACING.md,
  },
  rightItem: {
    marginBottom: DESIGN.SPACING.md,
  },
  rightLabel: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  rightText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray700,
  },
  contactBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: DESIGN.RADIUS.md,
    padding: DESIGN.SPACING.md,
    gap: DESIGN.SPACING.sm,
    marginTop: DESIGN.SPACING.md,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    fontWeight: '600',
    color: DESIGN.COLORS.gray900,
  },
  contactEmail: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.primary,
    textDecorationLine: 'underline',
    marginVertical: DESIGN.SPACING.xs / 2,
  },
  contactNote: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    color: DESIGN.COLORS.gray600,
  },
  warningText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.error,
    lineHeight: scale(22),
  },
  infoCardTitle: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginBottom: DESIGN.SPACING.xs,
  },
  infoCardText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray700,
    lineHeight: scale(20),
  },
  contactSection: {
    marginTop: DESIGN.SPACING.xl,
    marginBottom: DESIGN.SPACING.lg,
  },
  contactSectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h2,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.SPACING.md,
  },
  contactSectionText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.gray700,
    lineHeight: scale(20),
    marginBottom: DESIGN.SPACING.md,
  },
  privacypolicy: {
    backgroundColor: DESIGN.COLORS.white,
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingVertical: DESIGN.SPACING.xl,
    borderRadius: DESIGN.RADIUS.lg,
    marginVertical: DESIGN.SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

})

