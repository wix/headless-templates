import React from 'react';
import { Sort as SortPrimitive } from '@wix/headless-components/react';
import { ProductList as ProductListPrimitive } from '@wix/stores/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
  Sort as SortType,
  SortRootProps as PrimitiveSortRootProps,
  SortOptionProps as PrimitiveSortOptionProps,
  SortValue,
  SortOption,
} from '@wix/headless-components/react';

// Re-export types from primitive
export type { SortType as SortObject };

// Styled component props (same as primitive for consistency)
export interface SortRootProps extends PrimitiveSortRootProps {
  /** Additional CSS classes */
  className?: string;
}

export interface SortOptionProps extends PrimitiveSortOptionProps {
  /** Additional CSS classes */
  className?: string;
}

export interface StyledProductListSortProps {
  /** Additional CSS classes */
  className?: string;
}

export const StyledProductListSort = (props: StyledProductListSortProps) => {
  return (
    <ProductListPrimitive.Sort asChild={true}>
      {({ currentSort, sortOptions, setSort }) => (
        <Root
          value={currentSort}
          onChange={setSort as (value: SortValue) => void}
          sortOptions={sortOptions}
          className={props.className}
        />
      )}
    </ProductListPrimitive.Sort>
  );
};

// Styled Root component - pure styling wrapper, no logic
export const Root: React.FC<SortRootProps> = props => {
  const toValueString = (option: SortOption) => {
    const fieldName = 'fieldName' in option ? option.fieldName : '';
    const order = 'order' in option ? option.order : '';
    return `${fieldName}:${order}`;
  };

  const optionValues = props.sortOptions?.map(toValueString) || [];

  // Find current option based on the current sort value
  let currentValueString = props.value?.length
    ? toValueString(props.value[0] as SortOption)
    : '';

  if (!currentValueString) {
    currentValueString =
      toValueString(props.sortOptions?.[0] as SortOption) || '';
  }

  const currentOption = props.sortOptions?.find(
    (_, index) => optionValues[index] === currentValueString
  );

  const handleValueChange = (valueString: string) => {
    const option = props.sortOptions?.find(
      option => toValueString(option) === valueString
    );
    const sortValue: SortValue = option ? [option] : [];
    props.onChange?.(sortValue);
  };

  return (
    <Select value={currentValueString} onValueChange={handleValueChange}>
      <SelectTrigger className={cn('min-w-[160px]', props.className)}>
        <SelectValue
          placeholder={currentOption?.label || 'Select sort option'}
        />
      </SelectTrigger>
      <SelectContent>
        {props.sortOptions?.map((option, index) => (
          <SelectItem key={optionValues[index]} value={optionValues[index]}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Styled Option component - pure styling wrapper, no logic
export const Option: React.FC<SortOptionProps> = props => (
  <SortPrimitive.Option
    {...props}
    className={cn(
      'px-3 py-2 text-sm text-foreground hover:bg-muted data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground rounded cursor-pointer border border-border transition-colors',
      props.className
    )}
  />
);

// Clean namespace (NO Radix exports)
const SortComponents = {
  Root,
  Option,
};

// Export as Sort namespace
export { SortComponents as Sort };

// Also export as StyledSort for backward compatibility
export const StyledSort = SortComponents;
