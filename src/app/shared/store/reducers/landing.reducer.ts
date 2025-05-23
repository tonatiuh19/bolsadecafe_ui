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

  on(LandingActions.getUserName, (state: LandingState, { username }: any) => {
    return {
      ...state,
      checkingUser: {
        userName: '',
        userNameInput: username,
        isLoading: true,
      },
    };
  }),
  on(LandingActions.getUserNameSuccess, (state: LandingState, { userName }) => {
    return {
      ...state,
      /*checkingUser: {
        ...state.checkingUser,
        userName: userName,
        isLoading: false,
      },*/
    };
  }),
  on(
    LandingActions.getUserNameFailure,
    (state: LandingState, { errorResponse }) => {
      return {
        ...state,
        checkingUser: {
          userName: '',
          isLoading: false,
        },
        isError: true,
      };
    }
  ),
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
        user: user,
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
  })
);
