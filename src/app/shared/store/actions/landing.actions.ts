import { createAction, props } from '@ngrx/store';
import {
  AddressModel,
  RecipientModel,
  RoastModel,
} from '../states/landing.models';

const actor = '[Landing]';

export const authenticateUser = createAction(
  `${actor} Authenticate User`,
  props<{ user: any }>()
);

export const authenticateUserSuccess = createAction(
  `${actor} Authenticate User Success`,
  props<{ user: any }>()
);

export const authenticateUserFailure = createAction(
  `${actor} Authenticate User Failure`,
  props<{ errorResponse: any }>()
);

export const logoutUser = createAction(`${actor} Logout User`);

export const cleanWizard = createAction(`${actor} Clean Wizard`);

export const setRoast = createAction(
  `${actor} Set Roast`,
  props<{ roast: RoastModel; subsType: number }>()
);

export const setAddress = createAction(
  `${actor} Set Address`,
  props<{ address: AddressModel; subsType: number }>()
);

export const setRecipient = createAction(
  `${actor} Set Recipient`,
  props<{ recipient: RecipientModel; subsType: number }>()
);

export const setWizardStep = createAction(
  `${actor} Set Wizard Step`,
  props<{ subsType: number }>()
);
