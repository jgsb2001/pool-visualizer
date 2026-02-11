'use client';

/**
 * Loading overlay shown while the 3D scene is initializing.
 * Used as Suspense fallback for the Canvas.
 */
export function LoadingOverlay() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-primary to-accent-secondary">
      <div className="text-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white mx-auto" />
        <p className="text-sm font-semibold text-white">
          Loading 3D Scene...
        </p>
      </div>
    </div>
  );
}
