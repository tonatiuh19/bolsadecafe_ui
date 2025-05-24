import { LandingState } from './landing.models';

export const LANDING_FEATURE_KEY = 'landingBolsaDeCafe';

export const initialLandingState: LandingState = {
  user: {
    id_user: 0,
    email: '',
    email_verified: 0,
    picture: '',
    name: '',
    last_name: '',
    stripe_id: '',
    phone: 0,
    isLoggedIn: false,
  },
  wizard: {
    roast: {
      id_product_f_cuerpo_types: 0,
      value: '',
      subtitle: '',
      image_radio: '',
    },
    address: {
      address: '',
      extNumber: '',
      intNumber: '',
      city: '',
      state: '',
      zip: '',
    },
    recipient: {
      name: '',
      phone: '',
    },
    subsType: 0,
    wizardStep: 0,
  },
  isLoading: false,
  isError: false,
};
