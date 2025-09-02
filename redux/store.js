import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  REHYDRATE,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
} from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
import authReducer from './slice/authSlice';
import cartReducer from './reducer/CartReducer';
import workflowReducer from './slice/workflowSlice';
import { authApi } from '../lib/api/authApi';
import { autoOrchestrateApi } from './api/autoOrchestrate/autoOrchestrateApi';



const persistConfig = {
  key: 'root',
  storage: sessionStorage,
  whitelist: ['auth', 'cart' , 'workflows'], // Persist auth and cart reducers
};

const rootReducer = combineReducers({
  auth: authReducer,
  CartReducer: cartReducer,
  workflows: workflowReducer,
  [authApi.reducerPath]: authApi.reducer,
  [autoOrchestrateApi.reducerPath]: autoOrchestrateApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, autoOrchestrateApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(Store);
