import { configureStore } from "@reduxjs/toolkit";
import plansReducer from "./slices/plansSlice";
import grindTypesReducer from "./slices/grindTypesSlice";
import statesReducer from "./slices/statesSlice";
import authReducer from "./slices/authSlice";
import paymentsReducer from "./slices/paymentsSlice";
import subscriptionWizardReducer from "./slices/subscriptionWizardSlice";
import dashboardReducer from "./slices/dashboardSlice";
import helpReducer from "./slices/helpSlice";
import homeReducer from "./slices/homeSlice";
import adminAuthReducer from "./slices/adminAuthSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    home: homeReducer,
    plans: plansReducer,
    grindTypes: grindTypesReducer,
    states: statesReducer,
    auth: authReducer,
    payments: paymentsReducer,
    subscriptionWizard: subscriptionWizardReducer,
    dashboard: dashboardReducer,
    help: helpReducer,
    adminAuth: adminAuthReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
