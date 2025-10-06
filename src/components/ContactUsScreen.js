import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ContactUsScreen = ({ navigation }) => {

    const contactMethods = [
        {
            icon: <MaterialIcons name="phone" size={24} color="#1783BB" />,
            title: "Call Us",
            value: "+91 96341 65605",
            action: () => Linking.openURL(`tel:+919634165605`)
        },
        {
            icon: <MaterialIcons name="email" size={24} color="#1783BB" />,
            title: "Email Us",
            value: "contact.naukrion@gmail.com",
            action: () => Linking.openURL('mailto:contact.naukrion@gmail.com')
        },
        {
            icon: <FontAwesome name="whatsapp" size={24} color="#1783BB" />,
            title: "WhatsApp",
            value: "+91 96341 65605",
            action: () => Linking.openURL('https://wa.me/919634165605')
        },
        {
            icon: <Feather name="map-pin" size={24} color="#1783BB" />,
            title: "Office Address",
            value: "NaukrionXpert Pvt. Ltd.\nPlot 5, Royal Apartment, Nobel Enclave, Sector 22,\nGurugram Haryana, India - 122015"
        }
    ];

    const socialMedia = [
        {
            icon: <FontAwesome name="linkedin" size={24} color="#0077B5" />,
            action: () => Linking.openURL('https://linkedin.com/company/naukrionxpert')
        },
        {
            icon: <FontAwesome name="twitter" size={24} color="#1DA1F2" />,
            action: () => Linking.openURL('https://twitter.com/naukrionxpert')
        },
        {
            icon: <FontAwesome name="facebook" size={24} color="#4267B2" />,
            action: () => Linking.openURL('https://www.facebook.com/profile.php?id=61575248618034')
        },
        {
            icon: <FontAwesome name="instagram" size={24} color="#E1306C" />,
            action: () => Linking.openURL('https://www.instagram.com/naukrion/')
        }
    ];

    return (
        <SafeAreaView style={[styles.container]}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contact Us</Text>
                    <View style={{ width: 24 }} /> 
                </View>

                {/* Company Info */}
                <View style={styles.companyContainer}>
                    <Text style={styles.companyName}>NaukrionXpert Private Limited</Text>
                    <Text style={styles.companyTagline}>Your Career Growth Partners</Text>
                </View>

                {/* Contact Methods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Get In Touch</Text>
                    {contactMethods.map((method, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.contactCard}
                            onPress={method.action}
                            activeOpacity={0.7}
                        >
                            <View style={styles.contactIcon}>
                                {method.icon}
                            </View>
                            <View style={styles.contactTextContainer}>
                                <Text style={styles.contactTitle}>{method.title}</Text>

                                {method.value && (
                                    <Text style={styles.contactValue}>
                                        {typeof method.value === 'string' ? method.value : String(method.value)}
                                    </Text>
                                )}

                            </View>
                            {method.action && (
                                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Social Media */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connect With Us</Text>
                    <View style={styles.socialContainer}>
                        {socialMedia.map((social, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.socialIcon}
                                onPress={social.action}
                            >
                                {social.icon}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Business Hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Hours</Text>
                    <View style={styles.hoursContainer}>
                        <View style={styles.hourRow}>
                            <Text style={styles.hourDay}>Monday - Friday</Text>
                            <Text style={styles.hourTime}>9:00 AM - 6:00 PM</Text>
                        </View>
                        <View style={styles.hourRow}>
                            <Text style={styles.hourDay}>Saturday - Sunday</Text>
                            <Text style={styles.hourTime}>Closed</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    scrollContainer: {
        paddingBottom: 30,
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
    companyContainer: {
        padding: 20,
        backgroundColor: '#1783BB',
        alignItems: 'center',
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    companyTagline: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    section: {
        marginTop: 20,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1783BB',
        marginBottom: 15,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
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
        marginRight: 15,
    },
    contactTextContainer: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 15,
        color: '#555',
        marginBottom: 3,
    },
    contactValue: {
        fontSize: 14,
        color: '#777',
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
    },
    socialIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hoursContainer: {
        paddingVertical: 10,
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    hourDay: {
        fontSize: 14,
        color: '#555',
    },
    hourTime: {
        fontSize: 14,
        color: '#1783BB',
        fontWeight: '500',
    },
});

export default ContactUsScreen;