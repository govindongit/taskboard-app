export default {
  // content tells Tailwind which files to scan for class names
  // Only classes found here get included — keeps the CSS bundle tiny
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
