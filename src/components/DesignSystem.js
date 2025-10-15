import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
  small: 375,
  medium: 414,
  large: 768,
};

const isSmallDevice = SCREEN_WIDTH < BREAKPOINTS.medium;
const isMediumDevice = SCREEN_WIDTH >= BREAKPOINTS.medium && SCREEN_WIDTH < BREAKPOINTS.large;
const isLargeDevice = SCREEN_WIDTH >= BREAKPOINTS.large;

// Typography System
export const TYPOGRAPHY = {
  // Heading sizes
  h1: moderateScale(isSmallDevice ? 24 : 28, 0.3),
  h2: moderateScale(isSmallDevice ? 20 : 22, 0.3),
  h3: moderateScale(isSmallDevice ? 18 : 20, 0.3),
  h4: moderateScale(16, 0.3),
  
  // Body text
  body: moderateScale(15, 0.3),
  bodySmall: moderateScale(14, 0.3),
  
  // UI elements
  button: moderateScale(16, 0.3),
  caption: moderateScale(13, 0.3),
  tiny: moderateScale(11, 0.3),
  
  // Input text
  input: moderateScale(15, 0.3),
};

// Font weights
export const FONT_WEIGHTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// Spacing System (8-point grid)
export const SPACING = {
  xxs: scale(4),
  xs: scale(8),
  sm: scale(12),
  md: scale(16),
  lg: scale(20),
  xl: scale(24),
  xxl: scale(32),
  xxxl: scale(40),
};

// Vertical Spacing
export const VERTICAL_SPACING = {
  xxs: verticalScale(4),
  xs: verticalScale(8),
  sm: verticalScale(12),
  md: verticalScale(16),
  lg: verticalScale(20),
  xl: verticalScale(24),
  xxl: verticalScale(32),
  xxxl: verticalScale(40),
};

// Border Radius
export const RADIUS = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  full: moderateScale(999),
};

// Icon Sizes
export const ICON_SIZES = {
  xs: scale(16),
  sm: scale(20),
  md: scale(24),
  lg: scale(28),
  xl: scale(32),
  xxl: scale(40),
};

// Avatar Sizes
export const AVATAR_SIZES = {
  xs: scale(32),
  sm: scale(40),
  md: scale(60),
  lg: scale(80),
  xl: scale(100),
  xxl: scale(120),
};

// Colors
export const COLORS = {
  // Primary
  primary: '#667eea',
  primaryLight: '#8b9ef5',
  primaryDark: '#5368d4',
  
  // Secondary
  secondary: '#764ba2',
  secondaryLight: '#9b6fc7',
  secondaryDark: '#5e3c82',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Backgrounds
  background: '#F0F4FF',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Shadows (elevation system)
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(2),
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
};

// Input heights
export const INPUT_HEIGHTS = {
  sm: verticalScale(40),
  md: verticalScale(48),
  lg: verticalScale(56),
};

// Button heights
export const BUTTON_HEIGHTS = {
  sm: verticalScale(36),
  md: verticalScale(44),
  lg: verticalScale(52),
};

// Container padding
export const CONTAINER_PADDING = {
  horizontal: SPACING.md,
  vertical: VERTICAL_SPACING.md,
};

// Header height
export const HEADER_HEIGHT = Platform.OS === 'ios' 
  ? verticalScale(90) 
  : verticalScale(70);

// Safe Area padding
export const SAFE_AREA_PADDING = {
  top: Platform.OS === 'ios' ? verticalScale(44) : verticalScale(0),
  bottom: Platform.OS === 'ios' ? verticalScale(34) : verticalScale(0),
};

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Common component styles
export const COMMON_STYLES = {
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: INPUT_HEIGHTS.md,
    fontSize: TYPOGRAPHY.input,
    color: COLORS.gray900,
  },
  button: {
    height: BUTTON_HEIGHTS.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenPadding: {
    paddingHorizontal: CONTAINER_PADDING.horizontal,
  },
};

// Gradient configurations
export const GRADIENTS = {
  primary: ['#667eea', '#764ba2'],
  primaryLight: ['#8b9ef5', '#9b6fc7'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  info: ['#3B82F6', '#2563EB'],
  background: ['#F8F9FA', '#E5E7EB'],
};

export default {
  TYPOGRAPHY,
  FONT_WEIGHTS,
  SPACING,
  VERTICAL_SPACING,
  RADIUS,
  ICON_SIZES,
  AVATAR_SIZES,
  COLORS,
  SHADOWS,
  INPUT_HEIGHTS,
  BUTTON_HEIGHTS,
  CONTAINER_PADDING,
  HEADER_HEIGHT,
  SAFE_AREA_PADDING,
  ANIMATION,
  COMMON_STYLES,
  GRADIENTS,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
};