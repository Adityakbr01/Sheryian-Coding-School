import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "@/store";
import App from "@/app/App";
import HapticsProvider from "@/components/provider/HapticsProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HapticsProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1a1a2e",
                color: "#e5e5e5",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#1a1a2e" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#1a1a2e" },
              },
            }}
          />
        </BrowserRouter>
      </HapticsProvider>
    </Provider>
  </React.StrictMode>,
);
