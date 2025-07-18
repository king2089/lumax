import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScaledSize,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  screenDimensions,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveFontSize,
  addLayoutListener,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  getSafeAreaInsets,
} from '../utils/responsive';

interface ScreenFitterProps {
  children: React.ReactNode;
  style?: any;
  autoFit?: boolean;
  orientationAware?: boolean;
  safeArea?: boolean;
  padding?: number;
  margin?: number;
  maxWidth?: number;
  minHeight?: number;
  cardStyle?: boolean;
  listStyle?: boolean;
  modalStyle?: boolean;
}

const ScreenFitter: React.FC<ScreenFitterProps> = ({
  children,
  style,
  autoFit = true,
  orientationAware = true,
  safeArea = true,
  padding = 20,
  margin = 0,
  maxWidth,
  minHeight,
  cardStyle = false,
  listStyle = false,
  modalStyle = false,
}) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    dimensions.height > dimensions.width ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const subscription = addLayoutListener(({ width, height }: ScaledSize) => {
      setDimensions({ width, height });
      setOrientation(height > width ? 'portrait' : 'landscape');
    });

    return () => subscription?.remove();
  }, []);

  const getResponsiveStyle = () => {
    const baseStyle: any = {
      flex: 1,
    };

    if (autoFit) {
      // Auto-fit responsive adjustments
      if (cardStyle) {
        baseStyle.padding = getResponsivePadding(padding);
        baseStyle.margin = getResponsiveMargin(margin);
        baseStyle.borderRadius = getResponsiveFontSize(12);
        baseStyle.shadowColor = '#000';
        baseStyle.shadowOffset = { width: 0, height: 2 };
        baseStyle.shadowOpacity = 0.1;
        baseStyle.shadowRadius = 4;
        baseStyle.elevation = 3;
      }

      if (listStyle) {
        baseStyle.paddingHorizontal = getResponsivePadding(padding);
        baseStyle.paddingVertical = getResponsivePadding(padding / 2);
      }

      if (modalStyle) {
        baseStyle.margin = getResponsiveMargin(20);
        baseStyle.borderRadius = getResponsiveFontSize(16);
        baseStyle.maxHeight = '90%';
      }

      // Screen-specific adjustments
      if (isSmallDevice) {
        baseStyle.paddingHorizontal = getResponsivePadding(padding * 0.8);
        baseStyle.paddingVertical = getResponsivePadding(padding * 0.6);
      } else if (isTablet) {
        baseStyle.paddingHorizontal = getResponsivePadding(padding * 1.5);
        baseStyle.paddingVertical = getResponsivePadding(padding * 1.2);
        if (maxWidth) {
          baseStyle.maxWidth = maxWidth;
          baseStyle.alignSelf = 'center';
        }
      }

      // Orientation-aware adjustments
      if (orientationAware && orientation === 'landscape') {
        baseStyle.paddingHorizontal = getResponsivePadding(padding * 1.5);
        baseStyle.paddingVertical = getResponsivePadding(padding * 0.8);
      }
    }

    // Safe area adjustments
    if (safeArea) {
      const safeAreaInsets = getSafeAreaInsets();
      baseStyle.paddingTop = safeAreaInsets.top;
      baseStyle.paddingBottom = safeAreaInsets.bottom;
    }

    // Custom dimensions
    if (maxWidth) {
      baseStyle.maxWidth = maxWidth;
    }

    if (minHeight) {
      baseStyle.minHeight = minHeight;
    }

    return [baseStyle, style];
  };

  const [baseStyle, customStyle] = getResponsiveStyle();

  return (
    <View style={[baseStyle, customStyle]}>
      {children}
    </View>
  );
};

// Responsive container components for common use cases
export const ResponsiveContainer: React.FC<ScreenFitterProps> = (props) => (
  <ScreenFitter {...props} autoFit={true} safeArea={true} />
);

export const ResponsiveCard: React.FC<ScreenFitterProps> = (props) => (
  <ScreenFitter {...props} cardStyle={true} autoFit={true} />
);

export const ResponsiveList: React.FC<ScreenFitterProps> = (props) => (
  <ScreenFitter {...props} listStyle={true} autoFit={true} />
);

export const ResponsiveModal: React.FC<ScreenFitterProps> = (props) => (
  <ScreenFitter {...props} modalStyle={true} autoFit={true} />
);

export const SmallScreenContainer: React.FC<ScreenFitterProps> = (props) => (
  <ScreenFitter {...props} padding={16} margin={8} autoFit={true} />
);

export const TabletContainer: React.FC<ScreenFitterProps> = (props) => (
  <ScreenFitter {...props} padding={32} margin={16} maxWidth={600} autoFit={true} />
);

export default ScreenFitter; 