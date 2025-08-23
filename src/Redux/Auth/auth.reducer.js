import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  GET_PROFILE_REQUEST,
  LOGOUT,
} from "./auth.action.Type";

const initialState = {
  jwt: localStorage.getItem("jwt"), // Initialize from localStorage
  error: null,
  loading: false,
  user: null,
  searchUser: [],
  isAuthenticated: false,
  lastAction: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case GET_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        lastAction: action.type,
      };

    case GET_PROFILE_SUCCESS:
      return { ...state, user: action.payload, loading: false, error: null };
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      console.log(" Auth success, token received");
      return {
        ...state,
        jwt: action.payload,
        isAuthenticated: true, // Immediately set authenticated
        loading: false,
        error: null,
        lastAction: action.type,
      };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
    case GET_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        lastAction: action.type,
      };

    case LOGOUT:
      localStorage.removeItem("jwt"); // Clear from storage
      return {
        ...initialState,
        jwt: null,
        isAuthenticated: false,
        lastAction: action.type,
      };

    default:
      return state;
  }
};
