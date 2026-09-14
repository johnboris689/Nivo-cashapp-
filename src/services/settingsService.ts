// Centralized Settings & Theme Service

export interface SystemSettings {
  websiteName: string;
  websiteLogo: string;
  websiteFavicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  maintenanceMode: string;
  registrationEnabled: string;
  loginEnabled: string;
  withdrawalEnabled: string;
  transferEnabled: string;
  airtimeEnabled: string;
  dataEnabled: string;
  billsEnabled: string;
  wdvEnabled: string;
  referralEnabled: string;
  referralBonus: string;
  registrationBonus: string;
  dailyWithdrawalLimit: string;
  minWithdrawal: string;
  maxWithdrawal: string;
  withdrawalCharges: string;
  currency: string;
  timezone: string;
  country: string;
  scrollingAnnouncement: string;
  liveFeedText: string;
  welcomeMessage: string;
  dashboardBanner: string;
  noticeBarText: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  voucherPrice: string;
  paymentInstructions: string;
  paymentNotice: string;
  paymentCountdown: string;
  paymentsEnabled: string;
  whatsappNumber: string;
  whatsappLink: string;
  whatsappMessage: string;
  telegramLink: string;
  facebookLink: string;
  instagramLink: string;
  xTwitterLink: string;
  tikTokLink: string;
  youtubeLink: string;
  supportEmail: string;
  supportPhone: string;
  senderName: string;
  officeAddress: string;
  businessHours: string;
  websiteUrl: string;
  privacyPolicy: string;
  termsOfService: string;
  aboutUs: string;
  contactUs: string;
  faqContent: string;
  pinLoginEnabled: string;
  biometricLoginEnabled: string;
  passwordLoginEnabled: string;
  sessionTimeout: string;
  maxLoginAttempts: string;
  deviceRestriction: string;
  twoFactorEnabled: string;
  voucherPrefix: string;
  voucherLength: string;
  voucherValidity: string;
  videoUrl: string;
  videoEnabled: boolean | string;
  recoveryEnabled: boolean | string;
  smsRecoveryEnabled: boolean | string;
  [key: string]: any;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  websiteName: "Nevo",
  websiteLogo: "",
  websiteFavicon: "",
  primaryColor: "#0d9488",
  secondaryColor: "#4f46e5",
  accentColor: "#14b8a6",
  maintenanceMode: "false",
  registrationEnabled: "true",
  loginEnabled: "true",
  withdrawalEnabled: "true",
  transferEnabled: "true",
  airtimeEnabled: "true",
  dataEnabled: "true",
  billsEnabled: "true",
  wdvEnabled: "true",
  referralEnabled: "true",
  referralBonus: "1000",
  registrationBonus: "0",
  dailyWithdrawalLimit: "1000000",
  minWithdrawal: "1000",
  maxWithdrawal: "500000",
  withdrawalCharges: "100",
  currency: "₦",
  timezone: "Africa/Lagos",
  country: "Nigeria",
  scrollingAnnouncement: "Welcome! Fast and secure manual transactions with 24/7 support.",
  liveFeedText: "Chioma O. just purchased a WDV Voucher code • Yusuf D. withdrew ₦25,000",
  welcomeMessage: "Welcome",
  dashboardBanner: "Get started with fast manual voucher activation & seamless transfers",
  noticeBarText: "",
  bankName: "PalmPay",
  accountName: "pwamunadi ishaku",
  accountNumber: "8960723295",
  voucherPrice: "6500",
  paymentInstructions: "Copy bank details below, initiate manual transfer and upload proof.",
  paymentNotice: "",
  paymentCountdown: "900",
  paymentsEnabled: "true",
  whatsappNumber: "+2349162845073",
  whatsappLink: "https://wa.me/2349162845073",
  whatsappMessage: "Hello Admin, I have made a manual bank transfer.",
  telegramLink: "https://t.me/nevo_official",
  facebookLink: "",
  instagramLink: "",
  xTwitterLink: "",
  tikTokLink: "",
  youtubeLink: "",
  supportEmail: "support@nevo.ng",
  supportPhone: "+2349162845073",
  senderName: "Nevo",
  officeAddress: "Lagos, Nigeria",
  businessHours: "24/7 Support",
  websiteUrl: "https://nevo.ng",
  privacyPolicy: "Privacy policy details...",
  termsOfService: "Terms of service details...",
  aboutUs: "Digital financial voucher platform...",
  contactUs: "Contact support via WhatsApp or Email.",
  faqContent: "Frequently Asked Questions...",
  pinLoginEnabled: "true",
  biometricLoginEnabled: "true",
  passwordLoginEnabled: "true",
  sessionTimeout: "30",
  maxLoginAttempts: "5",
  deviceRestriction: "false",
  twoFactorEnabled: "false",
  voucherPrefix: "WDV",
  voucherLength: "10",
  voucherValidity: "30 Days",
  videoUrl: "",
  videoEnabled: true,
  recoveryEnabled: true,
  smsRecoveryEnabled: true
};

let cachedSettings: SystemSettings = { ...DEFAULT_SETTINGS };

// Load initial settings from localStorage if cached
try {
  const local = localStorage.getItem('master_system_settings');
  if (local) {
    cachedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
  }
} catch (e) {
  // ignore
}

export function hexToRgb(hex: string, defaultRgb = '13, 148, 136'): string {
  if (!hex) return defaultRgb;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return defaultRgb;
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function applyGlobalTheme(settings: SystemSettings) {
  if (!settings) return;

  const rawBrandName = settings.websiteName || DEFAULT_SETTINGS.websiteName;
  const brandName = /swiftpay/i.test(rawBrandName) ? 'Nevo' : rawBrandName;
  const primary = settings.primaryColor || DEFAULT_SETTINGS.primaryColor;
  const secondary = settings.secondaryColor || DEFAULT_SETTINGS.secondaryColor;
  const accent = settings.accentColor || DEFAULT_SETTINGS.accentColor;
  const favicon = settings.websiteFavicon || '';

  // 1. Title
  if (brandName) {
    document.title = brandName;
  }

  // 2. Favicon
  if (favicon) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = favicon;
  }

  // 3. Dynamic Theme CSS Injection
  const primaryRgb = hexToRgb(primary, '13, 148, 136');
  const secondaryRgb = hexToRgb(secondary, '79, 70, 229');
  const accentRgb = hexToRgb(accent, '20, 184, 166');

  let styleEl = document.getElementById('master-dynamic-theme') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'master-dynamic-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    :root {
      --primary-color: ${primary};
      --primary-rgb: ${primaryRgb};
      --secondary-color: ${secondary};
      --secondary-rgb: ${secondaryRgb};
      --accent-color: ${accent};
      --accent-rgb: ${accentRgb};
    }

    /* Recolor teal utility classes to match primary color */
    .bg-teal-500, .bg-teal-600, .bg-teal-400 {
      background-color: var(--primary-color) !important;
    }
    .bg-teal-500\\/10, .bg-teal-500\\/20, .bg-teal-400\\/10, .bg-teal-400\\/20 {
      background-color: rgba(var(--primary-rgb), 0.15) !important;
    }
    .bg-teal-500\\/30, .bg-teal-400\\/30 {
      background-color: rgba(var(--primary-rgb), 0.3) !important;
    }
    .text-teal-400, .text-teal-500, .text-teal-300, .text-teal-600, .text-\\[\\#2dd4bf\\] {
      color: var(--primary-color) !important;
    }
    .border-teal-500, .border-teal-400, .border-teal-500\\/30, .border-teal-500\\/20, .border-teal-500\\/50, .border-teal-400\\/30 {
      border-color: var(--primary-color) !important;
    }
    .border-teal-500\\/30, .border-teal-500\\/20, .border-teal-400\\/30 {
      border-color: rgba(var(--primary-rgb), 0.3) !important;
    }
    .ring-teal-400, .focus\\:ring-teal-400:focus, .focus\\:ring-teal-500:focus {
      --tw-ring-color: var(--primary-color) !important;
    }
    .from-teal-500, .from-teal-600, .from-teal-400, .from-teal-300 {
      --tw-gradient-from: var(--primary-color) !important;
      --tw-gradient-to: rgba(var(--primary-rgb), 0) !important;
      --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-from), var(--tw-gradient-to)) !important;
    }
    .to-teal-500, .to-teal-400, .to-teal-600, .to-teal-300, .to-\\[\\#2dd4bf\\] {
      --tw-gradient-to: var(--primary-color) !important;
    }
    .shadow-teal-500\\/20, .shadow-teal-500\\/10, .shadow-teal-500\\/30, .shadow-teal-500\\/40 {
      --tw-shadow-color: rgba(var(--primary-rgb), 0.3) !important;
    }

    #btn-center-fab {
      background: linear-gradient(135deg, var(--secondary-color), var(--primary-color)) !important;
      box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.35) !important;
    }
  `;
}

export async function fetchMasterSettings(): Promise<SystemSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        cachedSettings = { ...DEFAULT_SETTINGS, ...data.settings };
        if (/swiftpay/i.test(String(cachedSettings.websiteName || ''))) cachedSettings.websiteName = 'Nevo';
        if (/swiftpay/i.test(String(cachedSettings.senderName || ''))) cachedSettings.senderName = 'Nevo';
        localStorage.setItem('master_system_settings', JSON.stringify(cachedSettings));
        applyGlobalTheme(cachedSettings);
        return cachedSettings;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch master settings from server:', e);
  }
  applyGlobalTheme(cachedSettings);
  return cachedSettings;
}

export function getCachedSettings(): SystemSettings {
  return cachedSettings;
}

export function updateCachedSettings(newSettings: Partial<SystemSettings>) {
  cachedSettings = { ...cachedSettings, ...newSettings };
  if (/swiftpay/i.test(String(cachedSettings.websiteName || ''))) cachedSettings.websiteName = 'Nevo';
  if (/swiftpay/i.test(String(cachedSettings.senderName || ''))) cachedSettings.senderName = 'Nevo';
  localStorage.setItem('master_system_settings', JSON.stringify(cachedSettings));
  applyGlobalTheme(cachedSettings);
}
