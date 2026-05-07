import "./globals.css";

export const metadata = {
  title: "Student Dashboard",
  description: "Full CRUD app with MongoDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
