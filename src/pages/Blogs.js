import "./Blogs.css";
import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import loader from "../loader.jpg";

import { AiOutlineLike, AiFillLike } from "react-icons/ai";

const Blogs = () => {
  const [posts, setposts] = useState([]);
  let userState = useContext(AuthContext);
  let [loading, setloading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "posts"), (doc) => {
      let postsdata = [];

      doc.forEach((doc) => {
        postsdata.push({ ...doc.data(), docid: doc.id });
      });

      setposts(postsdata);
      setloading(true);
    });

    return () => {
      unsub();
    };
  }, []);

  let likeshandle = (docid) => {
    try {
      async function updatedoc() {
        const docRef = await updateDoc(doc(db, "posts", docid), {
          likes: arrayUnion(userState.uid),
        });
        console.log("Updated", userState.uid);
      }
      updatedoc();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  let dislikeshandle = (docid) => {
    try {
      async function updatedoc() {
        const docRef = await updateDoc(doc(db, "posts", docid), {
          likes: arrayRemove(userState.uid),
        });
        console.log("Updated", userState.uid);
      }
      updatedoc();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <>
      {!loading ? (
        <img src={loader} className="loader" />
      ) : (
        <div className="blogs-page">
          {posts.map((post) => {
            return (
              <article key={post.docid}>
                <img src={post?.postimage} />
                <div className="contents">
                  <h2>{post?.title}</h2>
                  <span>
                    ({post?.timestamp.toDate().toDateString()}) By{" "}
                    {post?.author.toUpperCase()}
                  </span>
                  <p>
                    {post?.content.substring(0, 200)}...........{" "}
                    <NavLink className="readmore" to={`/blog/${post?.docid}`}>
                      Read More
                    </NavLink>
                  </p>
                </div>
                <div className="btns">
                  {post?.useid === userState?.uid && (
                    <>
                      <button
                        className="delete"
                        onClick={async () => {
                          if (post.useid === userState.uid) {
                            await deleteDoc(doc(db, "posts", post?.docid));
                          }
                        }}
                      >
                        DELETE
                      </button>
                      <NavLink to={`/update/${post?.docid}`} className="edit">
                        EDIT
                      </NavLink>
                    </>
                  )}{" "}
                  {post?.likes.includes(userState?.uid) ? (
                    <span
                      style={{ color: "black", fontSize: "15px" }}
                      onClick={() => dislikeshandle(post.docid)}
                    >
                      ({post?.likes.length}) <br />
                      <AiFillLike style={{ color: "blue" }} />
                    </span>
                  ) : (
                    <span
                      style={{ color: "black", fontSize: "15px" }}
                      onClick={() => likeshandle(post.docid)}
                    >
                      ({post?.likes.length}) <br />
                      <AiOutlineLike />
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Blogs;
