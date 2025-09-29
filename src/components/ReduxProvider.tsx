// app/components/ReduxProvider.tsx
'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Store as store, persistor } from '@/redux/store';
import { ReactNode, useEffect } from 'react';
import { Loader } from '@/components/ui/Loader';
import { clearOldReduxState } from '@/utils/clearOldReduxState';

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  // Clear old Redux state on mount
  useEffect(() => {
    clearOldReduxState();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loader message="Loading application..." />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}