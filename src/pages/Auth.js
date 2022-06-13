import "./Auth.css";
import React, { useState, useContext } from "react";
import { BsFillShieldLockFill } from "react-icons/bs";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, storage } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Auth = () => {
  const [authpage, setauthpage] = useState(true);
  const [email, setemail] = useState(null);
  const [password, setpassword] = useState(null);
  const [confirmpassword, setconfirmpassword] = useState(null);
  const [username, setusername] = useState(null);
  const [userpic, setuserpic] = useState(null);

  let navigate = useNavigate();

  let handleSignInform = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigate("/");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
  };

  let handlefile = (e) => {
    let file = e.target.files[0];

    if (!file.type.includes("image")) {
      alert("Selected file is not an image");
      return;
    }

    if (file.size > 200000) {
      alert("Image size cannot be more than 200kb");
      return;
    }

    setuserpic(file);
  };

  let handleSignUpForm = (e) => {
    e.preventDefault();

    if (password !== confirmpassword) {
      alert("Password does'nt match");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // upload profile image
        const storageRef = ref(storage, `images/${user.uid}-${userpic.name}`);
        const uploadTask = uploadBytesResumable(storageRef, userpic);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log("File available at", downloadURL);

              // update username & file
              updateProfile(auth.currentUser, {
                displayName: username,
                photoURL: downloadURL,
              })
                .then(() => {
                  navigate("/");
                })
                .catch((error) => {
                  // An error occurred
                  // ...
                });
            });
          }
        );
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  };

  return (
    <div className="auth-page">
      {authpage && (
        <form className="sign-in" onSubmit={handleSignInform}>
          <BsFillShieldLockFill />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setemail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setpassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
          <span>
            Don't have an account ?{" "}
            <span onClick={() => setauthpage(false)}>Signup</span>
          </span>
        </form>
      )}

      {!authpage && (
        <form className="sign-up" onSubmit={handleSignUpForm}>
          <BsFillShieldLockFill />
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setusername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setemail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setpassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setconfirmpassword(e.target.value)}
            required
          />
          <label htmlFor="file">
            <span>Display Image</span>
            <input type="file" onChange={handlefile} required />
          </label>

          <button>Sign Up</button>
          <span>
            Already have an account ?{" "}
            <span onClick={() => setauthpage(true)}>Signin</span>
          </span>
        </form>
      )}
    </div>
  );
};

export default Auth;
