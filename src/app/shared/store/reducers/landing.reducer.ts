import { Action, createReducer, on } from '@ngrx/store';
import {
  initialLandingState,
  LANDING_FEATURE_KEY,
} from '../states/landing.state';
import { LandingActions } from '../actions';
import { createRehydrateReducer } from '../../utils/rehydrate-reducer';
import { LandingState } from '../states/landing.models';

export const LandingReducer = createRehydrateReducer(
  { key: LANDING_FEATURE_KEY },
  initialLandingState,

  on(LandingActions.authenticateUser, (state: LandingState, { user }: any) => {
    return {
      ...state,
      user: user,
      isLoading: true,
    };
  }),
  on(
    LandingActions.authenticateUserSuccess,
    (state: LandingState, { user }: any) => {
      return {
        ...state,
        user: {
          ...state.user,
          id: user.id,
          email: user.email,
          email_verified: user.email_verified,
          picture: user.picture,
          name: user.name,
          last_name: user.last_name,
          stripe_id: user.stripe_id,
          phone: user.phone,
          isLoggedIn: true,
          isProd: user.bdec_environment_is_prod,
          has_subscription: user.has_subscription,
          subscription: user.subscription_info,
        },
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.authenticateUserFailure,
    (state: LandingState, { errorResponse }: any) => {
      return {
        ...state,
        ...initialLandingState,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.logoutUser, (state: LandingState) => {
    return {
      ...state,
      ...initialLandingState,
    };
  }),
  on(LandingActions.setRoast, (state: LandingState, { roast, subsType }) => {
    return {
      ...state,
      wizard: {
        ...state.wizard,
        roast: roast,
        subsType: subsType,
        wizardStep: 2,
      },
    };
  }),
  on(LandingActions.cleanWizard, (state: LandingState) => {
    return {
      ...state,
      wizard: {
        ...initialLandingState.wizard,
      },
    };
  }),
  on(LandingActions.cleanPayment, (state: LandingState) => {
    return {
      ...state,
      wizard: {
        ...state.wizard,
        isPaid: false,
        isInvalidPayment: false,
      },
    };
  }),
  on(
    LandingActions.setAddress,
    (state: LandingState, { address, subsType }) => {
      return {
        ...state,
        wizard: {
          ...state.wizard,
          address: address,
          subsType: subsType,
          wizardStep: 3,
        },
      };
    }
  ),
  on(
    LandingActions.setRecipient,
    (state: LandingState, { recipient, subsType }) => {
      return {
        ...state,
        wizard: {
          ...state.wizard,
          recipient: recipient,
          subsType: subsType,
          wizardStep: 4,
        },
      };
    }
  ),
  on(LandingActions.setWizardStep, (state: LandingState, { subsType }) => {
    return {
      ...state,
      wizard: {
        ...state.wizard,
        subsType: subsType,
      },
    };
  }),
  on(
    LandingActions.attachPaymentMethod,
    (state: LandingState, { paymentMethodId, customerId }) => {
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.attachPaymentMethodSuccess,
    (state: LandingState, { response }: any) => {
      return {
        ...state,
        isLoading: false,
        isError: false,
        wizard: {
          ...state.wizard,
          isInvalidPayment: false,
        },
      };
    }
  ),
  on(
    LandingActions.attachPaymentMethodFailure,
    (state: LandingState, { error }: any) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
        wizard: {
          ...state.wizard,
          isInvalidPayment: true,
        },
        errorResponse: error,
      };
    }
  ),
  on(
    LandingActions.subscribeCustomer,
    (state: LandingState, { customerId, priceId }) => {
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.subscribeCustomerSuccess,
    (state: LandingState, { response }: any) => {
      return {
        ...state,
        isLoading: false,
        isError: false,
        wizard: {
          ...state.wizard,
          isPaid: true,
        },
        user: {
          ...state.user,
          has_subscription: true,
        },
      };
    }
  ),
  on(
    LandingActions.subscribeCustomerFailure,
    (state: LandingState, { error }: any) => {
      return {
        ...state,
        isLoading: false,
        isError: true,

        errorResponse: error,
      };
    }
  ),
  on(
    LandingActions.retrieveSubscription,
    (state: LandingState, { stripe_subscription_id }) => {
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.retrieveSubscriptionSuccess,
    (state: LandingState, { response }: any) => ({
      ...state,
      isLoading: false,
      isError: false,
      user: {
        ...state.user,
        subscription: state.user.subscription
          ? { ...state.user.subscription, stripe_info: response }
          : {
              id: 0,
              user_id: 0,
              type: 0,
              stripe_id: '',
              stripe_info: response,
            },
      },
    })
  ),
  on(
    LandingActions.retrieveSubscriptionFailure,
    (state: LandingState, { error }: any) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
        errorResponse: error,
      };
    }
  ),
  on(LandingActions.getCoffeeRoasts, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
      isError: false,
    };
  }),
  on(
    LandingActions.getCoffeeRoastsSuccess,
    (state: LandingState, { roasts }) => {
      return {
        ...state,
        roastTypes: roasts,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getCoffeeRoastsFailure,
    (state: LandingState, { error }: any) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
        errorResponse: error,
      };
    }
  ),
  on(
    LandingActions.deleteUserAndSubscription,
    (state: LandingState, { user_id }) => {
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.deleteUserAndSubscriptionSuccess,
    (state: LandingState, { response }: any) => {
      return {
        ...state,
        ...initialLandingState,
      };
    }
  ),
  on(
    LandingActions.deleteUserAndSubscriptionFailure,
    (state: LandingState, { error }: any) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
        errorResponse: error,
      };
    }
  )
);
