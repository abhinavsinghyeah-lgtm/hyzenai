import './globals.css';

export const metadata = {
  title: 'Hyzen AI',
  description: 'Personal AI Assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
