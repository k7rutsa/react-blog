import "./Addpost.css";
import React, { useContext, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase.js";
import { AuthContext } from "../context/AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const Addpost = () => {
  let [title, settitle] = useState();
  let [content, setcontent] = useState();
  let [postimage, setpostimage] = useState();
  let [btndisabled, setbtndisabled] = useState(false);
  let navigate = useNavigate();

  let userState = useContext(AuthContext);

  let handlefile = (e) => {
    let file = e.target.files[0];

    if (!file.type.includes("image")) {
      alert("Uploaded image must be an image");
      return;
    }
    if (file.size > 500000) {
      alert("Uploaded image size must be less than 500kb");
      return;
    }

    setpostimage(file);
  };

  let handleaddpost = (e) => {
    e.preventDefault();

    console.log(postimage);
    if (postimage) {
      // upload profile image
      const storageRef = ref(
        storage,
        `postsimages/${userState.uid}/${userState.uid}-${postimage.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, postimage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setbtndisabled(true);
          if (progress > 99) {
            setbtndisabled(false);
          }
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
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            // Add post
            // setpostimageURL(downloadURL);
            let docRef = await addDoc(collection(db, "posts"), {
              title: title,
              content: content,
              postimage: downloadURL,
              useid: userState.uid,
              author: userState.displayName,
              likes: [],
              timestamp: serverTimestamp(),
              comments: [],
            });

            navigate("/");
          });
        }
      );
    }
  };

  return (
    <div className="addpost-page">
      <form className="sign-up" onSubmit={handleaddpost}>
        <input
          type="text"
          placeholder="Post Title"
          onChange={(e) => settitle(e.target.value)}
          required
        />
        <textarea
          cols="30"
          rows="10"
          placeholder="Post Contents"
          onChange={(e) => setcontent(e.target.value)}
          required
        ></textarea>
        <label htmlFor="file">
          <span>Post Image</span>
          <input type="file" onChange={handlefile} required />
        </label>
        <button type="submit" disabled={btndisabled}>
          Add Post
        </button>
      </form>
    </div>
  );
};

export default Addpost;
