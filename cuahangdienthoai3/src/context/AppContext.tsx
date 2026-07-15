import React, { createContext, useContext, useState, useEffect } from 'react';
import { phonesData } from '../data/phones';
import type { Phone } from '../data/phones';

export interface CartItem {
  phone: Phone;
  selectedColor: { name: string; hex: string; image: string };
  selectedStorage: { size: string; priceOffset: number };
  quantity: number;
}

export interface AuthUser {
  id?: number;
  username: string;
  fullName: string;
  role: string; // "USER" | "ADMIN"
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  purchasedPhoneIds?: string[];
}

export interface ToastInfo {
  show: boolean;
  message: string;
  phoneName: string;
  phoneImage: string;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  cart: CartItem[];
  addToCart: (
    phone: Phone,
    color: { name: string; hex: string; image: string },
    storage: { size: string; priceOffset: number },
    quantity?: number
  ) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (phoneId: string) => void;
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  updateUserProfile: (updatedData: Partial<AuthUser>) => void;
  recordUserPurchase: (phoneIds: string[]) => void;
  products: Phone[];
  setProducts: React.Dispatch<React.SetStateAction<Phone[]>>;
  loadingProducts: boolean;
  toast: ToastInfo | null;
  setToast: React.Dispatch<React.SetStateAction<ToastInfo | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial theme (prefer dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'dark';
  });

  // Load initial cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load initial wishlist
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load initial user session
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [products, setProducts] = useState<Phone[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/phones');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.length > 0 ? data : phonesData);
        } else {
          setProducts(phonesData);
        }
      } catch (error) {
        console.error('Failed to fetch products from backend, using fallback data:', error);
        setProducts(phonesData);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Update HTML body theme class
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load cart when user session changes
  useEffect(() => {
    const key = user ? `cart_${user.username}` : 'cart_guest';
    const savedCart = localStorage.getItem(key);
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, [user]);

  // Sync cart to localStorage under user-scoped key
  useEffect(() => {
    const key = user ? `cart_${user.username}` : 'cart_guest';
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user]);

  // Load wishlist when user session changes
  useEffect(() => {
    const key = user ? `wishlist_${user.username}` : 'wishlist_guest';
    const savedWish = localStorage.getItem(key);
    setWishlist(savedWish ? JSON.parse(savedWish) : []);
  }, [user]);

  // Sync wishlist to localStorage under user-scoped key
  useEffect(() => {
    const key = user ? `wishlist_${user.username}` : 'wishlist_guest';
    localStorage.setItem(key, JSON.stringify(wishlist));
  }, [wishlist, user]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const addToCart = (
    phone: Phone,
    color: { name: string; hex: string; image: string },
    storage: { size: string; priceOffset: number },
    quantity = 1
  ) => {
    setCart(prevCart => {
      // Check if item with same configuration already exists
      const existingItemIndex = prevCart.findIndex(
        item =>
          item.phone.id === phone.id &&
          item.selectedColor.name === color.name &&
          item.selectedStorage.size === storage.size
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { phone, selectedColor: color, selectedStorage: storage, quantity }];
      }
    });
    setToast({
      show: true,
      message: 'Đã thêm vào giỏ hàng thành công!',
      phoneName: phone.name,
      phoneImage: color.image || phone.image
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prevCart => {
      const newCart = [...prevCart];
      newCart[index].quantity = quantity;
      return newCart;
    });
  };

  const clearCart = () => {
    const key = user ? `cart_${user.username}` : 'cart_guest';
    localStorage.setItem(key, JSON.stringify([]));
    setCart([]);
  };

  const toggleWishlist = (phoneId: string) => {
    setWishlist(prev => {
      if (prev.includes(phoneId)) {
        return prev.filter(id => id !== phoneId);
      } else {
        return [...prev, phoneId];
      }
    });
  };

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserProfile = (updatedData: Partial<AuthUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const recordUserPurchase = (phoneIds: string[]) => {
    if (!user) return;
    const currentPurchases = user.purchasedPhoneIds || [];
    const updatedUser = { 
      ...user, 
      purchasedPhoneIds: [...currentPurchases, ...phoneIds] 
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        user,
        login,
        logout,
        updateUserProfile,
        recordUserPurchase,
        products,
        setProducts,
        loadingProducts,
        toast,
        setToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
