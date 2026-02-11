'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

// Dynamic import to prevent SSR of Three.js (requires browser APIs)
const PoolScene = dynamic(
  () => import('@/components/viewer/PoolScene').then((mod) => mod.PoolScene),
  {
    ssr: false,
    loading: () => <LoadingOverlay />,
  },
);

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col md:flex-row">
      {/* Control panel: bottom drawer on mobile, left sidebar on desktop */}
      <div className="order-2 h-[55vh] overflow-y-auto md:order-1 md:h-auto">
        <ControlPanel />
      </div>

      {/* 3D viewer: top on mobile, right side on desktop */}
      <main className="relative order-1 flex-1 md:order-2">
        <Suspense fallback={<LoadingOverlay />}>
          <PoolScene />
        </Suspense>
      </main>
    </div>
  );
}
