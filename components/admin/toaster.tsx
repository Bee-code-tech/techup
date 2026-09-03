"use client"

import { Toaster } from "react-hot-toast"

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          maxWidth: "420px",
          padding: "12px 16px",
          borderRadius: "12px",
          fontSize: "15px",
          fontFamily: "inherit",
          textAlign: "center",
        },
      }}
    />
  )
}
