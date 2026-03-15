"use client";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

function Provider({ children }) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      fetch("/api/users", { method: "POST" }).catch((err) =>
        console.error("Error syncing user:", err)
      );
    }
  }, [user, isLoaded]);

  return <div>{children}</div>;
}

export default Provider;
