import "./Profile.css";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  let userState = useContext(AuthContext);

  return (
    <div className="profile-page">
      <div className="profile-items">
        <img src={userState?.photoURL} />
        <i>Username: {userState?.displayName}</i>
        <i>Email: {userState?.email}</i>
      </div>
    </div>
  );
};

export default Profile;
