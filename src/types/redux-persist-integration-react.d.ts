// Type definitions for redux-persist/integration/react
// This resolves the TypeScript error: "Could not find a declaration file for module"

declare module 'redux-persist/integration/react' {
  import * as React from 'react';
  import { Persistor } from 'redux-persist';

  interface PersistGateProps {
    children: React.ReactNode | ((bootstrapped: boolean) => React.ReactNode);
    loading?: React.ReactNode;
    persistor: Persistor;
    onBeforeLift?(): void | Promise<void>;
  }

  class PersistGate extends React.Component<PersistGateProps> {}

  export { PersistGate };
}