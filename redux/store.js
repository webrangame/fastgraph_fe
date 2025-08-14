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
import authReducer from '@/redux/slice/authSlice';
import cartReducer from '@/redux/reducer/CartReducer';
import workflowReducer from '@/redux/slice/workflowSlice';
import { authApi } from '../lib/api/authApi';
import { categoryApi } from '@/redux/api/category/categoryApi';
import { lessonApi } from '@/redux/api/lesson/lessonApi';
import { courseApi } from '@/redux/api/course/courseApi';
import { autoOrchestrateApi } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';



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
  [categoryApi.reducerPath]: categoryApi.reducer,
  [lessonApi.reducerPath]: lessonApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
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
    }).concat(authApi.middleware, categoryApi.middleware , lessonApi.middleware , courseApi.middleware, autoOrchestrateApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(Store);
