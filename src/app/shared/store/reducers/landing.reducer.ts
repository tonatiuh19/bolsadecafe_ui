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
          id_user: user.bdec_user_id,
          email: user.bdec_user_email,
          email_verified: user.bdec_email_verified,
          picture: user.bdec_user_picture,
          name: user.bdec_user_name,
          last_name: user.bdec_user_last_name,
          stripe_id: user.bdec_user_stripe_id,
          phone: user.bdec_user_phone,
          isLoggedIn: true,
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
  })
);
