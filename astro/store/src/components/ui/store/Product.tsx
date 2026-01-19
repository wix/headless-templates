import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Product as ProductPrimitive } from '@wix/stores/components';
import { Button } from '@/components/ui/button';
import { Badge } from '../badge';

/**
 * Root component for product display and interaction.
 * Provides context for all product-related components like name, price, variants, etc.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 *     <ProductMediaGallery />
 *     <div>
 *       <ProductName />
 *       <ProductPrice />
 *       <ProductDescription />
 *       <ProductVariants>
 *         <ProductVariantOptions>
 *           <Option>
 *             <OptionName>Size</OptionName>
 *           </Option>
 *         </ProductVariantOptions>
 *       </ProductVariants>
 *     </div>
 *   </div>
 * </Product>
 * ```
 */
export const Product = ProductPrimitive.Root;

const productNameVariants = cva('font-theme-heading', {
  variants: {
    variant: {
      heading: 'text-4xl font-bold text-content-primary mb-4',
      paragraph: '',
    },
  },
  defaultVariants: {
    variant: 'heading',
  },
});

export interface ProductNameProps
  extends React.ComponentPropsWithoutRef<typeof ProductPrimitive.Name>,
    VariantProps<typeof productNameVariants> {}

/**
 * Displays the product name/title.
 * Can be rendered as different heading levels or paragraph text.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <ProductName asChild>
 *     <h2 />
 *   </ProductName>
 *
 *   <ProductName variant="paragraph" className="text-primary mb-2 line-clamp-2 hover:text-brand-primary transition-colors" />
 * </Product>
 * ```
 */
export const ProductName = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Name>,
  ProductNameProps
>(({ variant, className, ...props }, ref) => {
  return (
    <ProductPrimitive.Name
      {...props}
      ref={ref}
      className={cn(productNameVariants({ variant }), className)}
      data-item-field="name"
    >
      {props.children}
    </ProductPrimitive.Name>
  );
});

ProductName.displayName = 'ProductName';

/**
 * Displays the product description.
 * Supports both plain text and HTML content rendering.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <ProductDescription
 *     as="html"
 *     className="text-content-muted text-sm mb-3 line-clamp-2 leading-relaxed"
 *   />
 *
 *   <ProductDescription as="html" asChild>
 *     {({ description }) => (
 *       <>
 *         {description && (
 *           <div>
 *             <h3 className="text-xl font-semibold mb-3">Description</h3>
 *             <div dangerouslySetInnerHTML={{ __html: description }} />
 *           </div>
 *         )}
 *       </>
 *     )}
 *   </ProductDescription>
 * </Product>
 * ```
 */
export const ProductDescription = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Description>
>((props, ref) => {
  return (
    <ProductPrimitive.Description
      {...props}
      ref={ref}
      className={cn('text-content-secondary leading-relaxed', props.className)}
    >
      {props.children}
    </ProductPrimitive.Description>
  );
});

ProductDescription.displayName = 'ProductDescription';

/**
 * Displays the current product price.
 * Automatically handles currency formatting and price ranges.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="flex items-center gap-2">
 *     <ProductPrice className="text-xl font-bold text-content-primary" />
 *     <ProductCompareAtPrice className="text-sm font-medium text-content-faded line-through" />
 *   </div>
 *
 *   <div className="space-y-1">
 *     <ProductPrice />
 *     <ProductCompareAtPrice asChild>
 *       <div></div>
 *     </ProductCompareAtPrice>
 *   </div>
 * </Product>
 * ```
 */
export const ProductPrice = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Price>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Price>
>((props, ref) => {
  return (
    <ProductPrimitive.Price
      {...props}
      ref={ref}
      className={cn(
        'text-3xl font-bold text-content-primary font-theme-heading',
        props.className
      )}
      data-item-field="variantsInfo.variants[0].price.actualPrice.amount"
    >
      {props.children}
    </ProductPrimitive.Price>
  );
});

ProductPrice.displayName = 'ProductPrice';

/**
 * Displays the original/compare-at price (usually crossed out).
 * Only shows when the product is on sale and has a compare-at price.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="flex items-baseline gap-2">
 *     <ProductPrice className="text-2xl font-bold text-red-600" />
 *     <ProductCompareAtPrice className="text-sm text-gray-500" />
 *   </div>
 * </Product>
 * ```
 */
export const ProductCompareAtPrice = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.CompareAtPrice>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.CompareAtPrice>
>((props, ref) => {
  return (
    <ProductPrimitive.CompareAtPrice
      {...props}
      ref={ref}
      className={cn(
        'text-lg font-medium text-content-faded line-through',
        props.className
      )}
      data-item-field="variantsInfo.variants[0].price.compareAtPrice.amount"
    >
      {props.children}
    </ProductPrimitive.CompareAtPrice>
  );
});

ProductCompareAtPrice.displayName = 'ProductCompareAtPrice';

/**
 * Displays the product slug/URL identifier.
 * Typically used for SEO or debugging purposes.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <ProductName />
 *   <ProductSlug className="text-xs text-gray-400 mt-1" />
 * </Product>
 * ```
 */
export const ProductSlug = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Slug>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Slug>
>((props, ref) => {
  return (
    <ProductPrimitive.Slug
      {...props}
      ref={ref}
      className={cn('text-content-secondary text-sm', props.className)}
    >
      {props.children}
    </ProductPrimitive.Slug>
  );
});

ProductSlug.displayName = 'ProductSlug';

/**
 * Raw component that provides direct access to the product data.
 * Useful for custom rendering or accessing product properties not covered by other components.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <ProductRaw className="block">
 *     {({ product }) => (
 *       <div>
 *         <p>Product ID: {product._id}</p>
 *         <p>Created: {product._createdDate}</p>
 *       </div>
 *     )}
 *   </ProductRaw>
 * </Product>
 * ```
 */
export const ProductRaw = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Raw>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Raw>
>((props, ref) => {
  return (
    <ProductPrimitive.Raw
      {...props}
      ref={ref}
      className={cn('block', props.className)}
    >
      {props.children}
    </ProductPrimitive.Raw>
  );
});

ProductRaw.displayName = 'ProductRaw';

/**
 * Container for product media gallery functionality.
 * Integrates with media gallery components for image/video display.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 *     <div>
 *       <ProductMediaGallery>
 *         <MediaGalleryViewport />
 *       </ProductMediaGallery>
 *     </div>
 *     <div>
 *       <ProductName />
 *       <ProductPrice />
 *     </div>
 *   </div>
 * </Product>
 * ```
 */
export const ProductMediaGallery = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ProductMediaGallery>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.ProductMediaGallery>
>((props, ref) => {
  return (
    <ProductPrimitive.ProductMediaGallery {...props} ref={ref}>
      {props.children}
    </ProductPrimitive.ProductMediaGallery>
  );
});

ProductMediaGallery.displayName = 'ProductMediaGallery';

/**
 * Container for product variants (size, color, style, etc.).
 * Wraps all variant options and provides proper spacing.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <ProductVariants>
 *     <ProductVariantOptions>
 *       <ProductVariantOptionRepeater>
 *         <Option>
 *           <div className="space-y-3 mb-4">
 *             <OptionName />
 *             <OptionChoices>
 *               <div className="flex flex-wrap gap-3">
 *                 <OptionChoiceRepeater>
 *                   <>
 *                     <ChoiceColor />
 *                     <ChoiceText />
 *                   </>
 *                 </OptionChoiceRepeater>
 *               </div>
 *             </OptionChoices>
 *           </div>
 *         </Option>
 *       </ProductVariantOptionRepeater>
 *     </ProductVariantOptions>
 *   </ProductVariants>
 * </Product>
 * ```
 */
export const ProductVariants = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Variants>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Variants>
>((props, ref) => {
  return (
    <ProductPrimitive.Variants
      {...props}
      ref={ref}
      className={cn('space-y-4', props.className)}
    >
      {props.children}
    </ProductPrimitive.Variants>
  );
});

ProductVariants.displayName = 'ProductVariants';

/**
 * Container for product modifiers (add-ons, customizations, etc.).
 * Wraps all modifier options and provides proper spacing.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <ProductModifiers>
 *     <ProductModifierOptions>
 *       <ProductModifierOptionRepeater>
 *         <Option>
 *           <div className="flex items-center gap-1">
 *             <OptionName />
 *             <OptionMandatoryIndicator />
 *           </div>
 *           <OptionChoices>
 *             <OptionChoiceRepeater>
 *               <>
 *                 <ChoiceColor />
 *                 <ChoiceText asChild>
 *                   <Button variant="outline"></Button>
 *                 </ChoiceText>
 *                 <ChoiceFreeText placeholder="Enter custom text" />
 *               </>
 *             </OptionChoiceRepeater>
 *           </OptionChoices>
 *         </Option>
 *       </ProductModifierOptionRepeater>
 *     </ProductModifierOptions>
 *   </ProductModifiers>
 * </Product>
 * ```
 */
export const ProductModifiers = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Modifiers>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Modifiers>
>((props, ref) => {
  return (
    <ProductPrimitive.Modifiers
      {...props}
      ref={ref}
      className={cn('space-y-4', props.className)}
    >
      {props.children}
    </ProductPrimitive.Modifiers>
  );
});

ProductModifiers.displayName = 'ProductModifiers';

/**
 * Container for product variant option groups.
 * Wraps all variant option repeaters and provides proper structure.
 *
 * @component
 * @example
 * ```tsx
 * <ProductVariants>
 *   <ProductVariantOptions>
 *     <ProductVariantOptionRepeater>
 *       <Option>
 *         <OptionName />
 *         <OptionChoices>
 *           <OptionChoiceRepeater>
 *             <Choice>
 *               <ChoiceText />
 *             </Choice>
 *           </OptionChoiceRepeater>
 *         </OptionChoices>
 *       </Option>
 *     </ProductVariantOptionRepeater>
 *   </ProductVariantOptions>
 * </ProductVariants>
 * ```
 */
export const ProductVariantOptions = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.VariantOptions>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.VariantOptions>
>((props, ref) => {
  return (
    <ProductPrimitive.VariantOptions {...props} ref={ref}>
      {props.children}
    </ProductPrimitive.VariantOptions>
  );
});

ProductVariantOptions.displayName = 'ProductVariantOptions';

/**
 * Repeater component that renders each variant option within a product.
 * Automatically iterates through all available variant options.
 *
 * @component
 * @example
 * ```tsx
 * <ProductVariantOptions>
 *   <ProductVariantOptionRepeater>
 *     <Option>
 *       <div className="space-y-3 mb-4">
 *         <OptionName />
 *         <OptionChoices>
 *           <div className="flex flex-wrap gap-3">
 *             <OptionChoiceRepeater>
 *               <Choice>
 *                 <ChoiceColor />
 *                 <ChoiceText />
 *               </Choice>
 *             </OptionChoiceRepeater>
 *           </div>
 *         </OptionChoices>
 *       </div>
 *     </Option>
 *   </ProductVariantOptionRepeater>
 * </ProductVariantOptions>
 * ```
 */
export const ProductVariantOptionRepeater =
  ProductPrimitive.VariantOptionRepeater;

ProductVariantOptionRepeater.displayName = 'ProductVariantOptionRepeater';

/**
 * Container for product modifier option groups.
 * Wraps all modifier option repeaters and provides proper structure.
 *
 * @component
 * @example
 * ```tsx
 * <ProductModifiers>
 *   <ProductModifierOptions>
 *     <ProductModifierOptionRepeater>
 *       <Option>
 *         <div className="flex items-center gap-1">
 *           <OptionName />
 *           <OptionMandatoryIndicator />
 *         </div>
 *         <OptionChoices>
 *           <OptionChoiceRepeater>
 *             <Choice>
 *               <ChoiceText />
 *               <ChoiceFreeText placeholder="Custom option" />
 *             </Choice>
 *           </OptionChoiceRepeater>
 *         </OptionChoices>
 *       </Option>
 *     </ProductModifierOptionRepeater>
 *   </ProductModifierOptions>
 * </ProductModifiers>
 * ```
 */
export const ProductModifierOptions = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ModifierOptions>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.ModifierOptions>
>((props, ref) => {
  return (
    <ProductPrimitive.ModifierOptions {...props} ref={ref}>
      {props.children}
    </ProductPrimitive.ModifierOptions>
  );
});

ProductModifierOptions.displayName = 'ProductModifierOptions';

export const ProductModifierOptionRepeater =
  ProductPrimitive.ModifierOptionRepeater;

ProductModifierOptionRepeater.displayName = 'ProductModifierOptionRepeater';

/**
 * Displays the product stock status with appropriate styling.
 * Shows different states: in stock, limited stock, or out of stock.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="flex items-center gap-4 mt-4">
 *     <ProductPrice />
 *     <ProductStock className="text-sm font-medium">
 *       {({ stockStatus }) => (
 *         <span className={`px-2 py-1 rounded ${
 *           stockStatus === 'in-stock' ? 'bg-green-100' :
 *           stockStatus === 'limited-stock' ? 'bg-yellow-100' : 'bg-red-100'
 *         }`}>
 *           {stockStatus === 'in-stock' ? 'In Stock' :
 *            stockStatus === 'limited-stock' ? 'Limited Stock' : 'Out of Stock'}
 *         </span>
 *       )}
 *     </ProductStock>
 *   </div>
 * </Product>
 * ```
 */
export const ProductStock = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Stock>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Stock>
>((props, ref) => {
  return (
    <ProductPrimitive.Stock
      {...props}
      ref={ref}
      labels={{
        inStock: 'In Stock',
        limitedStock: 'Limited Stock',
        outOfStock: 'Out of Stock',
        ...props.labels,
      }}
      className={cn(
        'data-[state="out-of-stock"]:text-status-error data-[state="in-stock"]:text-status-success data-[state="limited-stock"]:text-status-success',
        props.className
      )}
      asChild
    >
      {props.children}
    </ProductPrimitive.Stock>
  );
});

ProductStock.displayName = 'ProductStock';

/**
 * Add to cart button with loading states and automatic cart integration.
 * Handles product variants, quantities, and cart updates automatically.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="flex gap-3 mt-6">
 *     <ProductActionAddToCart
 *       label="Add to Cart"
 *       loadingState="Adding..."
 *       className="flex-1"
 *     />
 *     <ProductActionBuyNow
 *       label="Buy Now"
 *       loadingState="Processing..."
 *       className="flex-1"
 *     />
 *   </div>
 * </Product>
 * ```
 */

const productActionBtnClass = 'flex-1 relative btn-primary';

export const ProductActionAddToCart = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ProductActionAddToCart>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.ProductActionAddToCart>
>((props, ref) => {
  return (
    <ProductPrimitive.ProductActionAddToCart
      {...props}
      ref={ref}
      className={props.className}
      asChild
    >
      {React.forwardRef(({ isLoading, ...restProps }, ref) => {
        return (
          <Button
            ref={ref as React.RefObject<HTMLButtonElement>}
            variant="default"
            size="lg"
            className={productActionBtnClass}
            {...restProps}
          >
            {!isLoading ? props.label : props.loadingState}
          </Button>
        );
      })}
    </ProductPrimitive.ProductActionAddToCart>
  );
});

ProductActionAddToCart.displayName = 'ProductActionAddToCart';

/**
 * Buy now button that redirects directly to checkout.
 * Bypasses the cart and goes straight to the purchase flow.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="flex gap-3 mt-6">
 *     <ProductActionAddToCart label="Add to Cart" />
 *     <ProductActionBuyNow
 *       label="Buy Now"
 *       loadingState="Redirecting..."
 *       className="bg-orange-600 hover:bg-orange-700"
 *     />
 *   </div>
 * </Product>
 * ```
 */
export const ProductActionBuyNow = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ProductActionBuyNow>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.ProductActionBuyNow>
>((props, ref) => {
  return (
    <ProductPrimitive.ProductActionBuyNow
      {...props}
      ref={ref}
      className={props.className}
      asChild
    >
      {React.forwardRef(({ isLoading, ...restProps }, ref) => {
        return (
          <Button
            ref={ref as React.RefObject<HTMLButtonElement>}
            variant="secondary"
            size="lg"
            className={productActionBtnClass}
            {...restProps}
          >
            {!isLoading ? props.label : props.loadingState}
          </Button>
        );
      })}
    </ProductPrimitive.ProductActionBuyNow>
  );
});

ProductActionBuyNow.displayName = 'ProductActionBuyNow';

/**
 * Pre-order button for products not yet available.
 * Automatically shows when product is in pre-order status.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="space-y-3">
 *     <ProductStock />
 *     <ProductActionPreOrder
 *       label="Pre-Order Now"
 *       loadingState="Processing Pre-Order..."
 *       className="w-full"
 *     />
 *   </div>
 * </Product>
 * ```
 */
export const ProductActionPreOrder = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ProductActionPreOrder>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.ProductActionPreOrder>
>((props, ref) => {
  return (
    <ProductPrimitive.ProductActionPreOrder
      {...props}
      ref={ref}
      className={props.className}
      asChild
    >
      {React.forwardRef(({ isLoading, ...restProps }, ref) => {
        return (
          <Button
            ref={ref as React.RefObject<HTMLButtonElement>}
            variant="default"
            size="lg"
            className={productActionBtnClass}
            {...restProps}
          >
            {!isLoading ? props.label : props.loadingState}
          </Button>
        );
      })}
    </ProductPrimitive.ProductActionPreOrder>
  );
});

ProductActionPreOrder.displayName = 'ProductActionPreOrder';

// Quantity Components
const productQuantityVariants = cva('', {
  variants: {
    variant: {
      default: '',
      button:
        'px-3 py-1 hover:bg-surface-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
      input:
        'w-16 text-center py-1 border-x border-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary',
    },
    size: {
      default: '',
      sm: 'text-sm',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ProductQuantityRootProps
  extends React.ComponentPropsWithoutRef<typeof ProductPrimitive.Quantity.Root>,
    VariantProps<typeof productQuantityVariants> {}

/**
 * Root component for product quantity selection.
 * Wraps all quantity-related components and provides proper layout.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <ProductQuantityRoot className="flex items-center gap-3">
 *     <ProductQuantityDecrement />
 *     <ProductQuantityInput />
 *     <ProductQuantityIncrement />
 *   </ProductQuantityRoot>
 * </Product>
 * ```
 */
export const ProductQuantityRoot = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Quantity.Root>,
  ProductQuantityRootProps
>(({ variant, size, className, ...props }, ref) => {
  return (
    <ProductPrimitive.Quantity.Root
      {...props}
      ref={ref}
      className={cn(productQuantityVariants({ variant, size }), className)}
    >
      {props.children}
    </ProductPrimitive.Quantity.Root>
  );
});

ProductQuantityRoot.displayName = 'ProductQuantityRoot';

export interface ProductQuantityDecrementProps
  extends React.ComponentPropsWithoutRef<
      typeof ProductPrimitive.Quantity.Decrement
    >,
    VariantProps<typeof productQuantityVariants> {}

/**
 * Decrement button for product quantity.
 * Reduces the quantity by one when clicked.
 *
 * @component
 * @example
 * ```tsx
 * <ProductQuantityRoot>
 *   <ProductQuantityDecrement variant="button" />
 *   <ProductQuantityInput />
 *   <ProductQuantityIncrement variant="button" />
 * </ProductQuantityRoot>
 * ```
 */
export const ProductQuantityDecrement = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Quantity.Decrement>,
  ProductQuantityDecrementProps
>(({ variant, size, className, ...props }, ref) => {
  return (
    <ProductPrimitive.Quantity.Decrement
      {...props}
      ref={ref}
      className={cn(productQuantityVariants({ variant, size }), className)}
    >
      {props.children}
    </ProductPrimitive.Quantity.Decrement>
  );
});

ProductQuantityDecrement.displayName = 'ProductQuantityDecrement';

export interface ProductQuantityInputProps
  extends React.ComponentPropsWithoutRef<
      typeof ProductPrimitive.Quantity.Input
    >,
    VariantProps<typeof productQuantityVariants> {}

/**
 * Input field for product quantity.
 * Allows users to directly enter a quantity value.
 *
 * @component
 * @example
 * ```tsx
 * <ProductQuantityRoot>
 *   <ProductQuantityDecrement />
 *   <ProductQuantityInput variant="input" />
 *   <ProductQuantityIncrement />
 * </ProductQuantityRoot>
 * ```
 */
export const ProductQuantityInput = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Quantity.Input>,
  ProductQuantityInputProps
>(({ variant, size, className, ...props }, ref) => {
  return (
    <ProductPrimitive.Quantity.Input
      {...props}
      ref={ref}
      className={cn(productQuantityVariants({ variant, size }), className)}
    />
  );
});

ProductQuantityInput.displayName = 'ProductQuantityInput';

export interface ProductQuantityIncrementProps
  extends React.ComponentPropsWithoutRef<
      typeof ProductPrimitive.Quantity.Increment
    >,
    VariantProps<typeof productQuantityVariants> {}

/**
 * Increment button for product quantity.
 * Increases the quantity by one when clicked.
 *
 * @component
 * @example
 * ```tsx
 * <ProductQuantityRoot>
 *   <ProductQuantityDecrement />
 *   <ProductQuantityInput />
 *   <ProductQuantityIncrement variant="button" />
 * </ProductQuantityRoot>
 * ```
 */
export const ProductQuantityIncrement = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Quantity.Increment>,
  ProductQuantityIncrementProps
>(({ variant, size, className, ...props }, ref) => {
  return (
    <ProductPrimitive.Quantity.Increment
      {...props}
      ref={ref}
      className={cn(productQuantityVariants({ variant, size }), className)}
    >
      {props.children}
    </ProductPrimitive.Quantity.Increment>
  );
});

ProductQuantityIncrement.displayName = 'ProductQuantityIncrement';

/**
 * Raw component that provides direct access to quantity data.
 * Useful for custom rendering or accessing quantity properties.
 *
 * @component
 * @example
 * ```tsx
 * <ProductQuantityRoot>
 *   <ProductQuantityDecrement />
 *   <ProductQuantityInput />
 *   <ProductQuantityIncrement />
 *   <ProductQuantityRaw>
 *     {({ availableQuantity, inStock, isPreOrderEnabled }) => (
 *       <div className="text-sm text-content-muted">
 *         {!inStock && isPreOrderEnabled && availableQuantity && (
 *           <span>Max: {availableQuantity} Pre Order</span>
 *         )}
 *       </div>
 *     )}
 *   </ProductQuantityRaw>
 * </ProductQuantityRoot>
 * ```
 */
export const ProductQuantityRaw = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Quantity.Raw>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Quantity.Raw>
>((props, ref) => {
  return (
    <ProductPrimitive.Quantity.Raw
      {...props}
      ref={ref}
      className={cn('block', props.className)}
    >
      {props.children}
    </ProductPrimitive.Quantity.Raw>
  );
});

ProductQuantityRaw.displayName = 'ProductQuantityRaw';

/**
 * Displays the selected product variant SKU (Stock Keeping Unit).
 * Only shows when a variant is selected and has an SKU.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="flex items-center gap-2 text-sm text-content-secondary">
 *     <span>SKU:</span>
 *     <ProductVariantSKU className="font-mono" />
 *   </div>
 *
 *   <ProductVariantSKU asChild>
 *     {({ sku }) => (
 *       <span className="text-xs text-content-muted">
 *         Item #{sku}
 *       </span>
 *     )}
 *   </ProductVariantSKU>
 * </Product>
 * ```
 */
export const ProductVariantSKU = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ProductVariant.SKU>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.ProductVariant.SKU>
>((props, ref) => {
  return (
    <ProductPrimitive.ProductVariant.SKU
      {...props}
      ref={ref}
      className={cn(props.className)}
      data-item-field="variantsInfo.variants[0].sku"
    >
      {props.children}
    </ProductPrimitive.ProductVariant.SKU>
  );
});

ProductVariantSKU.displayName = 'ProductVariantSKU';

/**
 * Displays the selected product variant weight.
 * Shows the weight value with appropriate formatting when available.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="flex items-center gap-2 text-sm text-content-secondary">
 *     <span>Weight:</span>
 *     <ProductVariantWeight className="font-medium" />
 *   </div>
 *
 *   <ProductVariantWeight asChild>
 *     {({ weight }) => (
 *       <span className="text-sm text-content-secondary">
 *         {weight} kg
 *       </span>
 *     )}
 *   </ProductVariantWeight>
 * </Product>
 * ```
 */
export const ProductVariantWeight = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ProductVariant.Weight>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.ProductVariant.Weight>
>((props, ref) => {
  return (
    <ProductPrimitive.ProductVariant.Weight
      {...props}
      ref={ref}
      className={cn(props.className)}
      data-item-field="variantsInfo.variants[0].physicalProperties.weight"
    >
      {props.children}
    </ProductPrimitive.ProductVariant.Weight>
  );
});

ProductVariantWeight.displayName = 'ProductVariantWeight';

/**
 * Displays the selected product variant stock status.
 * Shows different states: in stock, limited stock, out of stock, or pre-order available.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="flex items-center gap-2">
 *     <ProductVariantStock
 *       labels={{
 *         inStock: 'In Stock',
 *         limitedStock: 'Limited Stock',
 *         outOfStock: 'Out of Stock',
 *         preOrder: 'Available for Pre-order',
 *       }}
 *       className="flex items-center gap-2 data-[state='out-of-stock']:text-status-error data-[state='in-stock']:text-status-success data-[state='limited-stock']:text-status-success data-[state='pre-order']:text-status-success"
 *     />
 *   </div>
 *
 *   <ProductVariantStock asChild>
 *     {({ status, label }) => (
 *       <span className={`px-2 py-1 rounded text-sm ${
 *         status === 'in-stock' ? 'bg-green-100 text-green-800' :
 *         status === 'limited-stock' ? 'bg-yellow-100 text-yellow-800' :
 *         status === 'out-of-stock' ? 'bg-red-100 text-red-800' :
 *         'bg-blue-100 text-blue-800'
 *       }`}>
 *         {label}
 *       </span>
 *     )}
 *   </ProductVariantStock>
 * </Product>
 * ```
 */
export const ProductVariantStock = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ProductVariant.Stock>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.ProductVariant.Stock>
>((props, ref) => {
  return (
    <ProductPrimitive.ProductVariant.Stock
      {...props}
      ref={ref}
      className={cn(
        'text-sm data-[state="out-of-stock"]:text-status-error data-[state="in-stock"]:text-status-success data-[state="limited-stock"]:text-status-success data-[state="can-pre-order"]:text-status-success',
        props.className
      )}
      asChild
    >
      {React.forwardRef((props, ref) => {
        return (
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="flex items-center gap-1"
          >
            <span
              className={`h-3 w-3 inline-block rounded-full ${
                props.status === 'out-of-stock'
                  ? 'status-dot-danger'
                  : 'status-dot-success'
              }`}
            />
            {props.label}
          </div>
        );
      })}
    </ProductPrimitive.ProductVariant.Stock>
  );
});

ProductVariantStock.displayName = 'ProductVariantStock';

/**
 * Reset button for product variant selections.
 * Allows users to clear all selected variants and return to default state.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <ProductVariants>
 *     <ProductVariantOptions>
 *       <ProductVariantOptionRepeater>
 *         <Option>
 *           <OptionName>Size</OptionName>
 *           <OptionChoices>
 *             <OptionChoiceRepeater>
 *               <Choice>
 *                 <ChoiceText />
 *               </Choice>
 *             </OptionChoiceRepeater>
 *           </OptionChoices>
 *         </Option>
 *       </ProductVariantOptionRepeater>
 *     </ProductVariantOptions>
 *     <ProductVariantSelectorReset className="text-sm text-brand-primary hover:text-brand-light transition-colors" />
 *   </ProductVariants>
 * </Product>
 * ```
 */
export const ProductVariantSelectorReset = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.ProductVariantSelectorReset>,
  React.ComponentPropsWithoutRef<
    typeof ProductPrimitive.ProductVariantSelectorReset
  >
>((props, ref) => {
  return (
    <ProductPrimitive.ProductVariantSelectorReset
      {...props}
      ref={ref}
      className={cn(
        'text-sm text-brand-primary hover:text-brand-light transition-colors',
        props.className
      )}
    >
      {props.children}
    </ProductPrimitive.ProductVariantSelectorReset>
  );
});

ProductVariantSelectorReset.displayName = 'ProductVariantSelectorReset';

/**
 * Displays the product ribbon/badge.
 * Shows promotional badges, labels, or status indicators on the product.
 *
 * @component
 * @example
 * ```tsx
 * <Product product={productData}>
 *   <div className="relative">
 *     <ProductMediaGallery />
 *     <ProductRibbon className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded" />
 *   </div>
 *
 *   <ProductRibbon asChild>
 *     {({ ribbon }) => (
 *       <span className="bg-blue-500 text-white px-2 py-1 text-xs rounded">
 *         {ribbon.name}
 *       </span>
 *     )}
 *   </ProductRibbon>
 * </Product>
 * ```
 */
export const ProductRibbon = React.forwardRef<
  React.ElementRef<typeof ProductPrimitive.Ribbon>,
  React.ComponentPropsWithoutRef<typeof ProductPrimitive.Ribbon>
>((props, ref) => {
  return (
    <ProductPrimitive.Ribbon
      {...props}
      ref={ref}
      className={cn('absolute top-2 z-10 px-3 py-1 left-2', props.className)}
      asChild
    >
      <Badge variant="secondary" data-item-field="ribbon.name" />
    </ProductPrimitive.Ribbon>
  );
});

ProductRibbon.displayName = 'ProductRibbon';
