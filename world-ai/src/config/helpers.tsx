import ReactDOM from "react-dom/client";
import Toast from "../components/common/toast";

class Helpers {
  static localhost: string = "http://localhost:8080";
  static server: string = "https://awish-ai.cyberifyportfolio.com/backend";
  static basePath: string = Helpers.localhost;
  static apiUrl: string = `${Helpers.basePath}/api/v1`;

  static authUser: Record<string, any> = JSON.parse(
    localStorage.getItem("user") ?? "{}"
  );

  static serverImage = (name: string): string => {
    return `${Helpers.basePath}/${name}`;
  };

  static getToken = (): string | null => {
    const token = localStorage.getItem("token");
    return token;
  };

  static getItem = (data: string, isJson: boolean = false): any => {
    if (isJson) {
      return JSON.parse(localStorage.getItem(data) ?? "null");
    } else {
      return localStorage.getItem(data);
    }
  };

  static authHeaders = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  static authFileHeaders = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${Helpers.getToken()}`,
    },
  };

  static setItem = (key: string, data: any, isJson: boolean = false): void => {
    if (isJson) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, data);
    }
  };

  static showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
    duration: number = 3000
  ): void => {
    // Create a container for the toast if it doesn't exist
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      document.body.appendChild(toastContainer);
    }

    // Create a div for this specific toast
    const toastMount = document.createElement("div");
    toastContainer.appendChild(toastMount);

    // Render the Toast component
    const root = ReactDOM.createRoot(toastMount);
    root.render(
      <Toast
        message={message}
        variant={type}
        onClose={() => {
          root.unmount();
          toastMount.remove();
        }}
      />
    );

    // Auto-remove after duration
    if (duration) {
      setTimeout(() => {
        root.unmount();
        toastMount.remove();
      }, duration);
    }
  };
}

export default Helpers;
