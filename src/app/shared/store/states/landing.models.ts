export const DOMAIN = 'https://garbrix.com/bdec/api';

export interface LandingState {
  user: UserModel;
  wizard: WizardModel;
  isLoading?: boolean;
  isError?: boolean;
}

export interface UserModel {
  id_user: number;
  email: string;
  email_verified: number;
  picture: string;
  name: string;
  last_name: string;
  stripe_id: string;
  phone: number;
  isLoggedIn: boolean;
}

export interface WizardModel {
  roast: RoastModel;
  address: AddressModel;
  recipient: RecipientModel;
  subsType: number;
  wizardStep: number;
}

export interface AddressModel {
  address: string;
  extNumber: string;
  intNumber: string;
  city: string;
  state: string;
  zip: string;
}

export interface RecipientModel {
  name: string;
  phone: string;
}

export interface RoastModel {
  id_product_f_cuerpo_types: number;
  value: string;
  subtitle: string;
  image_radio: string;
}
