export type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive';

export interface CloudProviderConfig {
  name: string;
  icon: string; // lucide-react icon name
  authUrl: string;
  color: string;
  enabled: boolean;
}

export const CLOUD_PROVIDERS: Record<CloudProvider, CloudProviderConfig> = {
  'google-drive': {
    name: 'Google Drive',
    icon: 'HardDrive',
    authUrl: '/api/cloud/google-drive/auth',
    color: '#4285F4',
    enabled: true,
  },
  'dropbox': {
    name: 'Dropbox',
    icon: 'Box',
    authUrl: '/api/cloud/dropbox/auth',
    color: '#0061FF',
    enabled: true,
  },
  'onedrive': {
    name: 'OneDrive',
    icon: 'Cloud',
    authUrl: '/api/cloud/onedrive/auth',
    color: '#0078D4',
    enabled: false, // Disabled
  },
};

export interface CloudFile {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  modifiedTime?: string;
  webViewLink?: string;
  downloadUrl?: string;
}

export interface CloudAuthToken {
  provider: CloudProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  userId: string;
}

// Plan-based limits for cloud operations
export const CLOUD_LIMITS = {
  free: {
    canImport: false,
    canExport: false,
    maxImportSize: 0,
  },
  plus: {
    canImport: true,
    canExport: true,
    maxImportSize: 500 * 1000 * 1000, // 500MB
  },
  pro: {
    canImport: true,
    canExport: true,
    maxImportSize: 5 * 1000 * 1000 * 1000, // 5GB
  },
  guest: {
    canImport: false,
    canExport: false,
    maxImportSize: 0,
  },
};

export type CloudPlanType = keyof typeof CLOUD_LIMITS;

// Helper to check if user can use cloud features
export function canUseCloudFeature(planName: string, feature: 'import' | 'export'): boolean {
  const plan = CLOUD_LIMITS[planName as CloudPlanType];
  if (!plan) return false;
  
  return feature === 'import' ? plan.canImport : plan.canExport;
}
