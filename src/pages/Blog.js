import "./Blog.css";
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { AuthContext } from "../context/AuthContext";
import loader from "../loader.jpg";

const Blog = () => {
  let { id } = useParams();
  let [post, setpost] = useState();
  let [like, setlike] = useState(null);

  let userState = useContext(AuthContext);
  let navigate = useNavigate();
  let [loading, setloading] = useState(false);

  useEffect(() => {
    getsingledoc();
  }, []);

  let getsingledoc = async () => {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setpost(docSnap.data());
      setloading(true);
    } else {
      console.log("No such document!");
    }
  };

  return (
    <>
      {!loading ? (
        <img src={loader} className="loader" />
      ) : (
        <div className="blog-page">
          <article>
            <img src={post?.postimage} />
            <div className="contents">
              <h2>{post?.title}</h2>

              <p>{post?.content}</p>
              <div className="btns">
                {post?.useid === userState?.uid && (
                  <>
                    <button
                      className="delete"
                      onClick={async () => {
                        if (post.useid === userState.uid) {
                          await deleteDoc(doc(db, "posts", id));
                          navigate("/");
                        }
                      }}
                    >
                      DELETE
                    </button>
                    <NavLink to={`/update/${id}`} className="edit">
                      EDIT
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </article>
        </div>
      )}
    </>
  );
};

export default Blog;
