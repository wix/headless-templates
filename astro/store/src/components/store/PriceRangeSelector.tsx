import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PriceRangeSelectorProps {
  min: number;
  max: number;
  selectedMin: number;
  selectedMax: number;
  setSelectedMin: (price: number) => void;
  setSelectedMax: (price: number) => void;
}

export const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  min,
  max,
  selectedMin,
  selectedMax,
  setSelectedMin,
  setSelectedMax,
}) => {
  // Local state for immediate UI updates while dragging
  const [localSelectedMin, setLocalSelectedMin] = useState(selectedMin);
  const [localSelectedMax, setLocalSelectedMax] = useState(selectedMax);
  const onRangeChange = (value: number[]) => {
    setLocalSelectedMin(value[0]);
    setLocalSelectedMax(value[1]);
  };

  const onRangeCommit = (value: number[]) => {
    setSelectedMin(value[0]);
    setSelectedMax(value[1]);
  };

  const roundedMin = Math.floor(min);
  const roundedMax = Math.ceil(max);

  return (
    <div>
      <div className="space-y-4">
        <div className="mb-4">
          <Label
            htmlFor="price-range"
            className="text-content-primary font-medium text-md"
          >
            Price Range
          </Label>
        </div>
        {/* Price Range Display */}
        <div className="flex items-center justify-between text-sm text-content-light mb-6">
          <span>${String(roundedMin)}</span>
          <span>${String(roundedMax)}</span>
        </div>

        {/* Dual Range Slider */}
        <Slider
          id="price-range"
          min={roundedMin}
          max={roundedMax}
          step={1}
          value={[localSelectedMin, localSelectedMax]}
          onValueChange={onRangeChange}
          onValueCommit={onRangeCommit}
        />

        {/* Manual Price Input */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <Label
              htmlFor="min-price"
              className="block text-xs text-content-muted"
            >
              Min
            </Label>
            <Input
              id="min-price"
              type="number"
              value={localSelectedMin}
              onChange={e => {
                const value = Number(e.target.value) || roundedMin;
                setLocalSelectedMin(value);
                setSelectedMin(value);
              }}
              min={roundedMin}
              max={roundedMax}
              className="bg-surface-primary mt-1 text-content-primary"
            />
          </div>
          <div className="flex-1">
            <Label
              htmlFor="max-price"
              className="block text-xs text-content-muted mb-1"
            >
              Max
            </Label>
            <Input
              id="max-price"
              type="number"
              value={localSelectedMax}
              onChange={e => {
                const value = Number(e.target.value) || roundedMax;
                setLocalSelectedMax(value);
                setSelectedMax(value);
              }}
              min={roundedMin}
              max={roundedMax}
              className="bg-surface-primary mt-1 text-content-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSelector;
