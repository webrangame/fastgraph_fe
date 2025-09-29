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
import { mcpApi } from './api/mcp/mcpApi';
import { userStatsApi } from './api/userStats/userStatsApi';
import { auditApi } from './api/audit/auditApi';
import { publishApi } from '../src/lib/api/publishApi';



const persistConfig = {
  key: 'root',
  storage: storage, // Use localStorage instead of sessionStorage
  whitelist: ['auth', 'ui'], // Persist auth and UI prefs
  version: 2, // Increment version to trigger migration
  migrate: (state) => {
    console.log('🔄 Redux Persist Migration: Cleaning up old state...', state);
    
    // If state has unexpected keys, return a clean state
    if (state && typeof state === 'object') {
      const expectedKeys = ['auth', 'workflows', 'ui', 'authApi', 'autoOrchestrateApi', 'evolveAgentApi', 'mcpApi', 'userStatsApi', 'auditApi', 'publishApi'];
      const unexpectedKeys = Object.keys(state).filter(key => !expectedKeys.includes(key));
      
      if (unexpectedKeys.length > 0) {
        console.log('🧹 Found unexpected keys, cleaning state:', unexpectedKeys);
        
        // Return a clean state with only expected keys
        const cleanedState = {
          auth: state.auth || { user: null, tokens: null, isAuthenticated: false },
          ui: state.ui || { 
            sidebar: { 
              logWidth: 450, 
              endNodeWidth: 400 
            }, 
            theme: 'light' 
          },
          workflows: state.workflows || { workflows: [], status: 'idle', error: null }
        };
        
        console.log('✅ Cleaned state:', cleanedState);
        return Promise.resolve(cleanedState);
      }
    }
    
    return Promise.resolve(state);
  },
  transforms: [
    // Add a transform to filter out any remaining unexpected keys
    {
      in: (state) => state,
      out: (state) => {
        if (state && typeof state === 'object') {
          const expectedKeys = ['auth', 'workflows', 'ui', 'authApi', 'autoOrchestrateApi', 'evolveAgentApi', 'mcpApi', 'userStatsApi', 'auditApi', 'publishApi'];
          const filteredState = {};
          
          expectedKeys.forEach(key => {
            if (state[key] !== undefined) {
              filteredState[key] = state[key];
            }
          });
          
          // Ensure UI state has proper structure
          if (filteredState.ui && typeof filteredState.ui === 'object') {
            if (!filteredState.ui.sidebar) {
              filteredState.ui.sidebar = { 
                logWidth: 450, 
                endNodeWidth: 400 
              };
            }
          }
          
          return filteredState;
        }
        return state;
      }
    }
  ]
};

const rootReducer = combineReducers({
  auth: authReducer,
  workflows: workflowReducer,
  ui: uiReducer,
  [authApi.reducerPath]: authApi.reducer,
  [autoOrchestrateApi.reducerPath]: autoOrchestrateApi.reducer,
  [evolveAgentApi.reducerPath]: evolveAgentApi.reducer,
  [mcpApi.reducerPath]: mcpApi.reducer,
  [userStatsApi.reducerPath]: userStatsApi.reducer,
  [auditApi.reducerPath]: auditApi.reducer,
  [publishApi.reducerPath]: publishApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, autoOrchestrateApi.middleware, evolveAgentApi.middleware, mcpApi.middleware, userStatsApi.middleware, auditApi.middleware, publishApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(Store);
