import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HelpCenterScreen = ({ navigation }) => {

    const faqs = [
        {
            question: "How do I update my profile information?",
            answer: "Go to Settings > Edit Profile to update your personal details."
        },
        {
            question: "How can I change my password?",
            answer: "Navigate to Settings > Change Password to set a new password."
        },
        {
            question: "Where can I view my job applications?",
            answer: "Check the 'Applications' tab in the bottom navigation."
        },
        {
            question: "How do I contact support?",
            answer: "Use the 'Contact Us' option in Settings or email us at contact.naukrion@gmail.com"
        }
    ];

    const contactMethods = [
        {
            icon: <MaterialIcons name="email" size={24} color="#1783BB" />,
            title: "Email Support",
            value: "contact.naukrion@gmail.com",
            action: () => Linking.openURL('mailto:contact.naukrion@gmail.com')
        },
        {
            icon: <FontAwesome name="whatsapp" size={24} color="#1783BB" />,
            title: "WhatsApp Chat",
            value: "+91 96341 65605",
            action: () => Linking.openURL('https://wa.me/919634165605')
        },
        {
            icon: <MaterialIcons name="phone" size={24} color="#1783BB" />,
            title: "Call Support",
            value: "+91 96341 65605",
            action: () => Linking.openURL('tel:+919634165605')
        }
    ];

    return (
        <SafeAreaView style={[styles.container]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Welcome Section */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeTitle}>How can we help you?</Text>
                    <Text style={styles.welcomeText}>
                        Find answers to common questions or contact our support team directly.
                    </Text>
                </View>

                {/* FAQs Section */}
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                <View style={styles.faqContainer}>
                    {faqs.map((faq, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.faqItem}
                            onPress={() => navigation.navigate('FAQDetail', { faq })}
                        >
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Contact Support Section */}
                <Text style={styles.sectionTitle}>Contact Support</Text>
                <View style={styles.contactContainer}>
                    {contactMethods.map((method, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.contactCard}
                            onPress={method.action}
                        >
                            <View style={styles.contactIcon}>
                                {method.icon}
                            </View>
                            <View style={styles.contactText}>
                                <Text style={styles.contactTitle}>{method.title}</Text>
                                <Text style={styles.contactValue}>
                                    {typeof method.value === 'string' ? method.value : String(method.value)}
                                </Text>


                            </View>
                        </TouchableOpacity>
                    ))}
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
    scrollContainer: {
        paddingBottom: 20,
    },
    welcomeContainer: {
        padding: 20,
        backgroundColor: '#1783BB',
        margin: 16,
        borderRadius: 8,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1783BB',
        marginHorizontal: 16,
        marginTop: 24,
        marginBottom: 12,
    },
    faqContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    faqItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    faqQuestion: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    contactContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e6f2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactText: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 15,
        color: '#333',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 14,
        color: '#666',
    },
});

export default HelpCenterScreen;