'use client';
import Swatch from '@app/components/Product/Swatch/Swatch';
import { Option } from '@app/components/Product/Option/Option';
import { productsV3 } from '@wix/stores';

interface ProductOptionsProps {
  options: productsV3.ConnectedOption[];
  selectedOptions: any;
  setSelectedOptions: React.Dispatch<React.SetStateAction<any>>;
}

export const ProductOptions: React.FC<ProductOptionsProps> = ({
  options,
  selectedOptions,
  setSelectedOptions,
}) => {
  const setSelected = (newOption: Record<string, string>) => {
    setSelectedOptions((selectedOptions: any) => {
      return {
        ...selectedOptions,
        ...newOption,
      };
    });
  };
  return (
    <>
      {options.map((opt) => (
        <div className="mb-4" key={opt.name}>
          <span className="text-xs tracking-wide">{opt.name}</span>
          <div role="listbox" className="flex flex-row gap-2 my-2 relative">
            {opt.optionRenderType === 'SWATCH_CHOICES' &&
              opt.choicesSettings?.choices!.map((v, i: number) => {
                const active = selectedOptions[opt.name!];
                return (
                  <Swatch
                    key={`${v.name}-${i}`}
                    active={v.name === active}
                    variant={v.name!}
                    color={v.colorCode!}
                    label={v.name!}
                    onClick={() =>
                      setSelected({
                        [opt.name!]: v.name!,
                      })
                    }
                  />
                );
              })}
            {opt.optionRenderType !== 'SWATCH_CHOICES' && (
              <Option
                option={opt}
                onChange={setSelected}
                selectedOption={selectedOptions[opt.name!]}
              />
            )}
          </div>
        </div>
      ))}
    </>
  );
};
