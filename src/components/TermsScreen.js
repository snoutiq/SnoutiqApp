import React from 'react';
import { ScrollView, StyleSheet, Text, View, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TermsScreen = () => {
  const navigation = useNavigation();

  const openEmail = () => {
    Linking.openURL('mailto:contact.naukrion@gmail.com');
  };

  const openWebsite = () => {
    Linking.openURL('https://naukrion.com/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color="#333" 
          onPress={() => navigation.goBack()}
          style={styles.backIcon}
        />
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.lastUpdated}>Last updated: April 18, 2025</Text>
        
        <Text style={styles.introText}>
          Please read these terms and conditions carefully before using Our Service.
        </Text>

        {/* Interpretation and Definitions */}
        <Section title="Interpretation and Definitions">
          <SubSection title="Interpretation">
            <Paragraph>
              The words of which the initial letter is capitalized have meanings defined under the following conditions. 
              The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
            </Paragraph>
          </SubSection>

          <SubSection title="Definitions">
            <Paragraph>For the purposes of these Terms and Conditions:</Paragraph>
            
            <Definition term="Affiliate">
              means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
            </Definition>

            <Definition term="Country">
              refers to: Haryana, India
            </Definition>

            <Definition term="Company">
              (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to NaukrionXpert Private Limited, Plot 5, Royal Apartment, Nobel Enclave, Sector 22, Gurugram.
            </Definition>

            <Definition term="Device">
              means any device that can access the Service such as a computer, a cellphone or a digital tablet.
            </Definition>

            <Definition term="Service">
              refers to the Website.
            </Definition>

            <Definition term="Terms and Conditions">
              (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.
            </Definition>

            <Definition term="Website">
              refers to naukrion, accessible from <Text style={styles.link} onPress={openWebsite}>https://naukrion.com/</Text>
            </Definition>
          </SubSection>
        </Section>

        {/* Acknowledgment */}
        <Section title="Acknowledgment">
          <Paragraph>
            These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. 
            These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
          </Paragraph>
          <Paragraph>
            Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. 
            These Terms and Conditions apply to all visitors, users and others who access or use the Service.
          </Paragraph>
          <Paragraph>
            By accessing or using the Service You agree to be bound by these Terms and Conditions. 
            If You disagree with any part of these Terms and Conditions then You may not access the Service.
          </Paragraph>
          <Paragraph>
            You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.
          </Paragraph>
        </Section>

        {/* Links to Other Websites */}
        <Section title="Links to Other Websites">
          <Paragraph>
            Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.
          </Paragraph>
          <Paragraph>
            The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. 
            You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.
          </Paragraph>
          <Paragraph>
            We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.
          </Paragraph>
        </Section>

        {/* Termination */}
        <Section title="Termination">
          <Paragraph>
            We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
          </Paragraph>
          <Paragraph>
            Upon termination, Your right to use the Service will cease immediately.
          </Paragraph>
        </Section>

        {/* Limitation of Liability */}
        <Section title="Limitation of Liability">
          <Paragraph>
            Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.
          </Paragraph>
        </Section>

        {/* Contact Us */}
        <Section title="Contact Us">
          <Paragraph>
            If you have any questions about these Terms and Conditions, You can contact us:
          </Paragraph>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color="#1783BB" />
            <Text style={styles.contactText} onPress={openEmail}>contact.naukrion@gmail.com</Text>
          </View>
        </Section>
      </ScrollView>
  </SafeAreaView>
  );
};

// Reusable components for better organization
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SubSection = ({ title, children }) => (
  <View style={styles.subSection}>
    <Text style={styles.subSectionTitle}>{title}</Text>
    {children}
  </View>
);

const Paragraph = ({ children }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

const Definition = ({ term, children }) => (
  <View style={styles.definition}>
    <Text style={styles.term}>{term}</Text>
    <Text style={styles.definitionText}> - {children}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  introText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1783BB',
    marginBottom: 12,
  },
  subSection: {
    marginBottom: 16,
    marginLeft: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  definition: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  term: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  definitionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  link: {
    color: '#1783BB',
    textDecorationLine: 'underline',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#1783BB',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
});

export default TermsScreen;