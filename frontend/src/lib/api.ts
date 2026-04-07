const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    // 401 veya 403 — session süresi dolmuş veya yetki yok, auto-logout
    if ((res.status === 401 || res.status === 403) && !endpoint.includes('/auth/')) {
      const { useStore } = await import('@/lib/store');
      useStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        const isAdminPage = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminPage ? '/admin/login' : '/login';
      }
      throw new Error(res.status === 403 ? 'Yetkiniz yok. Lütfen tekrar giriş yapın.' : 'Oturum süresi doldu. Lütfen tekrar giriş yapın.');
    }

    const error = await res.json().catch(() => ({ message: 'Bir hata oluştu' }));
    throw new Error(error.message || 'Bir hata oluştu');
  }

  return res.json();
}

// Auth
export const sendOtp = (phone: string) =>
  fetchApi('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });

export const verifyOtp = (phone: string, otp: string) =>
  fetchApi<{ accessToken: string; refreshToken: string; user: any }>('/auth/verify-otp', {
    method: 'POST', body: JSON.stringify({ phone, otp })
  });

export const register = (data: { phone: string; otp: string; fullName: string; fullAddress: string; district: string }) =>
  fetchApi<{ accessToken: string; refreshToken: string; user: any }>('/auth/register', {
    method: 'POST', body: JSON.stringify(data)
  });

export const getCurrentUser = () =>
  fetchApi<any>('/auth/me');

export const refreshToken = () =>
  fetchApi<{ accessToken: string; refreshToken: string; user: any }>('/auth/refresh', { method: 'POST' });

export const logout = () =>
  fetchApi('/auth/logout', { method: 'POST' });

// Ürünler
export const getProducts = (page = 0, size = 20) =>
  fetchApi<any>(`/products?page=${page}&size=${size}`);

export const getProductsByCategory = (categoryId: number, page = 0) =>
  fetchApi<any>(`/products/category/${categoryId}?page=${page}&size=20`);

export const getProductBySlug = (slug: string) =>
  fetchApi<any>(`/products/${slug}`);

export const getFeaturedProducts = () =>
  fetchApi<any[]>('/products/featured');

export const searchProducts = (query: string, page = 0) =>
  fetchApi<any>(`/products/search?q=${encodeURIComponent(query)}&page=${page}&size=20`);

// Kategoriler
export const getCategories = () =>
  fetchApi<any[]>('/categories');

// Sepet
export const getCart = () =>
  fetchApi<Record<string, number>>('/cart');

export const addToCart = (productId: number, quantity = 1) =>
  fetchApi('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity: quantity.toString() }) });

export const updateCartItem = (productId: number, quantity: number) =>
  fetchApi(`/cart/${productId}?quantity=${quantity}`, { method: 'PUT' });

export const removeFromCart = (productId: number) =>
  fetchApi(`/cart/${productId}`, { method: 'DELETE' });

export const clearCart = () =>
  fetchApi('/cart', { method: 'DELETE' });

// Siparişler
export const createOrder = (data: { addressId: number; paymentMethod: string; note?: string }) =>
  fetchApi<any>('/orders', { method: 'POST', body: JSON.stringify(data) });

export const getMyOrders = (page = 0) =>
  fetchApi<any>(`/orders?page=${page}&size=10`);

export const getOrderByNumber = (orderNumber: string) =>
  fetchApi<any>(`/orders/${orderNumber}`);

export const cancelOrder = (orderId: number) =>
  fetchApi<any>(`/orders/${orderId}/cancel`, { method: 'POST' });

// Admin
export const getAdminDashboard = () =>
  fetchApi<any>('/admin/dashboard');

export const getAllOrders = (page = 0) =>
  fetchApi<any>(`/admin/orders?page=${page}&size=20`);

export const updateOrderStatus = (orderId: number, status: string) =>
  fetchApi<any>(`/admin/orders/${orderId}/status?status=${status}`, { method: 'PATCH' });

// Admin - Ürünler
export const getAdminProducts = () =>
  fetchApi<any[]>('/admin/products');

export const updateProductStock = (productId: number, quantity: number) =>
  fetchApi<any>(`/admin/products/${productId}/stock?quantity=${quantity}`, { method: 'PATCH' });

export const updateProductExpiry = (productId: number, date: string) =>
  fetchApi<any>(`/admin/products/${productId}/expiry?date=${date}`, { method: 'PATCH' });

export const createProduct = (data: any) =>
  fetchApi<any>('/admin/products', { method: 'POST', body: JSON.stringify(data) });

export const updateProduct = (id: number, data: any) =>
  fetchApi<any>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProduct = (id: number) =>
  fetchApi<any>(`/admin/products/${id}`, { method: 'DELETE' });

// Admin - Kategoriler
export const getAdminCategories = () =>
  fetchApi<any[]>('/admin/categories');

export const createCategory = (data: { name: string; description?: string; icon?: string; sortOrder?: number; parentId?: number }) =>
  fetchApi<any>('/admin/categories', { method: 'POST', body: JSON.stringify(data) });

export const updateCategory = (id: number, data: { name?: string; description?: string; icon?: string; sortOrder?: number; active?: boolean }) =>
  fetchApi<any>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCategory = (id: number) =>
  fetchApi<any>(`/admin/categories/${id}`, { method: 'DELETE' });

// Admin - Bannerlar
export const getAdminBanners = () =>
  fetchApi<any[]>('/admin/banners');

export const createBanner = (data: { title: string; imageUrl: string; linkUrl?: string; type: string; sortOrder?: number }) =>
  fetchApi<any>('/admin/banners', { method: 'POST', body: JSON.stringify(data) });

export const updateBanner = (id: number, data: { title: string; imageUrl: string; linkUrl?: string; type: string; sortOrder?: number }) =>
  fetchApi<any>(`/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const toggleBanner = (id: number) =>
  fetchApi<any>(`/admin/banners/${id}/toggle`, { method: 'PATCH' });

export const deleteBanner = (id: number) =>
  fetchApi<any>(`/admin/banners/${id}`, { method: 'DELETE' });

// Admin - Sayfalar
export const getAdminPages = () =>
  fetchApi<any[]>('/admin/pages');

export const updatePage = (id: number, data: { title?: string; content?: string; active?: boolean }) =>
  fetchApi<any>(`/admin/pages/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Admin - Site Ayarları
export const getAdminSettings = () =>
  fetchApi<any[]>('/admin/settings');

export const updateSettings = (data: Record<string, string>) =>
  fetchApi<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) });

// Site Ayarlari
export const getSettings = () =>
  fetchApi<Record<string, string>>('/settings');

// Bannerlar
export const getHeroBanners = () =>
  fetchApi<any[]>('/banners/hero');

export const getPromoBanners = () =>
  fetchApi<any[]>('/banners/promo');

// Sayfalar
export const getPages = () =>
  fetchApi<any[]>('/pages');

export const getPageBySlug = (slug: string) =>
  fetchApi<any>(`/pages/${slug}`);

// Adresler
export const getAddresses = () =>
  fetchApi<any[]>('/addresses');

export const addAddress = (data: {
  title: string;
  fullAddress: string;
  district?: string;
  city?: string;
  buildingNo?: string;
  floorNo?: string;
  doorNo?: string;
  directions?: string;
  isDefault?: boolean;
}) =>
  fetchApi<any>('/addresses', { method: 'POST', body: JSON.stringify(data) });

// Profil
export const updateProfile = (data: { fullName: string; email?: string }) =>
  fetchApi<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
