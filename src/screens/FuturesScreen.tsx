import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { scale, responsiveStyle } from '../utils/responsive';

const { width } = Dimensions.get('window');

// Upcoming FTs data
const UPCOMING_FTS = [
  {
    id: 'u1',
    name: 'Luma Game Engine',
    description: 'Next-gen game development platform with AI integration',
    launchDate: '2024-04-15',
    price: '5.00',
    supply: '10,000',
    image: 'https://via.placeholder.com/200/00C853/FFFFFF?text=GAME',
    category: 'Gaming',
    features: [
      'AI-powered game mechanics',
      'Cross-platform support',
      'Built-in NFT marketplace'
    ]
  },
  {
    id: 'u2',
    name: 'Luma AI Artist',
    description: 'Create and mint AI-generated artwork instantly',
    launchDate: '2024-03-20',
    price: '2.50',
    supply: '5,000',
    image: 'https://via.placeholder.com/200/00C853/FFFFFF?text=AI',
    category: 'AI',
    features: [
      'Real-time art generation',
      'Custom style transfer',
      'Automatic minting'
    ]
  },
  {
    id: 'u3',
    name: 'Luma Virtual Worlds',
    description: 'Create and explore virtual reality spaces',
    launchDate: '2024-05-01',
    price: '7.50',
    supply: '3,000',
    image: 'https://via.placeholder.com/200/00C853/FFFFFF?text=VR',
    category: 'Metaverse',
    features: [
      'VR compatibility',
      'Social spaces',
      'Digital asset integration'
    ]
  },
];

// Current FTs data
const CURRENT_FTS = [
  {
    id: '1',
    name: 'Luma Genesis Pass',
    symbol: 'LUMA-GP',
    price: '125.50',
    change: '+12.34%',
    volume: '25.5K',
    holders: '2.1K',
    isPositive: true,
  },
  {
    id: '2',
    name: 'Luma Creator Token',
    symbol: 'LUMA-CR',
    price: '45.75',
    change: '+8.92%',
    volume: '15.2K',
    holders: '1.8K',
    isPositive: true,
  },
  {
    id: '3',
    name: 'Luma Collector Pass',
    symbol: 'LUMA-CP',
    price: '75.25',
    change: '-2.45%',
    volume: '18.7K',
    holders: '3.2K',
    isPositive: false,
  },
];

export const FuturesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderUpcomingFT = ({ item }: any) => (
    <TouchableOpacity style={styles.upcomingCard}>
      <Image source={{ uri: item.image }} style={styles.upcomingImage} />
      <View style={styles.upcomingContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.upcomingName}>{item.name}</Text>
        <Text style={styles.upcomingDescription}>{item.description}</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>${item.price}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Supply</Text>
            <Text style={styles.detailValue}>{item.supply}</Text>
          </View>
        </View>
        <Text style={styles.launchDate}>Launch: {item.launchDate}</Text>
        <View style={styles.featuresList}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#00C853" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCurrentFT = ({ item }: any) => (
    <TouchableOpacity style={styles.ftItem}>
      <View style={styles.ftMain}>
        <View style={styles.ftInfo}>
          <Text style={styles.ftName}>{item.name}</Text>
          <Text style={styles.ftSymbol}>{item.symbol}</Text>
        </View>
        <View style={styles.ftStats}>
          <Text style={styles.ftPrice}>${item.price}</Text>
          <Text style={[
            styles.ftChange,
            item.isPositive ? styles.positiveChange : styles.negativeChange
          ]}>
            {item.change}
          </Text>
        </View>
      </View>
      <View style={styles.ftDetails}>
        <View style={styles.ftDetailItem}>
          <Text style={styles.ftDetailLabel}>Volume</Text>
          <Text style={styles.ftDetailValue}>{item.volume}</Text>
        </View>
        <View style={styles.ftDetailItem}>
          <Text style={styles.ftDetailLabel}>Holders</Text>
          <Text style={styles.ftDetailValue}>{item.holders}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Luma Go FTs</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Quick Access Luma AI */}
      <TouchableOpacity style={styles.lumaAiButton}>
        <View style={styles.lumaAiContent}>
          <Ionicons name="flash" size={24} color="#fff" />
          <Text style={styles.lumaAiText}>Quick Mint with Luma AI</Text>
        </View>
        <Ionicons name="arrow-forward" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Upcoming FTs Section */}
      <View style={styles.upcomingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming FTs</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={UPCOMING_FTS}
          renderItem={renderUpcomingFT}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.upcomingList}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            All FTs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'trending' && styles.activeTab]}
          onPress={() => setSelectedTab('trending')}
        >
          <Text style={[styles.tabText, selectedTab === 'trending' && styles.activeTabText]}>
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'new' && styles.activeTab]}
          onPress={() => setSelectedTab('new')}
        >
          <Text style={[styles.tabText, selectedTab === 'new' && styles.activeTabText]}>
            New
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={CURRENT_FTS}
        renderItem={renderCurrentFT}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00C853"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#f8f9fa',
  }),
  header: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  headerTitle: responsiveStyle({
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  backButton: responsiveStyle({
    padding: 8,
  }),
  settingsButton: responsiveStyle({
    padding: 8,
  }),
  lumaAiButton: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00C853',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  }),
  lumaAiContent: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  lumaAiText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  }),
  upcomingSection: responsiveStyle({
    backgroundColor: '#fff',
    marginBottom: 16,
  }),
  sectionHeader: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  sectionTitle: responsiveStyle({
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  viewAllButton: responsiveStyle({
    color: '#1877f2',
    fontSize: 14,
    fontWeight: '600',
  }),
  upcomingList: {
    paddingHorizontal: 12,
  },
  upcomingCard: responsiveStyle({
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
  upcomingImage: responsiveStyle({
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  }),
  upcomingContent: responsiveStyle({
    padding: 16,
  }),
  categoryBadge: responsiveStyle({
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  }),
  categoryText: responsiveStyle({
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  }),
  upcomingName: responsiveStyle({
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 4,
  }),
  upcomingDescription: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    marginBottom: 12,
    lineHeight: 20,
  }),
  detailsContainer: responsiveStyle({
    flexDirection: 'row',
    marginBottom: 8,
  }),
  detailItem: responsiveStyle({
    flex: 1,
  }),
  detailLabel: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
  }),
  detailValue: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  launchDate: responsiveStyle({
    fontSize: 12,
    color: '#1877f2',
    fontWeight: '600',
    marginBottom: 12,
  }),
  featuresList: responsiveStyle({
    gap: 8,
  }),
  featureItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  featureText: responsiveStyle({
    fontSize: 14,
    color: '#1c1e21',
    marginLeft: 8,
  }),
  tabs: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00C853',
  },
  tabText: {
    fontSize: 16,
    color: '#65676b',
  },
  activeTabText: {
    color: '#00C853',
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  ftItem: responsiveStyle({
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  ftMain: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  }),
  ftInfo: responsiveStyle({
    flex: 1,
  }),
  ftName: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  ftSymbol: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
  }),
  ftStats: responsiveStyle({
    alignItems: 'flex-end',
  }),
  ftPrice: responsiveStyle({
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
  }),
  ftChange: responsiveStyle({
    fontSize: 14,
    fontWeight: '600',
  }),
  positiveChange: responsiveStyle({
    color: '#00C853',
  }),
  negativeChange: responsiveStyle({
    color: '#f44336',
  }),
  ftDetails: responsiveStyle({
    flexDirection: 'row',
  }),
  ftDetailItem: responsiveStyle({
    flex: 1,
  }),
  ftDetailLabel: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
  }),
  ftDetailValue: responsiveStyle({
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
  }),
}); 