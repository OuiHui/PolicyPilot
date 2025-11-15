
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { LocalDataProvider } from "./context/LocalDataContext";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <LocalDataProvider>
      <App />
    </LocalDataProvider>
  );
  