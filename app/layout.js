export const metadata = {
  title: "CRUD App",
  description: "Next.js + MongoDB CRUD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
        {children}
      </body>
    </html>
  );
}
