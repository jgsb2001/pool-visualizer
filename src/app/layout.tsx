import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pool Tile Visualizer',
  description: '3D photorealistic pool waterline tile visualizer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
