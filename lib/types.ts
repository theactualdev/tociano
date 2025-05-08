// User related types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: any;
}

export interface UserData extends User {
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

// Cart types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  tags?: string[];
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  featured?: boolean;
  createdAt?: any;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentReference: string;
  shipping: {
    method: string;
    cost: number;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: any;
}

// Site settings types
export interface SiteSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  supportPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    [key: string]: string;
  };
  shippingRates: {
    standard: number;
    express: number;
    [key: string]: number;
  };
  paymentOptions: {
    paystack: boolean;
    payOnDelivery: boolean;
    [key: string]: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    [key: string]: boolean | string;
  };
  termsUrl: string;
  privacyUrl: string;
  lastUpdated?: any;
  [key: string]: any; // Allow dynamic access with string index
} 