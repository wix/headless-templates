import { productsV3 } from '@wix/stores';

/**
 * Enum for display stock status messages
 */
export enum StockStatusMessage {
  IN_STOCK = 'In Stock',
  AVAILABLE_FOR_PREORDER = 'Available for Pre-Order',
  OUT_OF_STOCK = 'Out of Stock',
}

/**
 * Helper function to map Wix availability status to display message
 */
export function getStockStatusMessage(
  availabilityStatus:
    | productsV3.InventoryAvailabilityStatus
    | productsV3.AvailabilityStatus
    | string
    | undefined,
  isPreOrderEnabled: boolean = false
): StockStatusMessage {
  if (isPreOrderEnabled) {
    return StockStatusMessage.AVAILABLE_FOR_PREORDER;
  }

  switch (availabilityStatus) {
    case productsV3.InventoryAvailabilityStatus.IN_STOCK:
    case productsV3.InventoryAvailabilityStatus.PARTIALLY_OUT_OF_STOCK:
    case productsV3.AvailabilityStatus.IN_STOCK:
      return StockStatusMessage.IN_STOCK;
    case productsV3.InventoryAvailabilityStatus.OUT_OF_STOCK:
    case productsV3.AvailabilityStatus.OUT_OF_STOCK:
      return StockStatusMessage.OUT_OF_STOCK;
    case productsV3.AvailabilityStatus.PREORDER:
      return StockStatusMessage.AVAILABLE_FOR_PREORDER;
    default:
      return StockStatusMessage.OUT_OF_STOCK;
  }
}
