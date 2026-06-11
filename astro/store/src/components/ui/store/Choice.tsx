import React from 'react';
import { cn } from '@/lib/utils';
import { Choice as ChoicePrimitive } from '@wix/stores/components';

/**
 * Root component for product variant choices (text, color, or free text).
 * Provides context for choice selection functionality.
 *
 * @component
 * @example
 * ```tsx
 * <Choice>
 *   <ChoiceText>Size: Large</ChoiceText>
 * </Choice>
 * ```
 */
export const Choice = ChoicePrimitive.Root;

/**
 * Text-based choice component for product variants like size, material, etc.
 * Shows selected/unselected states and handles user interaction.
 *
 * @component
 * @example
 * ```tsx
 * <OptionChoices>
 *   <OptionChoiceRepeater>
 *     <Choice>
 *       <ChoiceText className="inline-flex items-center px-2 py-1 text-xs rounded border cursor-pointer bg-surface-primary data-[selected='true']:bg-brand-primary data-[selected='true']:text-content-primary data-[selected='true']:border-brand-primary" />
 *
 *       <ChoiceText asChild>
 *         <Button variant="outline"></Button>
 *       </ChoiceText>
 *     </Choice>
 *   </OptionChoiceRepeater>
 * </OptionChoices>
 * ```
 */
export const ChoiceText = React.forwardRef<
  React.ElementRef<typeof ChoicePrimitive.Text>,
  React.ComponentPropsWithoutRef<typeof ChoicePrimitive.Text>
>((props, ref) => {
  return (
    <ChoicePrimitive.Text
      {...props}
      ref={ref}
      className={cn(
        "inline-flex items-center px-2 py-1 border transition-all duration-200 border-color-swatch hover:border-color-swatch-hover hover:scale-105 data-[selected='true']:border-accent-strong data-[selected='true']:shadow-lg data-[selected='true']:bg-primary data-[selected='true']:scale-115 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale",
        props.className
      )}
    >
      {props.children}
    </ChoicePrimitive.Text>
  );
});

ChoiceText.displayName = 'ChoiceText';

/**
 * Color-based choice component for product variants like color swatches.
 * Displays as a circular color picker with selection states and hover effects.
 *
 * @component
 * @example
 * ```tsx
 * <OptionChoices>
 *   <div className="flex flex-wrap gap-1.5">
 *     <OptionChoiceRepeater>
 *       <Choice>
 *         <ChoiceColor className="w-7 h-7 border-2" />
 *       </Choice>
 *     </OptionChoiceRepeater>
 *   </div>
 * </OptionChoices>
 *
 * <OptionChoices>
 *   <div className="flex flex-wrap gap-3">
 *     <OptionChoiceRepeater>
 *       <Choice>
 *         <ChoiceColor />
 *       </Choice>
 *     </OptionChoiceRepeater>
 *   </div>
 * </OptionChoices>
 * ```
 */
export const ChoiceColor = React.forwardRef<
  React.ElementRef<typeof ChoicePrimitive.Color>,
  React.ComponentPropsWithoutRef<typeof ChoicePrimitive.Color>
>((props, ref) => {
  return (
    <ChoicePrimitive.Color
      {...props}
      ref={ref}
      className={cn(
        "w-10 h-10 rounded-full border-4 transition-all duration-200 border-color-swatch hover:border-color-swatch-hover hover:scale-105 data-[selected='true']:border-accent-strong data-[selected='true']:ring-1 data-[selected='true']:scale-115 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale",
        props.className
      )}
    >
      {props.children}
    </ChoicePrimitive.Color>
  );
});

ChoiceColor.displayName = 'ChoiceColor';

/**
 * Free text input choice component for custom product options.
 * Allows users to enter custom text for personalization or special requests.
 *
 * @component
 * @example
 * ```tsx
 * <Option>
 *   <OptionName>Custom Engraving</OptionName>
 *   <OptionChoices>
 *     <OptionChoiceRepeater>
 *       <Choice>
 *         <ChoiceFreeText
 *           placeholder="Enter your custom text..."
 *           className="w-full min-h-[80px]"
 *         />
 *       </Choice>
 *     </OptionChoiceRepeater>
 *   </OptionChoices>
 * </Option>
 * ```
 */
export const ChoiceFreeText = React.forwardRef<
  React.ElementRef<typeof ChoicePrimitive.FreeText>,
  React.ComponentPropsWithoutRef<typeof ChoicePrimitive.FreeText>
>((props, ref) => {
  return (
    <ChoicePrimitive.FreeText
      {...props}
      ref={ref}
      className={cn(
        'p-3 border-brand-light bg-surface-primary text-content-primary placeholder:text-content-subtle resize-none',
        props.className
      )}
    >
      {props.children}
    </ChoicePrimitive.FreeText>
  );
});

ChoiceFreeText.displayName = 'ChoiceFreeText';
