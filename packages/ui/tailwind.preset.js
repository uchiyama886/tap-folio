/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
        },
      },
      spacing: {
        "touch-target": "48px",
      },
      // minHeight/minWidth は spacing を自動継承しないため明示的に追加
      // （タップ領域 48px を min-h-touch-target / min-w-touch-target で使えるようにする）
      minHeight: {
        "touch-target": "48px",
      },
      minWidth: {
        "touch-target": "48px",
      },
    },
  },
  plugins: [],
};
