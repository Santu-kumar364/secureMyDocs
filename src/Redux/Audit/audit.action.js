 
import { api } from "../../config/Api";
import {
  GET_AUDIT_LOGS_REQUEST,
  GET_AUDIT_LOGS_SUCCESS,
  GET_AUDIT_LOGS_FAILURE,
  CREATE_AUDIT_LOG_REQUEST,
  CREATE_AUDIT_LOG_SUCCESS,
  CREATE_AUDIT_LOG_FAILURE,
  CLEAR_AUDIT_ERROR
} from "./audit.action.Type";

// Get audit logs for current user
export const getAuditLogsAction = () => async (dispatch) => {
  dispatch({ type: GET_AUDIT_LOGS_REQUEST });
  try {
    const { data } = await api.get("/api/audit-logs");
    dispatch({ type: GET_AUDIT_LOGS_SUCCESS, payload: data });
    return { success: true, data };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to fetch audit logs";
    dispatch({
      type: GET_AUDIT_LOGS_FAILURE,
      payload: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
};

// Create a new audit log entry
export const createAuditLogAction = (logData) => async (dispatch) => {
  dispatch({ type: CREATE_AUDIT_LOG_REQUEST });
  try {
    const { data } = await api.post("/api/audit-logs", logData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch({ type: CREATE_AUDIT_LOG_SUCCESS, payload: data });
    return { success: true, data };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to create audit log";
    dispatch({
      type: CREATE_AUDIT_LOG_FAILURE,
      payload: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
};

// Clear error state
export const clearAuditError = () => ({
  type: CLEAR_AUDIT_ERROR
});