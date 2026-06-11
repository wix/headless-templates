import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

export const MINI_CART_PORTAL_ID = 'mini-cart-portal';

interface MiniCartModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const MiniCartModalContext = createContext<
  MiniCartModalContextValue | undefined
>(undefined);

/**
 * Hook to access the mini cart modal context value.
 *
 * ⚠️ **PROVIDER REQUIREMENT**: This hook can ONLY be used within components that are wrapped by
 * the `<MiniCartContextProvider>` component. Using this hook outside of the provider will
 * result in a runtime error.
 *
 * @throws {Error} Throws an error if used outside of MiniCartContextProvider
 *
 * @example
 * ```tsx
 * // ✅ CORRECT - Component is wrapped with provider
 * function App() {
 *   return (
 *     <MiniCartContextProvider>
 *       <MyComponent /> // Can use useMiniCartContext here
 *     </MiniCartContextProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const { isOpen, open, close } = useMiniCartContext(); // ✅ Safe to use
 *   return <div>{isOpen ? 'Cart is open' : 'Cart is closed'}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // ❌ INCORRECT - Will throw runtime error
 * function MyComponent() {
 *   const { isOpen, open, close } = useMiniCartContext(); // ❌ Error: not wrapped
 *   return <div>This will fail</div>;
 * }
 * ```
 *
 * @returns {MiniCartModalContextValue} The context value containing:
 *   - `isOpen`: boolean - Whether the mini cart modal is currently open
 *   - `open`: function - Function to open the mini cart modal
 *   - `close`: function - Function to close the mini cart modal
 */
export function useMiniCartContext(): MiniCartModalContextValue {
  const context = useContext(MiniCartModalContext);
  if (!context) {
    throw new Error(
      'useMiniCartContext must be used within a MiniCartContextProvider. ' +
        'Make sure your component is wrapped with <MiniCartContextProvider>.'
    );
  }
  return context;
}

interface MiniCartContextProviderProps {
  children: ReactNode;
}

export function MiniCartContextProvider({
  children,
}: MiniCartContextProviderProps) {
  const [isOpen, setIsOpened] = useState(false);

  const open = () => setIsOpened(true);
  const close = () => setIsOpened(false);

  // Cleanup portal element when provider unmounts
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        const portalTarget = document.getElementById(MINI_CART_PORTAL_ID);
        if (portalTarget) {
          portalTarget.remove();
        }
        // Restore body scroll
        document.body.style.overflow = 'unset';
      }
    };
  }, []);

  const value: MiniCartModalContextValue = {
    isOpen,
    open,
    close,
  };

  return (
    <MiniCartModalContext.Provider value={value}>
      {children}
    </MiniCartModalContext.Provider>
  );
}
