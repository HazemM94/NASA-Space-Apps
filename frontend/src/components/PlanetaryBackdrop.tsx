"use client";

import React from "react";

export default function PlanetaryBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 3D High-Res Cinematic Earth & Space Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
        }}
      />
      {/* Deep dark multiply overlay to preserve high readability and contrast */}
      <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
      {/* Ambient gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />
      {/* Radial center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-slate-950/90" />
    </div>
  );
}
