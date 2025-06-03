import React from "react";
import {
  ToastContainer as ReactToastifyContainer,
  Slide,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ToastContainerProps {
  className?: string;
  theme?: "light" | "dark" | "colored";
  position?:
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  className = "",
  theme = "light",
  position = "top-right",
}) => {
  return (
    <ReactToastifyContainer
      position={position}
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
      transition={Slide}
      className={className}
      toastClassName="rounded-lg shadow-lg"
      //   bodyClassName="text-sm font-medium"
      progressClassName="bg-gradient-to-r from-blue-500 to-purple-600"
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    />
  );
};

export default ToastContainer;
