"use client";

import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Card from "@/components/Card";
import Footer from "@/components/footer";
import { BlogTypes } from "../types/BlogTypes";
import axios from "axios";
import { useRouter } from "next/navigation";
import BlogCard from "@/components/BlogCard";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allBlog, setAllBlog] = useState<BlogTypes[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const getAllBlogData = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/proxy", {
        endpoint: "allblogs",
        payload: null,
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
    }
  };

  useEffect(() => {
    const initialize = async () => {
      getAllBlogData();
    };

    initialize();
  }, []);

  return (
    <div>
      <Hero />
      <div>
        <div className="max-w-screen-xl mx-auto p-5 sm:p-10 md:p-16">
          <Card />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

            {allBlog.map((blog, index)=>(
              <BlogCard key={index} blog={blog} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
