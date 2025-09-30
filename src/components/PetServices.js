import { LinearGradient } from 'expo-linear-gradient';
import {
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';

const PetServices = ({navigation}) => {

    const serviceData = [
        {name :'Vet', icn:'✚',color:styles.categoryVet},
        {name :'Groomer', icn:'🪮',color:styles.categoryGroomer},
        {name :'Boarding', icn:'🏠',color:styles.categoryBoarding},
        {name :'Walking', icn:'🐕',color:styles.categoryWalking},
        {name :'Training', icn:'🎓',color:styles.categoryTraining},
        {name :'Sitting', icn:'🐾',color:styles.categorySitting},
    ];

    const serviceRender = ({item}) => (
        <TouchableOpacity 
          onPress={() => Alert.alert('Coming Soon', `${item?.name} feature coming soon`)}
          style={styles.categoriesContainer}
          activeOpacity={0.7}
        >
          <View style={[styles.categoryCard, item?.color]}>
            <Text style={styles.categoryIcon}>{item?.icn}</Text>
            <Text style={styles.categoryText}>{item?.name}</Text>
          </View>
        </TouchableOpacity> 
    );

    const BookData = [
       {name:'Cityside Animal Hospital',service:'Full-service grooming & spa treatments', rating:4.5, btn:'Book now',img:'🐕'},
       {name:'Walking Daily Dog Walks',service:'GPS-tracked walks & special treats', rating:4.5, btn:'Book now',img:'🐕'},
       {name:'The Dog & Co. Cafe',service:'Cafe for your Pets', rating:4.5, btn:'Book now',img:'☕'},
    ];

    const BookRender = ({item}) => (
         <View style={styles.servicesList}>
          <View style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>{item?.img}</Text>
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item?.name}</Text>
              <Text style={styles.serviceDescription}>
                {item?.service}
              </Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#FFA500" />
                <Text style={styles.ratingText}>{item?.rating}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => Alert.alert('Coming Soon', 'Appointment booking feature coming soon')} 
              style={styles.bookButton}
              activeOpacity={0.8}
            >
              <Text style={styles.bookButtonText}>{item?.btn}</Text>
            </TouchableOpacity>
          </View>
        </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#dbeafe', '#e0e7ff']} 
        style={styles.gradientContainer}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Services</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIconStyle} />
            <TextInput
              style={styles.searchInput}
              placeholder="What service are you looking for today?"
              placeholderTextColor="#999"
            />
          </View>

          {/* Service Categories */}
          <View style={styles.categoriesSection}>
            <FlatList
              horizontal
              data={serviceData}
              renderItem={serviceRender}
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Pawspective Picks */}
          <View style={styles.picksContainer}>
            <Text style={styles.picksTitle}>Pawspective Picks</Text>
            <TouchableOpacity>
              <View style={styles.mapViewButton}>
                <Ionicons name="map-outline" size={16} color="#666" />
                <Text style={styles.mapView}>Map View</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.picksCards}>
            <View style={styles.pickCard}>
              <View style={styles.pickHeader}>
                <Text style={styles.pickIcon}>🐕</Text>
                <View style={styles.pickTextContainer}>
                  <Text style={styles.pickTitle}>Top-rated groomer</Text>
                  <Text style={styles.pickSubtitle}>for long-haired breeds</Text>
                </View>
              </View>
              <View style={styles.pickImageContainer}>
                <View style={styles.pickImage}>
                  <Text style={styles.dogEmoji}>🐶</Text>
                </View>
              </View>
            </View>

            <View style={styles.pickCard}>
              <View style={styles.pickHeader}>
                <Text style={styles.pickIcon}>🐕</Text>
                <View style={styles.pickTextContainer}>
                  <Text style={styles.pickTitle}>Best boarding for</Text>
                  <Text style={styles.pickSubtitle}>anxious dogs</Text>
                </View>
              </View>
              <View style={styles.pickImageContainer}>
                <View style={styles.pickBowl}>
                  <View style={styles.bowlRim} />
                  <View style={styles.bowlBody} />
                </View>
              </View>
            </View>
          </View>

          {/* Explore All Services */}
          <View style={styles.exploreHeader}>
            <Text style={styles.exploreTitle}>Explore All Services</Text>
            <TouchableOpacity style={styles.toggleSwitch}>
              <View style={styles.toggleInactive} />
            </TouchableOpacity>
          </View>

          {/* Service List */}
          <FlatList
            data={BookData}
            renderItem={BookRender}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeafe',
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'ios' ? verticalScale(120) : verticalScale(100),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: scale(12),
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#2d3e2e',
  },
  cartIcon: {
    position: 'relative',
  },
  cartText: {
    fontSize: moderateScale(24),
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    width: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: scale(20),
    marginBottom: verticalScale(20),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIconStyle: {
    marginRight: scale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#333',
  },
  categoriesSection: {
    marginBottom: verticalScale(20),
  },
  categoriesList: {
    paddingLeft: scale(20),
    paddingRight: scale(10),
  },
  categoriesContainer: {
    marginRight: scale(12),
  },
  categoryCard: {
    width: scale(70),
    height: verticalScale(90),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '-5deg'}],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryVet: {
    backgroundColor: '#ff6b7a',
  },
  categoryGroomer: {
    backgroundColor: '#5ba4d4',
  },
  categoryBoarding: {
    backgroundColor: '#4db896',
  },
  categoryWalking: {
    backgroundColor: '#f4c542',
  },
  categoryTraining: {
    backgroundColor: '#9d7a6a',
  },
  categorySitting: {
    backgroundColor: '#9b7bc8',
  },
  categoryIcon: {
    fontSize: moderateScale(30),
    color: 'white',
    marginBottom: verticalScale(5),
  },
  categoryText: {
    color: 'white',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  picksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(15),
  },
  picksTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#2d3e2e',
  },
  mapViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  mapView: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  picksCards: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  pickCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    marginRight: scale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickHeader: {
    flexDirection: 'row',
    marginBottom: verticalScale(10),
  },
  pickIcon: {
    fontSize: moderateScale(20),
    marginRight: scale(8),
  },
  pickTextContainer: {
    flex: 1,
  },
  pickTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#333',
  },
  pickSubtitle: {
    fontSize: moderateScale(11),
    color: '#666',
  },
  pickImageContainer: {
    alignItems: 'center',
  },
  pickImage: {
    width: scale(60),
    height: scale(60),
    backgroundColor: '#f5e6d3',
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogEmoji: {
    fontSize: moderateScale(30),
  },
  pickBowl: {
    width: scale(60),
    height: scale(60),
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bowlRim: {
    width: scale(50),
    height: scale(8),
    backgroundColor: '#5dbecd',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  bowlBody: {
    width: scale(45),
    height: scale(20),
    backgroundColor: '#5dbecd',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  exploreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(15),
  },
  exploreTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#2d3e2e',
  },
  toggleSwitch: {
    width: scale(50),
    height: scale(28),
    borderRadius: 14,
    backgroundColor: '#ddd',
    padding: 3,
    justifyContent: 'center',
  },
  toggleInactive: {
    width: scale(22),
    height: scale(22),
    borderRadius: 11,
    backgroundColor: 'white',
  },
  servicesList: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(12),
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    width: scale(50),
    height: scale(50),
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  serviceIconText: {
    fontSize: moderateScale(24),
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: verticalScale(4),
  },
  serviceDescription: {
    fontSize: moderateScale(12),
    color: '#666',
    marginBottom: verticalScale(4),
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: '#666',
    marginLeft: scale(4),
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#4db896',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
  },
  bookButtonText: {
    color: 'white',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
});

export default PetServices;