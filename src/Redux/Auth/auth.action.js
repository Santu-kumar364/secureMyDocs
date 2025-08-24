import { API_BASE_URL } from "../../config/Api";
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
} from "./auth.action.Type";
import axios from "axios";

export const loginUserAction = (loginData) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const { data } = await axios.post(`${API_BASE_URL}auth/signin`, loginData);

    if (data.token || data.jwt) {
      localStorage.setItem("jwt", data.token || data.jwt);
    }

    console.log("Login success:", data);
    dispatch({ type: LOGIN_SUCCESS, payload: data.token || data.jwt });
  } catch (error) {
    console.error(
      "Login error:",
      error.response ? error.response.data : error.message
    );
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};

export const registerUserAction = (registerData) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });
    const { data } = await axios.post(
      `${API_BASE_URL}auth/signup`,
      registerData
    );

    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
    }
    console.log("Register success:", data);
    dispatch({ type: REGISTER_SUCCESS, payload: data.jwt });
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    dispatch({
      type: REGISTER_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const getProfileAction = (jwt) => async (dispatch) => {
  try {
    dispatch({ type: GET_PROFILE_REQUEST });
    const { data } = await axios.get(`${API_BASE_URL}api/users/profile`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("profile_ _ _ _ ", data);
    dispatch({ type: GET_PROFILE_SUCCESS, payload: data });
  } catch (error) {
    console.log("_ _ _ _ _ _", error);
    dispatch({ type: GET_PROFILE_FAILURE, payload: error });
  }
};

export const logoutAction = () => (dispatch) => {
  localStorage.removeItem("jwt");
  dispatch({ type: "LOGOUT", payload: "User logged out" }); // Use consistent type
};


 