import { createAction, props } from '@ngrx/store';

const actor = '[Landing]';

export const getUserName = createAction(
  `${actor} Get User Name`,
  props<{ username: any }>()
);

export const getUserNameSuccess = createAction(
  `${actor} Get User Name Success`,
  props<{ userName: any }>()
);

export const getUserNameFailure = createAction(
  `${actor} Get User Name Failure`,
  props<{ errorResponse: any }>()
);

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
