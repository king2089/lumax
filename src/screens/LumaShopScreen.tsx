import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isSale?: boolean;
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Luma AI Smart Watch',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'Electronics',
    rating: 4.8,
    reviews: 1247,
    isNew: true,
    isSale: true,
  },
  {
    id: '2',
    name: 'Luma Premium Subscription',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    category: 'Digital',
    rating: 4.9,
    reviews: 892,
    isNew: true,
  },
  {
    id: '3',
    name: 'Luma AI Headphones',
    price: 149.99,
    originalPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
    rating: 4.7,
    reviews: 567,
    isSale: true,
  },
  {
    id: '4',
    name: 'Luma Creator Kit',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    category: 'Creator Tools',
    rating: 4.6,
    reviews: 234,
  },
  {
    id: '5',
    name: 'Luma Health Monitor',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    category: 'Health',
    rating: 4.9,
    reviews: 1567,
    isSale: true,
  },
  {
    id: '6',
    name: 'Luma AI Course Bundle',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    category: 'Education',
    rating: 4.8,
    reviews: 892,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'electronics', name: 'Electronics', icon: 'phone-portrait' },
  { id: 'digital', name: 'Digital', icon: 'card' },
  { id: 'health', name: 'Health', icon: 'heart' },
  { id: 'creator', name: 'Creator', icon: 'create' },
  { id: 'education', name: 'Education', icon: 'school' },
];

export const LumaShopScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const filteredProducts = selectedCategory === 'all' 
    ? SAMPLE_PRODUCTS 
    : SAMPLE_PRODUCTS.filter(product => 
        product.category.toLowerCase() === selectedCategory
      );

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    Alert.alert('Added to Cart', 'Product added to your cart!');
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const renderProduct = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        {product.isSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewsText}>({product.reviews})</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(product.id)}
        >
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.addToCartGradient}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Ionicons name="bag" size={28} color="#fff" />
              <Text style={styles.headerTitle}>Luma Shop</Text>
            </View>
            <TouchableOpacity style={styles.cartButton}>
              <Ionicons name="cart" size={24} color="#fff" />
              {getCartCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.id ? '#FF6B6B' : '#666'} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products */}
      <ScrollView 
        style={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsContent}
      >
        <View style={styles.productsGrid}>
          {filteredProducts.map(renderProduct)}
        </View>
      </ScrollView>

      {/* Checkout Button */}
      {getCartCount() > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.checkoutButton}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.checkoutGradient}>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.checkoutText}>Checkout ({getCartCount()} items)</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoriesContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  selectedCategory: {
    backgroundColor: '#fff0f0',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
  },
  productsContent: {
    padding: 15,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    height: 120,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saleBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 18,
  },
  productCategory: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  addToCartButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  checkoutContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});

export default LumaShopScreen; 