import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const STORAGE_KEY = 'merchant_secret_key';
const MERCHANT_KEY = 'merchant_data';

export interface MerchantData {
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

  const login = useCallback(async (key: string) => {
    try {
      // Verify key by fetching profile
      const profile = await api.get<any>('/api/merchant/profile', { token: key });

      const merchant: MerchantData = {
        businessName: profile.businessName,
        email: profile.email,
        testMode: profile.testMode
      };

      localStorage.setItem(STORAGE_KEY, key);
      localStorage.setItem(MERCHANT_KEY, JSON.stringify(merchant));

      setSecretKey(key);
      setMerchantData(merchant);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid API Key');
      return false;
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
