import "./globals.css";

export const metadata = {
  title: "Student Dashboard",
  description: "Next.js + MongoDB CRUD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
