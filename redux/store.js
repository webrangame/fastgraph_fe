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
import storage from 'redux-persist/lib/storage';
import authReducer from './slice/authSlice';
import workflowReducer from './slice/workflowSlice';
import uiReducer from './slice/uiSlice';
import { authApi } from '../lib/api/authApi';
import { autoOrchestrateApi } from './api/autoOrchestrate/autoOrchestrateApi';
import { evolveAgentApi } from './api/evolveAgent/evolveAgentApi';
import { userStatsApi } from './api/userStats/userStatsApi';



const persistConfig = {
  key: 'root',
  storage: storage, // Use localStorage instead of sessionStorage
  whitelist: ['auth', 'ui'], // Persist auth and UI prefs
};

const rootReducer = combineReducers({
  auth: authReducer,
  workflows: workflowReducer,
  ui: uiReducer,
  [authApi.reducerPath]: authApi.reducer,
  [autoOrchestrateApi.reducerPath]: autoOrchestrateApi.reducer,
  [evolveAgentApi.reducerPath]: evolveAgentApi.reducer,
  [userStatsApi.reducerPath]: userStatsApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, autoOrchestrateApi.middleware, evolveAgentApi.middleware, userStatsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(Store);
