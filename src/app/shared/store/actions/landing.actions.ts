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

export const cleanPayment = createAction(`${actor} Clean Payment`);

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

export const attachPaymentMethod = createAction(
  `${actor} Attach Payment Method`,
  props<{ paymentMethodId: string; customerId: string }>()
);

export const attachPaymentMethodSuccess = createAction(
  `${actor} Attach Payment Method Success`,
  props<{ response: any }>()
);

export const attachPaymentMethodFailure = createAction(
  `${actor} Attach Payment Method Failure`,
  props<{ error: any }>()
);

export const subscribeCustomer = createAction(
  `${actor} Subscribe Customer`,
  props<{ customerId: string; priceId: string }>()
);

export const subscribeCustomerSuccess = createAction(
  `${actor} Subscribe Customer Success`,
  props<{ response: any }>()
);

export const subscribeCustomerFailure = createAction(
  `${actor} Subscribe Customer Failure`,
  props<{ error: any }>()
);
