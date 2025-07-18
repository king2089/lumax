import { Dimensions, Platform, PixelRatio, ScaledSize } from 'react-native';

const { width, height } = Dimensions.get('window');

// Platform detection
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

// Device size breakpoints with better detection
export const isSmallDevice = width < 375; // iPhone SE, small Android
export const isMediumDevice = width >= 375 && width < 414; // iPhone 12/13/14, medium Android
export const isLargeDevice = width >= 414 && width < 768; // iPhone 12/14 Pro Max, large Android (6.1" and up)
export const isTablet = width >= 768; // iPad, Android tablets

// Screen orientation detection
export const isPortrait = height > width;
export const isLandscape = width > height;

// Safe area helpers with cross-platform support
export const getSafeAreaInsets = () => {
  const isIOS = Platform.OS === 'ios';
  const isIPhoneX = isIOS && (height >= 812 || width >= 812);
  
  return {
    top: isIPhoneX ? 44 : isIOS ? 20 : 24, // Android status bar height
    bottom: isIPhoneX ? 34 : 0,
    left: 0,
    right: 0
  };
};

// Enhanced responsive scaling functions with cross-platform support
export const scale = (size: number): number => {
  const baseWidth = isAndroid ? 360 : 375; // Android base width vs iOS
  const scaleFactor = width / baseWidth;
  const newSize = size * scaleFactor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const verticalScale = (size: number): number => {
  const baseHeight = isAndroid ? 640 : 812; // Android base height vs iOS
  const scaleFactor = height / baseHeight;
  const newSize = size * scaleFactor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Screen-specific scaling with platform awareness
export const screenScale = (size: number, screenWidth = width): number => {
  const baseWidth = isAndroid ? 360 : 375;
  const scaleFactor = screenWidth / baseWidth;
  const newSize = size * scaleFactor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Auto-update responsive helpers with cross-platform optimization
export const getResponsiveFontSize = (baseSize: number): number => {
  if (isSmallDevice) return baseSize * 0.9;
  if (isMediumDevice) return baseSize;
  if (isLargeDevice) return baseSize * 1.1;
  if (isTablet) return baseSize * 1.3;
  return baseSize;
};

export const getResponsivePadding = (basePadding: number): number => {
  if (isSmallDevice) return basePadding * 0.8;
  if (isMediumDevice) return basePadding;
  if (isLargeDevice) return basePadding * 1.1;
  if (isTablet) return basePadding * 1.5;
  return basePadding;
};

export const getResponsiveMargin = (baseMargin: number): number => {
  if (isSmallDevice) return baseMargin * 0.8;
  if (isMediumDevice) return baseMargin;
  if (isLargeDevice) return baseMargin * 1.1;
  if (isTablet) return baseMargin * 1.5;
  return baseMargin;
};

// Layout helpers for better screen fitting across platforms
export const getCardWidth = (columns = 1, gap = 16): number => {
  const totalGap = gap * (columns - 1);
  const availableWidth = width - (getResponsivePadding(20) * 2) - totalGap;
  return availableWidth / columns;
};

export const getGridColumns = (): number => {
  if (isTablet) return 3;
  if (isLargeDevice) return 2;
  return 1;
};

// Cross-platform spacing utilities
export const getPlatformSpacing = (baseSpacing: number): number => {
  return isAndroid ? baseSpacing * 1.1 : baseSpacing; // Slightly more spacing on Android
};

export const getPlatformFontSize = (baseSize: number): number => {
  return isAndroid ? baseSize * 1.05 : baseSize; // Slightly larger fonts on Android
};

// Enhanced responsive style helper with cross-platform capabilities
export const responsiveStyle = (base: any, options: {
  autoUpdate?: boolean;
  screenSpecific?: boolean;
  orientationAware?: boolean;
  crossPlatform?: boolean;
} = {}) => {
  const { autoUpdate = true, screenSpecific = false, orientationAware = false, crossPlatform = true } = options;
  
  const style: any = {};
  Object.keys(base).forEach(key => {
    let value = base[key];
    
    // Auto-update responsive scaling
    if (autoUpdate) {
      if (key.toLowerCase().includes('font')) {
        value = getResponsiveFontSize(value);
        if (crossPlatform) {
          value = getPlatformFontSize(value);
        }
      } else if (key.toLowerCase().includes('padding')) {
        value = getResponsivePadding(value);
        if (crossPlatform) {
          value = getPlatformSpacing(value);
        }
      } else if (key.toLowerCase().includes('margin')) {
        value = getResponsiveMargin(value);
        if (crossPlatform) {
          value = getPlatformSpacing(value);
        }
      } else if (key.toLowerCase().includes('radius')) {
        value = scale(value);
      } else if (key.toLowerCase().includes('width') || key.toLowerCase().includes('height')) {
        value = scale(value);
      }
    }
    
    // Screen-specific adjustments
    if (screenSpecific) {
      if (isSmallDevice && value > 20) {
        value = value * 0.9;
      } else if (isTablet && value < 100) {
        value = value * 1.2;
      }
    }
    
    // Orientation-aware adjustments
    if (orientationAware && isLandscape) {
      if (key.toLowerCase().includes('height')) {
        value = value * 0.8;
      }
    }
    
    style[key] = value;
  });
  
  return style;
};

// Auto-update layout system with cross-platform support
export const createAutoUpdateLayout = (baseLayout: any) => {
  return {
    ...baseLayout,
    // Auto-adjust for different screen sizes
    container: {
      ...baseLayout.container,
      paddingHorizontal: getResponsivePadding(20),
      paddingVertical: getResponsivePadding(10),
    },
    // Auto-scale text elements
    text: {
      ...baseLayout.text,
      fontSize: getResponsiveFontSize(baseLayout.text?.fontSize || 16),
    },
    // Auto-adjust spacing
    spacing: {
      ...baseLayout.spacing,
      marginVertical: getResponsiveMargin(baseLayout.spacing?.marginVertical || 10),
    }
  };
};

// Dynamic layout listener for orientation changes
export const addLayoutListener = (callback: (dimensions: ScaledSize) => void) => {
  return Dimensions.addEventListener('change', ({ window }) => {
    callback(window);
  });
};

// Export screen dimensions for easy access
export const screenDimensions = {
  width,
  height,
  isAndroid,
  isIOS,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  isPortrait,
  isLandscape,
  safeArea: getSafeAreaInsets(),
}; 