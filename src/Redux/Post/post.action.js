import { api } from "../../config/Api";
import {
  CREATE_POST_FAILURE,
  CREATE_POST_REQUEST,
  CREATE_POST_SUCCESS,
  DELETE_POST_FAILURE,
  DELETE_POST_REQUEST,
  DELETE_POST_SUCCESS,
  GET_ALL_POST_FAILURE,
  GET_ALL_POST_REQUEST,
  GET_ALL_POST_SUCCESS,
} from "./post.action.Type";

export const createPostAction = (postData) => async (dispatch) => {
  dispatch({ type: CREATE_POST_REQUEST });
  try {
    const { data } = await api.post("/api/posts", postData);
    dispatch({ type: CREATE_POST_SUCCESS, payload: data });
    console.log("Post created successfully", data);
  } catch (error) {
    console.log("Error creating post", error);
    dispatch({ type: CREATE_POST_FAILURE, payload: error });
  }
};

export const getAllPostAction = () => async (dispatch) => {
  dispatch({ type: GET_ALL_POST_REQUEST });
  try {
    const { data } = await api.get("/api/posts");
    dispatch({ type: GET_ALL_POST_SUCCESS, payload: data });
    return { success: true, data }; // Add return
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    dispatch({
      type: GET_ALL_POST_FAILURE,
      payload: errorMsg,
    });
    return { success: false, error: errorMsg }; // Add return
  }
};

export const deletePostAction = (postId) => async (dispatch) => {
  dispatch({ type: DELETE_POST_REQUEST });
  try {
    await api.delete(`/api/posts/${postId}`);
    dispatch({ type: DELETE_POST_SUCCESS, payload: postId });
    return { success: true };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    dispatch({
      type: DELETE_POST_FAILURE,
      payload: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
};
