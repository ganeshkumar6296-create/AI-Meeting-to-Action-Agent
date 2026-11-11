import './globals.css';

export const metadata = {
  title: 'AI Meeting-to-Action Agent',
  description: 'Extract decisions, tasks, deadlines and contradictions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}