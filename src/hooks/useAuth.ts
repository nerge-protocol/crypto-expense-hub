import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'merchant_secret_key';
const MERCHANT_KEY = 'merchant_data';

interface MerchantData {
  businessName: string;
  email: string;
  testMode: boolean;
}

export function useAuth() {
  const [secretKey, setSecretKey] = useState<string | null>(() => 
    localStorage.getItem(STORAGE_KEY)
  );
  const [merchantData, setMerchantData] = useState<MerchantData | null>(() => {
    const stored = localStorage.getItem(MERCHANT_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((key: string, merchant?: MerchantData) => {
    localStorage.setItem(STORAGE_KEY, key);
    setSecretKey(key);
    
    if (merchant) {
      localStorage.setItem(MERCHANT_KEY, JSON.stringify(merchant));
      setMerchantData(merchant);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MERCHANT_KEY);
    setSecretKey(null);
    setMerchantData(null);
  }, []);

  const isAuthenticated = !!secretKey;

  return { 
    secretKey, 
    merchantData,
    login, 
    logout, 
    isAuthenticated 
  };
}
