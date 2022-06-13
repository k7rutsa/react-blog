import "./Updatepost.css";
import React, { useContext, useState, useEffect } from "react";
import { updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase.js";
import { AuthContext } from "../context/AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams } from "react-router-dom";

const Updatepost = () => {
  let [title, settitle] = useState();
  let [content, setcontent] = useState();
  let [postimage, setpostimage] = useState();
  let navigate = useNavigate();
  let { id } = useParams();
  // let [post, setpost] = useState();
  let userState = useContext(AuthContext);

  useEffect(() => {
    getsingledoc();
  }, []);

  let getsingledoc = async () => {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // setpost(docSnap.data());
      settitle(docSnap.data().title);
      setcontent(docSnap.data().content);
    } else {
      console.log("No such document!");
    }
  };

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

    try {
      async function updatedoc() {
        const docRef = await updateDoc(doc(db, "posts", id), {
          title: title,
          content: content,
          useid: userState.uid,
          timestamp: serverTimestamp(),
        });

        navigate("/");

        console.log("Updated");
      }
      updatedoc();
    } catch (e) {
      console.error("Error adding document: ", e);
    }

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
            try {
              const docRef = await updateDoc(doc(db, "posts", id), {
                postimage: downloadURL,
              });

              navigate("/");

              console.log("Updated");
            } catch (e) {
              console.error("Error adding document: ", e);
            }

            navigate("/");
          });
        }
      );
    }
  };

  return (
    <div className="updatepost-page">
      <form className="sign-up" onSubmit={handleaddpost}>
        <input
          type="text"
          placeholder="Post Title"
          onChange={(e) => settitle(e.target.value)}
          value={title}
          required
        />
        <textarea
          cols="30"
          rows="10"
          placeholder="Post Contents"
          onChange={(e) => setcontent(e.target.value)}
          value={content}
          required
        ></textarea>
        <label htmlFor="file">
          <span>Post Image</span>
          <input type="file" onChange={handlefile} />
        </label>
        <button>Update Post</button>
      </form>
    </div>
  );
};

export default Updatepost;
