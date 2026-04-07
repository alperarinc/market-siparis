'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getCurrentUser, refreshToken } from '@/lib/api';

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 dakikada bir kontrol
const TOKEN_REFRESH_INTERVAL = 12 * 60 * 1000; // 12 dakikada bir refresh (15dk token suresi)

export default function AuthProvider() {
  const { setUser, isAuthenticated, clearAuth } = useStore();
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ilk yukleme — session gecerli mi kontrol
  useEffect(() => {
    if (isAuthenticated) {
      verifySession();
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth durumu degisince timer'lari baslat/durdur
  useEffect(() => {
    if (isAuthenticated) {
      startTimers();
    } else {
      stopTimers();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifySession = async () => {
    try {
      const res = await getCurrentUser();
      if (res.data) {
        setUser(res.data);
      } else {
        handleSessionExpired();
      }
    } catch {
      // Token suresi dolmus — refresh dene
      try {
        const refreshRes = await refreshToken();
        if (refreshRes.data?.user) {
          setUser(refreshRes.data.user);
        } else {
          handleSessionExpired();
        }
      } catch {
        handleSessionExpired();
      }
    }
  };

  const startTimers = () => {
    stopTimers();

    // Token refresh — suresi dolmadan once yenile
    refreshTimerRef.current = setInterval(async () => {
      try {
        const res = await refreshToken();
        if (res.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        handleSessionExpired();
      }
    }, TOKEN_REFRESH_INTERVAL);

    // Session kontrol — kullanici hala aktif mi
    checkTimerRef.current = setInterval(async () => {
      try {
        const res = await getCurrentUser();
        if (!res.data) {
          handleSessionExpired();
        }
      } catch {
        // Sessizce refresh dene
        try {
          await refreshToken();
        } catch {
          handleSessionExpired();
        }
      }
    }, SESSION_CHECK_INTERVAL);
  };

  const stopTimers = () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (checkTimerRef.current) {
      clearInterval(checkTimerRef.current);
      checkTimerRef.current = null;
    }
  };

  const handleSessionExpired = () => {
    stopTimers();
    clearAuth();
  };

  return null;
}
