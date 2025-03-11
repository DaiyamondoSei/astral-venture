
/**
 * Device Information Types
 * 
 * This module defines types related to device information used for
 * performance monitoring and analytics.
 */

/**
 * Device categories
 */
export enum DeviceCategory {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  TV = 'tv',
  WEARABLE = 'wearable',
  UNKNOWN = 'unknown'
}

/**
 * Connection types
 */
export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  BLUETOOTH = 'bluetooth',
  UNKNOWN = 'unknown'
}

/**
 * Network effective type categories
 */
export enum NetworkEffectiveType {
  SLOW_2G = 'slow-2g',
  _2G = '2g',
  _3G = '3g',
  _4G = '4g'
}

/**
 * Device capabilities
 */
export enum DeviceCapability {
  TOUCH = 'touch',
  MOUSE = 'mouse',
  KEYBOARD = 'keyboard',
  GAMEPAD = 'gamepad',
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  ACCELEROMETER = 'accelerometer',
  GEOLOCATION = 'geolocation'
}

/**
 * Device connection information
 */
export interface DeviceConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: ConnectionType;
}

/**
 * Device memory information
 */
export interface DeviceMemory {
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
  deviceMemory?: number;
}

/**
 * Device screen information
 */
export interface DeviceScreen {
  width: number;
  height: number;
  orientation?: 'portrait' | 'landscape';
  colorDepth?: number;
  pixelDepth?: number;
  devicePixelRatio: number;
}

/**
 * Browser information
 */
export interface BrowserInfo {
  name?: string;
  version?: string;
  engine?: string;
  userAgent: string;
  language?: string;
  darkMode?: boolean;
}

/**
 * Operating system information
 */
export interface OSInfo {
  name?: string;
  version?: string;
  platform?: string;
}

/**
 * Hardware information
 */
export interface HardwareInfo {
  cpu?: {
    cores?: number;
    architecture?: string;
  };
  gpu?: {
    vendor?: string;
    model?: string;
  };
}

/**
 * Complete device information structure
 */
export interface DeviceInfo {
  userAgent?: string;
  deviceCategory?: DeviceCategory | string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  connection?: DeviceConnection;
  memory?: DeviceMemory;
  screen?: DeviceScreen;
  browser?: BrowserInfo;
  os?: OSInfo;
  hardware?: HardwareInfo;
  capabilities?: DeviceCapability[];
}

/**
 * Device detection result
 */
export interface DeviceDetectionResult {
  deviceInfo: DeviceInfo;
  capabilities: DeviceCapability[];
  performance: {
    tier?: number;
    score?: number;
    category?: 'low' | 'medium' | 'high';
  };
}

/**
 * Type guard for DeviceInfo
 */
export function isDeviceInfo(obj: unknown): obj is DeviceInfo {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const info = obj as Partial<DeviceInfo>;
  // Basic validation - at minimum we need a user agent
  return typeof info.userAgent === 'string';
}

/**
 * Type guard for DeviceScreen
 */
export function isDeviceScreen(obj: unknown): obj is DeviceScreen {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const screen = obj as Partial<DeviceScreen>;
  return (
    typeof screen.width === 'number' &&
    typeof screen.height === 'number' &&
    typeof screen.devicePixelRatio === 'number'
  );
}

/**
 * Type guard for BrowserInfo
 */
export function isBrowserInfo(obj: unknown): obj is BrowserInfo {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const browser = obj as Partial<BrowserInfo>;
  return typeof browser.userAgent === 'string';
}
