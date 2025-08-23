import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./Auth/auth.reducer";
import { postReducer } from "./Post/post.reducer";
import { auditReducer } from "./Audit/audit.reducer";
 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    audit: auditReducer
  },
});