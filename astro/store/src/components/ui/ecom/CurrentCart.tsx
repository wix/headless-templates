import { CurrentCart as CurrentCartPrimitive } from '@wix/ecom/components';

/**
 * Provider component that manages the current user's cart state.
 * Must wrap any components that need access to cart functionality.
 *
 * @component
 * @example
 * ```tsx
 * <CurrentCart>
 *   <div className="app">
 *     <Header>
 *       <CartSummary />
 *     </Header>
 *     <main>
 *       <ProductList />
 *     </main>
 *     <aside>
 *       <Cart>
 *         <CartLineItems>
 *           <CartLineItemRepeater>
 *             <LineItem>
 *               <LineItemTitle />
 *             </LineItem>
 *           </CartLineItemRepeater>
 *         </CartLineItems>
 *       </Cart>
 *     </aside>
 *   </div>
 * </CurrentCart>
 * ```
 */
export const CurrentCart = CurrentCartPrimitive.Root;
