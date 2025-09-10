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

const initialState = {
  posts: [], // All posts
  currentPost: null,
  loading: false,
  error: null,
  comments: [],
  newComment: [],
};

export const postReducer = (state = initialState, action) => {
  switch (action.type) {
    // Handle all request actions
    case CREATE_POST_REQUEST:
    case GET_ALL_POST_REQUEST:
    case DELETE_POST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    // Handle success cases
    case CREATE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        currentPost: action.payload,
        posts: [action.payload, ...state.posts],
      };

    case GET_ALL_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        posts: action.payload,
        comments: action.payload.flatMap((post) => post.comments || []), // flatten all comments from all posts
      };

    case DELETE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        posts: state.posts.filter((post) => post.id !== action.payload),
      };

    // Handle failure cases
    case CREATE_POST_FAILURE:
    case GET_ALL_POST_FAILURE:
    case DELETE_POST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};