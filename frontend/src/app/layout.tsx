import './globals.css';

export const metadata = {
  title: 'Political Manifesto Analyzer',
  description: 'AI-powered insights into political promises.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}