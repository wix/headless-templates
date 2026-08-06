'use client';
import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@app/utils/price-formatter';
import { cartV2 } from '@wix/ecom';
import { useUI } from '@app/components/Provider/context';
import { Quantity } from '@app/components/Quantity/Quantity';
import { useUpdateCart } from '@app/hooks/useUpdateCart';
import { useRemoveItemFromCart } from '@app/hooks/useRemoveItemFromCart';
import { WixMediaImage } from '@app/components/Image/WixMediaImage';

export const CartItem = ({
  item,
  currencyCode,
  hideButtons,
  ...rest
}: {
  item: cartV2.V2LineItem;
  currencyCode: string;
  hideButtons?: boolean;
}) => {
  const { closeSidebarIfPresent } = useUI();
  const [removing, setRemoving] = useState(false);
  const [quantity, setQuantity] = useState<number>(
    item.quantityInfo?.confirmedQuantity ?? 1
  );
  const removeItem = useRemoveItemFromCart();
  const updateCartMutation = useUpdateCart();

  // V2 pricing: `totalPrice` is already the line total (unit x quantity).
  const lineTotal = Number(
    item.pricing?.totalPrice?.convertedAmount ?? item.pricing?.totalPrice?.amount ?? 0,
  );
  const price = formatPrice({
    amount: lineTotal,
    baseAmount: lineTotal,
    currencyCode,
  });

  const handleChange = async ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(value));
    await updateCartMutation({ quantity: Number(value), _id: item._id! });
  };

  const increaseQuantity = async (n = 1) => {
    const val = Number(quantity) + n;
    setQuantity(val);
    await updateCartMutation({ quantity: val, _id: item._id! });
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeItem(item._id!);
    } catch (error) {
      setRemoving(false);
    }
  };

  useEffect(() => {
    const confirmedQuantity = item.quantityInfo?.confirmedQuantity;
    if (confirmedQuantity !== Number(quantity)) {
      setQuantity(confirmedQuantity!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.quantityInfo?.confirmedQuantity]);

  const slug = item.attributes?.url?.split('/').pop() ?? '';

  return (
    <li className="flex flex-col py-4" {...rest}>
      <div className="flex flex-row gap-4 py-4">
        <div className="w-20 h-20 bg-violet relative overflow-hidden z-0">
          {slug ? (
            <Link href={`/product-page/${slug}`}>
              <div onClick={closeSidebarIfPresent}>
                <WixMediaImage
                  width={150}
                  height={150}
                  media={item.attributes?.image}
                />
              </div>
            </Link>
          ) : (
            <WixMediaImage width={150} height={150} media={item.attributes?.image} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex-1 flex flex-col text-base">
            {slug ? (
              <Link href={`/product-page/${slug}`}>
                <span className="cursor-pointer pb-1 text-gray-500">
                  {item.name?.translated ?? item.name?.original}
                </span>
              </Link>
            ) : (
              <span className="pb-1 text-gray-500">
                {item.name?.translated ?? item.name?.original}
              </span>
            )}
          </div>
          <span>{price}</span>
          {item.descriptionLines?.length ? (
            <div className="mt-1">
              {item.descriptionLines?.map((line) => (
                <span
                  key={line.name?.translated}
                  className="text-12 leading-tight text-gray-500 block"
                >
                  {line.name?.translated}:{' '}
                  {line.colorInfo?.translated || line.plainText?.translated}
                </span>
              ))}
            </div>
          ) : null}
          {!hideButtons && (
            <div className="mt-3">
              <Quantity
                size="sm"
                value={quantity}
                handleChange={handleChange}
                increase={() => increaseQuantity(1)}
                decrease={() => increaseQuantity(-1)}
              />
            </div>
          )}
        </div>
        {!hideButtons && (
          <button className="flex" onClick={handleRemove}>
            <svg
              fill="none"
              className="w-4 h-4"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        )}
      </div>
    </li>
  );
};
