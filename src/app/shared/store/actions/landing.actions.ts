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

export const retrieveSubscription = createAction(
  `${actor} Retrieve Subscription`,
  props<{ stripe_subscription_id: string }>()
);

export const retrieveSubscriptionSuccess = createAction(
  `${actor} Retrieve Subscription Success`,
  props<{ response: any }>()
);

export const retrieveSubscriptionFailure = createAction(
  `${actor} Retrieve Subscription Failure`,
  props<{ error: any }>()
);

export const insertVisitor = createAction(
  `${actor} Insert Visitor`,
  props<{ section: string }>()
);

export const insertVisitorSuccess = createAction(
  `${actor} Insert Visitor Success`,
  props<{ response: any }>()
);
export const insertVisitorFailure = createAction(
  `${actor} Insert Visitor Failure`,
  props<{ error: any }>()
);

//TODO: Remove this when ux is ready
export const deleteUserAndSubscription = createAction(
  `${actor} Delete User and Subscription`,
  props<{ user_id: number }>()
);
export const deleteUserAndSubscriptionSuccess = createAction(
  `${actor} Delete User and Subscription Success`,
  props<{ response: any }>()
);
export const deleteUserAndSubscriptionFailure = createAction(
  `${actor} Delete User and Subscription Failure`,
  props<{ error: any }>()
);
