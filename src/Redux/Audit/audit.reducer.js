import {
  GET_AUDIT_LOGS_REQUEST,
  GET_AUDIT_LOGS_SUCCESS,
  GET_AUDIT_LOGS_FAILURE,
  CREATE_AUDIT_LOG_REQUEST,
  CREATE_AUDIT_LOG_SUCCESS,
  CREATE_AUDIT_LOG_FAILURE,
  CLEAR_AUDIT_ERROR
} from "./audit.action.Type";

const initialState = {
  logs: [],
  loading: false,
  error: null,
  creating: false,
  createError: null
};

export const auditReducer = (state = initialState, action) => {
  switch (action.type) {
    // Get audit logs cases
    case GET_AUDIT_LOGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_AUDIT_LOGS_SUCCESS:
      return {
        ...state,
        loading: false,
        logs: action.payload,
        error: null
      };

    case GET_AUDIT_LOGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        logs: []
      };

    // Create audit log cases
    case CREATE_AUDIT_LOG_REQUEST:
      return {
        ...state,
        creating: true,
        createError: null
      };

    case CREATE_AUDIT_LOG_SUCCESS:
      return {
        ...state,
        creating: false,
        logs: [action.payload, ...state.logs], // Add new log to beginning of array
        createError: null
      };

    case CREATE_AUDIT_LOG_FAILURE:
      return {
        ...state,
        creating: false,
        createError: action.payload
      };

    // Clear error
    case CLEAR_AUDIT_ERROR:
      return {
        ...state,
        error: null,
        createError: null
      };

    default:
      return state;
  }
};