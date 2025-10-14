// Utility to clear old Redux state from localStorage
export const clearOldReduxState = () => {
  try {
    // Clear all Redux persist keys
    const keysToRemove = [];
    
    // Check for old Redux persist keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('persist:') || 
        key.includes('redux') ||
        key.includes('customizer') ||
        key.includes('userMaintenace') ||
        key.includes('contacts') ||
        key.includes('creditors') ||
        key.includes('stockItemsFilter') ||
        key.includes('stockItemNavigation') ||
        key.includes('debtors') ||
        key.includes('purchaseOrders') ||
        key.includes('salesOrders') ||
        key.includes('debtorPricePolicyDef') ||
        key.includes('inwardsGoods') ||
        key.includes('creditorAdjustment') ||
        key.includes('grnCosting')
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove old keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ Removed old Redux key:', key);
    });
    
    if (keysToRemove.length > 0) {
      console.log('✅ Cleared', keysToRemove.length, 'old Redux state keys');
    }
    
    return keysToRemove.length;
  } catch (error) {
    console.error('❌ Error clearing old Redux state:', error);
    return 0;
  }
};

// Auto-clear on import (for development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  clearOldReduxState();
}
