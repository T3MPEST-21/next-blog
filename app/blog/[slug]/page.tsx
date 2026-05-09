"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import TinyEditor from "@/components/TinyEditor";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function BlogDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.slug;

  const [blog, setBlog] = useState<any>(null);
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
        setError("Failed to load blog");
      }
    } catch (err) {
      setError("Error loading blog");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response = await axios.post("/api/proxy", {
        endpoint: "updateblog",
        payload: {
          id: id,
          title: editTitle.trim(),
          description: editDescription.trim(),
        },
        method: "POST",
      });

      if (response.data.status === 200) {
        setBlog(response.data.blog);
        setIsEditing(false);
        setError("");
      } else {
        setError(response.data.message || "Failed to update blog");
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

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const processContent = (html: string) => {
    // Process image tags to ensure they display properly
    let processedHtml = html;
    
    // Fix image src attributes
    processedHtml = processedHtml.replace(
      /<img([^>]*?)src=["']([^"']*?)["']([^>]*?)>/gi,
      (match, beforeSrc, src, afterSrc) => {
        // Handle base64 images
        if (src.startsWith('data:image/')) {
          return `<img${beforeSrc}src="${src}"${afterSrc} style="max-width: 100%; height: auto;" loading="lazy">`;
        }
        
        // Handle relative URLs
        if (src.startsWith('/')) {
          return `<img${beforeSrc}src="${src}"${afterSrc} style="max-width: 100%; height: auto;" loading="lazy">`;
        }
        
        // Handle external URLs
        if (src.startsWith('http')) {
          return `<img${beforeSrc}src="${src}"${afterSrc} style="max-width: 100%; height: auto;" loading="lazy">`;
        }
        
        // Default case - treat as relative
        return `<img${beforeSrc}src="/${src}"${afterSrc} style="max-width: 100%; height: auto;" loading="lazy">`;
      }
    );
    
    return processedHtml;
  };

  return (
    <ProtectedRoute>
      <div>
        <div className="max-w-3xl mx-auto p-5 sm:p-10 md:p-16">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : !blog ? (
            <p className="text-red-500">Blog not found</p>
          ) : (
            <>
              {!isEditing ? (
                <>
                  <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
                  
                  <div 
                    className="prose prose-lg text-gray-100 leading-relaxed mb-8"
                    dangerouslySetInnerHTML={{ __html: processContent(blog.description) }}
                  />

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
                      className="px-6 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
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
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Content</label>
                    <TinyEditor
                      value={editDescription}
                      onChange={setEditDescription}
                      height={400}
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
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
