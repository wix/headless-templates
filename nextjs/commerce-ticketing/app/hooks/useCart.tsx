import { useQuery } from '@tanstack/react-query';
import { useWixClient } from './useWixClient';

export const useCart = () => {
  const wixClient = useWixClient();
  return useQuery(
    ['cart'],
    async () => {
      const { cart } = await wixClient.currentCartV2.getCurrentCart();
      return cart;
    },
    {
      retry: false,
    }
  );
};
