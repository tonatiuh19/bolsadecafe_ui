export const DOMAIN = 'https://garbrix.com/bdec/api';

export interface LandingState {
  user?: UserModel;
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
  about: string;
  user_name: string;
  categories?: any;
  paymentsTypes?: any;
}
