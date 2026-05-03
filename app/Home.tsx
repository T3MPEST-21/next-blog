"use client";

import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Card from "@/components/Card";
import Footer from "@/components/footer";
import { BlogTypes } from "../types/BlogTypes";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = userRouter();
  const [loading, setLoading] = useState(true);
  const [allBlog, setAllBlog] = useState<BlogTypes[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const getAllBlogData = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/proxy", {
        endpoint: "getallblogdata",
        payload: null,
        method: "POST",
        token: null,
      });

      // console.log(response.data);
      setLoading(false);
      const status = response.data?.status;

      if (status === 200) {
        setAllBlog(response.data.allBlog);
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
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      <Footer />
    </div>
  );
}
