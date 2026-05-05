"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import RichTextEditor from "@/components/RichTextEditor";

export default function CreateBlog() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  // Initialize description as an object for Tiptap JSON
  const [description, setDescription] = useState<any>(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    // Validation: check if title exists and description isn't empty
    if (!title || !description) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("/api/proxy", {
        endpoint: "createblog",
        payload: {
          title: title,
          description: description, // This will now send the JSON object
          created_by: 1,
        },
        method: "POST",
      });

      if (response.data.status === 200) {
        router.push("/");
      } else {
        setError("Failed to create blog");
      }
    } catch (err) {
      setError("Error creating blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-5 sm:p-10 md:p-16">
        <div className="rounded-lg shadow-md p-8 border-2 border-gray-300">
          <h1 className="text-4xl font-bold mb-8">Create New Blog</h1>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title"
              className="w-full p-3 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Content
            </label>
            {/* Swapping textarea for the RichTextEditor */}
            <div className="bg-white rounded border border-gray-300">
              <RichTextEditor 
                value={description} 
                onChange={(content: String) => setDescription(content)} 
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create Blog"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}