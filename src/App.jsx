import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Authentication from "./webpages/Authentication/Authentication";
import HomePages from "./webpages/HomePage.jsx/HomePage";
import { getProfileAction } from "./Redux/Auth/auth.action";
import { Route, Routes } from "react-router-dom";

function App() {
  const auth = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

  useEffect(() => {
    // Only attempt to get profile if we have a JWT but no user data
    if (jwt && !auth.user && !hasAttemptedAuth) {
      setHasAttemptedAuth(true);
      dispatch(getProfileAction(jwt))
        .catch((error) => {
          console.error("Failed to get profile:", error);
          localStorage.removeItem("jwt");
        });
    }
  }, [dispatch, jwt, auth.user, hasAttemptedAuth]);

  // Show loading state while checking authentication
  if (jwt && !auth.user && !auth.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/*"
        element={auth.user ? <HomePages /> : <Authentication />}
      />
       
    </Routes>
  );
}

export default App;