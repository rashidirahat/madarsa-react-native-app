import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastItem extends Required<ToastOptions> {
  id: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

function toastColors(type: ToastType, colors: ReturnType<typeof useTheme>['colors']) {
  switch (type) {
    case 'success':
      return { bg: colors.successSoft, fg: colors.success };
    case 'error':
      return { bg: colors.dangerSoft, fg: colors.danger };
    default:
      return { bg: colors.surfaceElevated, fg: colors.textPrimary };
  }
}

function ToastCard({ toast, onHide }: { toast: ToastItem; onHide: () => void }) {
  const { colors } = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-12));
  const { bg, fg } = toastColors(toast.type, colors);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(onHide, toast.duration);
    return () => clearTimeout(timer);
  }, [opacity, translateY, toast.duration, onHide]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: bg,
          opacity,
          transform: [{ translateY }],
          borderColor: fg,
        },
      ]}
    >
      <Text style={[styles.message, { color: fg }]} numberOfLines={3}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++;
    setToasts((prev) => [...prev.slice(-2), { id, message, type, duration: 3500 }]);
  }, []);

  const value = useCallback(
    (): ToastContextValue => ({
      showToast,
      success: (message: string) => showToast(message, 'success'),
      error: (message: string) => showToast(message, 'error'),
      info: (message: string) => showToast(message, 'info'),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value()}>
      {children}
      <View pointerEvents="none" style={[styles.overlay, { top: insets.top + 8 }]}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onHide={() => hideToast(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    gap: 8,
  },
  toast: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
});

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
