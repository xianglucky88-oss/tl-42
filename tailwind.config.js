/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        wood: {
          DEFAULT: "#5C4033",
          light: "#7A523D",
          dark: "#3D2A22",
        },
        amber: {
          DEFAULT: "#D4A574",
          light: "#E8C49A",
          dark: "#B8895A",
        },
        wallpaper: {
          DEFAULT: "#2D4A3E",
          light: "#3D5E4F",
          dark: "#1E332B",
        },
        wall: {
          DEFAULT: "#E8DCC4",
          light: "#F5EED9",
          dark: "#D4C7A8",
        },
        carpet: {
          DEFAULT: "#8B2635",
          light: "#A33D4D",
          dark: "#6B1B27",
        },
        "dark-gray": {
          DEFAULT: "#3A3A3A",
          light: "#5A5A5A",
          dark: "#2A2A2A",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E0BA3D",
          dark: "#A6851E",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
      },
      borderRadius: {
        none: "0",
      },
      boxShadow: {
        none: "none",
        pixel: "4px 4px 0 0 #3A3A3A",
        "pixel-lg": "8px 8px 0 0 #3A3A3A",
      },
      borderWidth: {
        pixel: "4px",
      },
    },
  },
  plugins: [],
};
