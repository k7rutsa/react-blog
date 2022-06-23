import "./Blog.css";
import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { AuthContext } from "../context/AuthContext";
import loader from "../loader.jpg";
import { v4 as uuidv4 } from "uuid";
import { AiFillDelete } from "react-icons/ai";

const Blog = () => {
  let { id } = useParams();
  let [post, setpost] = useState();
  let [like, setlike] = useState(null);
  let [usercomments, setusercomments] = useState(null);

  let userState = useContext(AuthContext);
  let navigate = useNavigate();
  let [loading, setloading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "posts", id), (doc) => {
      if (doc.exists()) {
        setpost(doc.data());
        setusercomments(doc.data().comments);
        setloading(true);
      } else {
        console.log("No such document!");
      }

      return () => {
        unsub();
      };
    });

    // getsingledoc();
  }, []);

  // let getsingledoc = async () => {
  //   const docRef = doc(db, "posts", id);
  //   const docSnap = await getDoc(docRef);

  //   if (docSnap.exists()) {
  //     setpost(docSnap.data());
  //     setusercomments(docSnap.data().comments);
  //     setloading(true);
  //   } else {
  //     console.log("No such document!");
  //   }
  // };

  let handlecomment = (e) => {
    e.preventDefault();

    try {
      async function updatedoc() {
        const docRef = await updateDoc(doc(db, "posts", id), {
          comments: arrayUnion({
            comment: e.target[0].value,
            userid: userState.uid,
            commentid: uuidv4(),
            email: userState.email,
            username: userState.displayName,
          }),
        });
      }
      updatedoc();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  let deleteComment = (c) => {
    try {
      async function updatedoc() {
        const docRef = await updateDoc(doc(db, "posts", id), {
          comments: arrayRemove(c),
        });
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
              </div>{" "}
              <hr />
              <div className="comments">
                <ul>
                  {usercomments != null &&
                    usercomments.map((c) => {
                      return (
                        <li key={c.commentid}>
                          <strong>{c.username}</strong> commented: {c.comment}
                          {userState?.uid == c.userid ? (
                            <span onClick={() => deleteComment(c)}>
                              <AiFillDelete
                                style={{
                                  fontSize: "2rem",
                                  verticalAlign: "text-bottom",
                                  color: "#e84545",
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                </ul>

                {userState != null ? (
                  <>
                    <h1 style={{ color: "#000", margin: "2rem" }}>
                      Write a comment
                    </h1>
                    <form onSubmit={handlecomment}>
                      <label htmlFor="comment"></label>

                      <textarea
                        id="comment"
                        name="comment"
                        placeholder="Write comments here..."
                        required
                      ></textarea>
                      <button type="submit">Post Comment</button>
                    </form>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    style={{
                      backgroundColor: "#E84545",
                      margin: "2rem",
                      display: "inline-block",
                      width: "max-content",
                    }}
                  >
                    Login to comment
                  </Link>
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
