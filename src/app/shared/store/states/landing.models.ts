export const DOMAIN = 'https://garbrix.com/bdec/api';

export interface LandingState {
  user: UserModel;
  wizard: WizardModel;
  roastTypes: RoastModel[];
  isLoading?: boolean;
  isError?: boolean;
  errorResponse?: string;
}

export interface UserModel {
  id: number;
  email: string;
  email_verified: number;
  picture: string;
  name: string;
  last_name: string;
  stripe_id: string;
  phone: number;
  isProd: boolean;
  has_subscription: boolean;
  subscription: SubscriptionInfo | null;
  isLoggedIn: boolean;
}

export interface WizardModel {
  roast: RoastModel;
  address: AddressModel;
  recipient: RecipientModel;
  subsType: number;
  wizardStep: number;
  isPaid: boolean;
  isInvalidPayment: boolean;
}

export interface AddressModel {
  address: string;
  extNumber: string;
  intNumber: string;
  reference: string;
  city: string;
  state: string;
  zip: string;
}

export interface RecipientModel {
  name: string;
  phone: string;
}

export interface RoastModel {
  id: number;
  value: string;
  machine: string;
  svg: string;
}

export interface SubscriptionInfo {
  id: number;
  user_id: number;
  type: number;
  stripe_id: string;
  stripe_info: any;
}

export const SubscribtionModel = {};
