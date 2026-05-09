"use client";

import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Footer from "@/components/footer";
import axios from "axios";
import { useRouter } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allBlog, setAllBlog] = useState<Blog[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const getAllBlogData = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/proxy", {
        endpoint: "allblogs",
        payload: {},
        method: "POST",
        token: null,
      });

      console.log(response.data.blogs);
      setLoading(false);
      const status = response.data?.status;

      if (status === 200) {
        setAllBlog(response.data.blogs);
      } else if (status === 201) {
        const backendErrors = response.data?.errors || [];
        if (Array.isArray(backendErrors)) {
          setErrors(backendErrors);
        } else {
          setErrors(["An unknown error occurred"]);
        }
      } else if (status === 401) {
        router.push("../login");
      } else {
        setErrors(["An unknown error occurred"]);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401) {
          router.push("../login");
        }

        console.error("Axios error:", error.response?.data);
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBlogData();
  }, []);

  return (
    <ProtectedRoute>
      <>
        <Hero />
        <div className="max-w-7xl mx-auto sm:px-6 sm:py-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Latest Blog Posts</h2>
              {isAdmin() && (
                <a
                  href="/blog/create"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Blog
                </a>
              )}
            </div>

            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading blogs...</p>
              </div>
            ) : allBlog.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No blogs found. Create your first blog!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allBlog.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </>
    </ProtectedRoute>
  );
}
