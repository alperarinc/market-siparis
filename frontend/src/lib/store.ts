import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  phone: string;
  fullName: string | null;
  role: string;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stockQuantity: number;
  imageUrl?: string;
  unit: string;
}

interface AppStore {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;

  // Cart
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => boolean;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, isAuthenticated: false, cartItems: [], cartCount: 0 }),

      // Cart
      cartItems: [],
      cartCount: 0,
      addToCart: (item) => {
        const state = get();
        const existing = state.cartItems.find((i) => i.productId === item.productId);
        const currentQty = existing ? existing.quantity : 0;
        const newQty = currentQty + item.quantity;

        if (newQty > item.stockQuantity) {
          return false; // stok yetersiz
        }

        if (existing) {
          const updated = state.cartItems.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: newQty, stockQuantity: item.stockQuantity }
              : i
          );
          set({ cartItems: updated, cartCount: updated.reduce((s, i) => s + i.quantity, 0) });
        } else {
          const items = [...state.cartItems, item];
          set({ cartItems: items, cartCount: items.reduce((s, i) => s + i.quantity, 0) });
        }
        return true;
      },
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const items = state.cartItems.filter((i) => i.productId !== productId);
            return { cartItems: items, cartCount: items.reduce((s, i) => s + i.quantity, 0) };
          }
          const item = state.cartItems.find((i) => i.productId === productId);
          if (item && quantity > item.stockQuantity) {
            return state; // stok asilmaz
          }
          const items = state.cartItems.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          );
          return { cartItems: items, cartCount: items.reduce((s, i) => s + i.quantity, 0) };
        }),
      removeFromCart: (productId) =>
        set((state) => {
          const items = state.cartItems.filter((i) => i.productId !== productId);
          return { cartItems: items, cartCount: items.reduce((s, i) => s + i.quantity, 0) };
        }),
      clearCart: () => set({ cartItems: [], cartCount: 0 }),
      getCartTotal: () =>
        get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'market-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cartItems: state.cartItems,
        cartCount: state.cartCount,
      }),
    }
  )
);
