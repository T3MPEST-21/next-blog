"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { BlogTypes } from "@/types/BlogTypes";

export default function BlogDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.slug;

  const [blog, setBlog] = useState<BlogTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post("/api/proxy", {
        endpoint: "oneblog",
        payload: { id: id },
        method: "POST",
      });

      if (response.data.status === 200) {
        setBlog(response.data.blog);
        setEditTitle(response.data.blog.title);
        setEditDescription(response.data.blog.description);
      } else {
        setError("Blog not found");
      }
    } catch (err) {
      setError("Error loading blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      
      const response = await axios.post("/api/proxy", {
        endpoint: "updateblog",
        payload: {
          id: id,
          title: editTitle,
          description: editDescription,
        },
        method: "POST",
      });

      if (response.data.status === 200) {
        setBlog(response.data.blog);
        setIsEditing(false);
        setError("");
      } else {
        setError("Failed to update blog");
      }
    } catch (err) {
      setError("Error updating blog");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const response = await axios.post("/api/proxy", {
        endpoint: "deleteblog",
        payload: { id: id },
        method: "POST",
      });

      if (response.data.status === 200) {
        router.push("/");
      } else {
        setError("Failed to delete blog");
      }
    } catch (err) {
      setError("Error deleting blog");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="max-w-3xl mx-auto p-5 sm:p-10 md:p-16">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div>
        <div className="max-w-3xl mx-auto p-5 sm:p-10 md:p-16">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className=" min-h-screen">
        <div className="max-w-4xl mx-auto p-5 sm:p-10 md:p-16">
          <div className="border-2 border-gray-300 rounded-lg shadow-md p-8">
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {!isEditing ? (
              <>
                <img
                  className="w-full h-96 object-cover rounded-lg mb-8"
                  src="https://images.pexels.com/photos/61180/pexels-photo-61180.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                  alt={blog.title}
                />

                <h1 className="text-5xl font-bold mb-4 text-gray-200">{blog.title}</h1>

                <div className="flex gap-6 text-gray-600 mb-8 pb-6 border-b">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">AUTHOR</p>
                    <p className="text-lg font-semibold text-gray-300">{blog.created_by}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">PUBLISHED</p>
                    <p className="text-lg font-semibold text-gray-300">
                      {new Date(blog.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="prose prose-lg text-gray-300 leading-relaxed mb-8">
                  {blog.description}
                </div>

                <div className="flex gap-4 mt-8 pt-8 border-t">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <a
                    href="/"
                    className="px-6 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
                  >
                    Back to blogs
                  </a>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-6">Edit Blog</h2>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded text-gray-700"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={10}
                    className="w-full p-3 border border-gray-300 rounded text-gray-700"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
