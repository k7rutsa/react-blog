import "./App.css";
import React, { useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Addpost from "./pages/Addpost";
import Auth from "./pages/Auth";
import Blogs from "./pages/Blogs";
import Notfound from "./pages/Notfound";
import Profile from "./pages/Profile";
import Updatepost from "./pages/Updatepost";
import Blog from "./pages/Blog";

import { signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";

function App() {
  let userState = useContext(AuthContext);
  // console.log(userState);

  let navigate = useNavigate();

  let PageGuard = ({ children }) => {
    return userState ? children : <Navigate to="/" />;
  };

  return (
    <header className="App-header">
      <nav>
        <NavLink to="/">BLOGS</NavLink>

        {!userState && <NavLink to="/auth">LOGIN</NavLink>}

        {userState && (
          <>
            <NavLink to="/addpost">CREATE POST</NavLink>
            <NavLink to="/profile">PROFILE</NavLink>
            <button
              onClick={() => {
                signOut(auth)
                  .then(() => {
                    console.log("Sign-out successful.");
                    navigate("/");
                  })
                  .catch((error) => {
                    console.log("Sign-out not successful.");
                  });
              }}
            >
              <FaSignOutAlt /> LOGOUT
            </button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Blogs />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/addpost"
          element={
            <PageGuard>
              <Addpost />
            </PageGuard>
          }
        />
        <Route
          path="/update/:id"
          element={
            <PageGuard>
              <Updatepost />
            </PageGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <PageGuard>
              <Profile />
            </PageGuard>
          }
        />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </header>
  );
}

export default App;
