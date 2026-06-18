// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
export default function Loading() {
  return (
    <div className="min-h-dvh bg-brand-black flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-2 border-brand-border border-t-brand-accent animate-spin"
        role="status"
        aria-label="Cargando..."
      />
    </div>
  )
}
