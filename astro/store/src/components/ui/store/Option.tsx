import React from 'react';
import { cn } from '@/lib/utils';
import { Option as OptionPrimitive } from '@wix/stores/components';

/**
 * Root component for product options (variants or modifiers).
 * Provides context for option name, choices, and mandatory indicators.
 *
 * @component
 * @example
 * ```tsx
 * <Option>
 *   <OptionName>Size</OptionName>
 *   <OptionMandatoryIndicator>*</OptionMandatoryIndicator>
 *   <OptionChoices>
 *     <OptionChoiceRepeater>
 *       <Choice>
 *         <ChoiceText>Large</ChoiceText>
 *       </Choice>
 *     </OptionChoiceRepeater>
 *   </OptionChoices>
 * </Option>
 * ```
 */
export const Option = OptionPrimitive.Root;

/**
 * Displays the name/title of a product option.
 * Usually rendered as a label above the option choices.
 *
 * @component
 * @example
 * ```tsx
 * <Option>
 *   <OptionName className="text-content-secondary text-xs font-medium uppercase tracking-wide" />
 *
 *   <div className="flex items-center gap-1">
 *     <OptionName />
 *     <OptionMandatoryIndicator />
 *   </div>
 * </Option>
 * ```
 */
export const OptionName = React.forwardRef<
  React.ElementRef<typeof OptionPrimitive.Name>,
  React.ComponentPropsWithoutRef<typeof OptionPrimitive.Name>
>((props, ref) => {
  return (
    <OptionPrimitive.Name
      {...props}
      ref={ref}
      className={cn(
        'text-md font-medium text-content-primary',
        props.className
      )}
    >
      {props.children}
    </OptionPrimitive.Name>
  );
});

OptionName.displayName = 'OptionName';

/**
 * Indicator that shows when an option is mandatory/required.
 * Only renders when the option is actually required.
 *
 * @component
 * @example
 * ```tsx
 * <Option>
 *   <div className="flex items-center gap-1">
 *     <OptionName>Size</OptionName>
 *     <OptionMandatoryIndicator className="text-red-500">
 *       *
 *     </OptionMandatoryIndicator>
 *   </div>
 *   <OptionChoices>
 *     <OptionChoiceRepeater>
 *       <Choice>
 *         <ChoiceText>Large</ChoiceText>
 *       </Choice>
 *     </OptionChoiceRepeater>
 *   </OptionChoices>
 * </Option>
 * ```
 */
export const OptionMandatoryIndicator = React.forwardRef<
  React.ElementRef<typeof OptionPrimitive.MandatoryIndicator>,
  React.ComponentPropsWithoutRef<typeof OptionPrimitive.MandatoryIndicator>
>((props, ref) => {
  return (
    <OptionPrimitive.MandatoryIndicator
      {...props}
      ref={ref}
      className={cn('text-status-error ml-1', props.className)}
    >
      {props.children}
    </OptionPrimitive.MandatoryIndicator>
  );
});

OptionMandatoryIndicator.displayName = 'OptionMandatoryIndicator';

/**
 * Container for all choices within an option.
 * Wraps the choice repeater and individual choice components.
 *
 * @component
 * @example
 * ```tsx
 * <Option>
 *   <OptionName />
 *   <OptionChoices>
 *     <div className="flex flex-wrap gap-1.5">
 *       <OptionChoiceRepeater>
 *         <>
 *           <ChoiceColor className="w-7 h-7 border-2" />
 *           <ChoiceText className="inline-flex items-center px-2 py-1 text-xs rounded border cursor-pointer bg-surface-primary data-[selected='true']:bg-brand-primary" />
 *         </>
 *       </OptionChoiceRepeater>
 *     </div>
 *   </OptionChoices>
 * </Option>
 * ```
 */
export const OptionChoices = React.forwardRef<
  React.ElementRef<typeof OptionPrimitive.Choices>,
  React.ComponentPropsWithoutRef<typeof OptionPrimitive.Choices>
>((props, ref) => {
  return (
    <OptionPrimitive.Choices {...props} ref={ref}>
      {props.children}
    </OptionPrimitive.Choices>
  );
});

OptionChoices.displayName = 'OptionChoices';

/**
 * Repeater component that renders each choice within an option.
 * Automatically iterates through all available choices.
 *
 * @component
 * @example
 * ```tsx
 * <OptionChoices>
 *   <OptionChoiceRepeater>
 *     <Choice>
 *       <ChoiceText className="px-3 py-2 border rounded hover:bg-gray-50" />
 *     </Choice>
 *   </OptionChoiceRepeater>
 * </OptionChoices>
 * ```
 */
export const OptionChoiceRepeater = OptionPrimitive.ChoiceRepeater;

OptionChoiceRepeater.displayName = 'OptionChoiceRepeater';
