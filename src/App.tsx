import "./App.css";

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";

import Layout from "./pages/Layout";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="min-h-screen w-full">
          <Layout />
        </div>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
