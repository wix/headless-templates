import React from 'react';
import { Filter as FilterPrimitive } from '@wix/headless-components/react';
import { cn } from '@/lib/utils';

export const Root: React.FC<
  React.ComponentProps<typeof FilterPrimitive.Root>
> = props => <FilterPrimitive.Root {...props} />;

export const Filtered: React.FC<
  React.ComponentProps<typeof FilterPrimitive.Filtered>
> = ({ className, children, ...props }) => (
  <FilterPrimitive.Filtered
    className={cn(
      'bg-background border border-border rounded-lg p-4 mb-4',
      className
    )}
    {...props}
  >
    {children}
  </FilterPrimitive.Filtered>
);

export const FilterOptions: React.FC<
  React.ComponentProps<typeof FilterPrimitive.FilterOptions>
> = ({ className, children, ...props }) => (
  <FilterPrimitive.FilterOptions
    className={cn('space-y-6', className)}
    {...props}
  >
    {children}
  </FilterPrimitive.FilterOptions>
);

export const FilterOptionRepeater: React.FC<
  React.ComponentProps<typeof FilterPrimitive.FilterOptionRepeater>
> = ({ className, children, ...props }) => (
  <FilterPrimitive.FilterOptionRepeater
    className={cn('space-y-6', className)}
    {...props}
  >
    {children}
  </FilterPrimitive.FilterOptionRepeater>
);

// Action Components
export const Action = {
  Clear: React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof FilterPrimitive.Action.Clear>
  >(({ className, ...props }, ref) => (
    <FilterPrimitive.Action.Clear
      ref={ref}
      className={cn(
        'text-sm text-muted-foreground hover:text-foreground transition-colors underline cursor-pointer disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )),
};

// FilterOption Components with Theme-Styled Defaults
export const FilterOption = {
  Label: React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof FilterPrimitive.FilterOption.Label>
  >(({ className, children, ...props }, ref) => (
    <FilterPrimitive.FilterOption.Label
      ref={ref}
      className={cn('text-foreground font-medium mb-3 block', className)}
      {...props}
    >
      {children}
    </FilterPrimitive.FilterOption.Label>
  )),

  SingleFilter: React.forwardRef<
    HTMLElement,
    React.ComponentProps<typeof FilterPrimitive.FilterOption.SingleFilter>
  >(({ className, ...props }, ref) => (
    <FilterPrimitive.FilterOption.SingleFilter
      ref={ref}
      className={cn(
        'flex gap-2 [&_button]:px-3 [&_button]:py-2 [&_button]:rounded-md [&_button]:text-sm [&_button]:font-medium [&_button]:border [&_button]:transition-all [&_button]:cursor-pointer [&_button]:border-border [&_button]:bg-background [&_button]:text-foreground [&_button[data-state=on]]:bg-primary [&_button[data-state=on]]:text-primary-foreground [&_button[data-state=on]]:border-primary [&_button[data-state=off]:hover]:bg-muted',
        className
      )}
      {...props}
    />
  )),

  MultiFilter: React.forwardRef<
    HTMLElement,
    React.ComponentProps<typeof FilterPrimitive.FilterOption.MultiFilter>
  >(({ className, ...props }, ref) => (
    <FilterPrimitive.FilterOption.MultiFilter
      ref={ref}
      className={cn(
        `/* --- Child Button Styling --- */
flex flex-wrap gap-2 [&_button]:transition-all [&_button]:cursor-pointer [&_button]:px-3 [&_button]:py-2 [&_button]:rounded-md [&_button]:text-sm [&_button]:font-medium [&_button]:border [&_button]:border-border [&_button]:bg-background [&_button]:text-foreground [&_button[data-state=on]]:bg-primary [&_button[data-state=on]]:text-primary-foreground [&_button[data-state=on]]:border-primary [&_button[data-state=off]:hover]:bg-muted flex flex-wrap gap-2
    [&[data-display-type='color']_button]:relative
    [&[data-display-type='color']_button]:w-8
    [&[data-display-type='color']_button]:h-8
    [&[data-display-type='color']_button]:rounded-full
    [&[data-display-type='color']_button]:border
    [&[data-display-type='color']_button]:border-border
    [&[data-display-type='color']_button]:text-transparent
    [&[data-display-type='color']_button]:cursor-pointer
    [&[data-display-type='color']_button[data-state='on']]:bg-primary
    [&[data-display-type='color']_button[data-state='on']]:border-primary

    /* --- Child Tooltip Styling --- */
    [&[data-display-type='color']_button:after]:content-[attr(aria-label)]
    [&[data-display-type='color']_button:after]:absolute
    [&[data-display-type='color']_button:after]:top-full
    [&[data-display-type='color']_button:after]:mt-2
    [&[data-display-type='color']_button:after]:left-1/2
    [&[data-display-type='color']_button:after]:-translate-x-1/2
    [&[data-display-type='color']_button:after]:whitespace-nowrap
    [&[data-display-type='color']_button:after]:rounded
    [&[data-display-type='color']_button:after]:bg-background
    [&[data-display-type='color']_button:after]:px-2
    [&[data-display-type='color']_button:after]:py-1
    [&[data-display-type='color']_button:after]:text-sm
    [&[data-display-type='color']_button:after]:text-foreground
    [&[data-display-type='color']_button:after]:opacity-0
    [&[data-display-type='color']_button:after]:invisible
    [&[data-display-type='color']_button:after]:transition-opacity
    [&[data-display-type='color']_button:after]:z-10

    /* --- Show Tooltip on Hover --- */
    [&[data-display-type='color']_button:hover:after]:opacity-100
    [&[data-display-type='color']_button:hover:after]:visible`,
        className
      )}
      {...props}
    />
  )),

  RangeFilter: React.forwardRef<
    HTMLElement,
    React.ComponentProps<typeof FilterPrimitive.FilterOption.RangeFilter>
  >(({ className, ...props }, ref) => (
    <FilterPrimitive.FilterOption.RangeFilter
      ref={ref}
      className={cn(
        `space-y-4 
        /* Range container */
        [&_span[dir=ltr]]:relative [&_span[dir=ltr]]:flex [&_span[dir=ltr]]:items-center [&_span[dir=ltr]]:select-none [&_span[dir=ltr]]:touch-none [&_span[dir=ltr]]:w-full [&_span[dir=ltr]]:h-6 [&_span[dir=ltr]]:px-2 
        /* Track styling - better contrast for dark theme */
        [&_span[data-orientation=horizontal]]:bg-muted [&_span[data-orientation=horizontal]]:relative [&_span[data-orientation=horizontal]]:grow [&_span[data-orientation=horizontal]]:rounded-full [&_span[data-orientation=horizontal]]:h-2.5 [&_span[data-orientation=horizontal]]:border [&_span[data-orientation=horizontal]]:border-border/50
        /* Progress bar (selected range) */
        [&_span[data-orientation=horizontal][style*=left]:not([style*=position])]:absolute [&_span[data-orientation=horizontal][style*=left]:not([style*=position])]:bg-primary [&_span[data-orientation=horizontal][style*=left]:not([style*=position])]:rounded-full [&_span[data-orientation=horizontal][style*=left]:not([style*=position])]:h-full [&_span[data-orientation=horizontal][style*=left]:not([style*=position])]:border-0
        /* Thumb/handle styling - enhanced for dark theme */
        [&_span[role=slider]]:block [&_span[role=slider]]:w-5 [&_span[role=slider]]:h-5 [&_span[role=slider]]:bg-background [&_span[role=slider]]:shadow-lg [&_span[role=slider]]:border-2 [&_span[role=slider]]:border-primary [&_span[role=slider]]:rounded-full [&_span[role=slider]]:cursor-grab [&_span[role=slider]]:transition-all [&_span[role=slider]]:duration-150 [&_span[role=slider]]:ring-1 [&_span[role=slider]]:ring-background
        /* Thumb hover and focus states */
        [&_span[role=slider]:hover]:shadow-xl [&_span[role=slider]:hover]:scale-110 [&_span[role=slider]:hover]:border-primary [&_span[role=slider]:active]:cursor-grabbing [&_span[role=slider]:active]:scale-105 [&_span[role=slider]:focus]:outline-none [&_span[role=slider]:focus]:ring-2 [&_span[role=slider]:focus]:ring-primary/50 [&_span[role=slider]:focus]:ring-offset-2 [&_span[role=slider]:focus]:ring-offset-background
        /* Value display styling - improved contrast */
        [&_span[data-range-value]]:px-3 [&_span[data-range-value]]:py-1.5 [&_span[data-range-value]]:bg-muted [&_span[data-range-value]]:text-foreground [&_span[data-range-value]]:rounded-md [&_span[data-range-value]]:border [&_span[data-range-value]]:border-border [&_span[data-range-value]]:font-medium [&_span[data-range-value]]:text-sm [&_span[data-range-value]]:shadow-sm
        /* Range labels */
        [&>div:last-child]:flex [&>div:last-child]:justify-between [&>div:last-child]:text-sm [&>div:last-child]:text-muted-foreground [&>div:last-child]:font-medium [&>div:last-child]:mt-2 
        `,
        className
      )}
      {...props}
    />
  )),
};

// Set display names
Action.Clear.displayName = 'Filter.Action.Clear';
FilterOption.Label.displayName = 'Filter.FilterOption.Label';
FilterOption.SingleFilter.displayName = 'Filter.FilterOption.SingleFilter';
FilterOption.MultiFilter.displayName = 'Filter.FilterOption.MultiFilter';
FilterOption.RangeFilter.displayName = 'Filter.FilterOption.RangeFilter';

// Export default to support namespace imports
export default {
  Root,
  Filtered,
  FilterOptions,
  FilterOptionRepeater,
  Action,
  FilterOption,
};
