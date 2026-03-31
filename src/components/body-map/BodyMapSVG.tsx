"use client";

import React, { useState } from "react";
import { getPainColor } from "@/lib/utils";
import type { PainMapData } from "@/types";

interface BodyRegion {
  id: string;
  label: string;
  frontPath?: string;
  backPath?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  type: "ellipse" | "rect";
  view: "front" | "back" | "both";
}

const BODY_REGIONS: BodyRegion[] = [
  // Front regions
  { id: "head", label: "Cabeza", cx: 100, cy: 28, rx: 20, ry: 22, type: "ellipse", view: "front" },
  { id: "neck", label: "Cuello", x: 90, y: 50, width: 20, height: 14, type: "rect", view: "front" },
  { id: "chest", label: "Pecho", x: 68, y: 75, width: 64, height: 50, type: "rect", view: "front" },
  { id: "abdomen", label: "Abdomen", x: 72, y: 126, width: 56, height: 38, type: "rect", view: "front" },
  { id: "left_shoulder", label: "Hombro Izq", x: 40, y: 72, width: 28, height: 28, type: "rect", view: "front" },
  { id: "right_shoulder", label: "Hombro Der", x: 132, y: 72, width: 28, height: 28, type: "rect", view: "front" },
  { id: "left_arm", label: "Brazo Izq", x: 32, y: 100, width: 22, height: 44, type: "rect", view: "front" },
  { id: "right_arm", label: "Brazo Der", x: 146, y: 100, width: 22, height: 44, type: "rect", view: "front" },
  { id: "left_forearm", label: "Antebrazo Izq", x: 24, y: 144, width: 20, height: 40, type: "rect", view: "front" },
  { id: "right_forearm", label: "Antebrazo Der", x: 156, y: 144, width: 20, height: 40, type: "rect", view: "front" },
  { id: "left_hand", label: "Mano Izq", x: 18, y: 184, width: 22, height: 22, type: "rect", view: "front" },
  { id: "right_hand", label: "Mano Der", x: 160, y: 184, width: 22, height: 22, type: "rect", view: "front" },
  { id: "left_hip", label: "Cadera Izq", x: 72, y: 164, width: 26, height: 28, type: "rect", view: "front" },
  { id: "right_hip", label: "Cadera Der", x: 102, y: 164, width: 26, height: 28, type: "rect", view: "front" },
  { id: "left_thigh", label: "Muslo Izq", x: 70, y: 192, width: 28, height: 48, type: "rect", view: "front" },
  { id: "right_thigh", label: "Muslo Der", x: 102, y: 192, width: 28, height: 48, type: "rect", view: "front" },
  { id: "left_knee", label: "Rodilla Izq", cx: 84, cy: 252, rx: 14, ry: 12, type: "ellipse", view: "front" },
  { id: "right_knee", label: "Rodilla Der", cx: 116, cy: 252, rx: 14, ry: 12, type: "ellipse", view: "front" },
  { id: "left_calf", label: "Pantorrilla Izq", x: 72, y: 264, width: 24, height: 44, type: "rect", view: "front" },
  { id: "right_calf", label: "Pantorrilla Der", x: 104, y: 264, width: 24, height: 44, type: "rect", view: "front" },
  { id: "left_foot", label: "Pie Izq", x: 66, y: 308, width: 28, height: 18, type: "rect", view: "front" },
  { id: "right_foot", label: "Pie Der", x: 106, y: 308, width: 28, height: 18, type: "rect", view: "front" },
  // Back regions
  { id: "upper_back", label: "Espalda Alta", x: 68, y: 75, width: 64, height: 40, type: "rect", view: "back" },
  { id: "lower_back", label: "Zona Lumbar", x: 72, y: 116, width: 56, height: 48, type: "rect", view: "back" },
  { id: "left_ankle", label: "Tobillo Izq", cx: 84, cy: 316, rx: 12, ry: 8, type: "ellipse", view: "back" },
  { id: "right_ankle", label: "Tobillo Der", cx: 116, cy: 316, rx: 12, ry: 8, type: "ellipse", view: "back" },
];

interface BodyMapSVGProps {
  painData?: PainMapData;
  onBodyPartClick: (bodyPart: string, label: string) => void;
}

export function BodyMapSVG({ painData = {}, onBodyPartClick }: BodyMapSVGProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [hovered, setHovered] = useState<string | null>(null);

  const visibleRegions = BODY_REGIONS.filter((r) => r.view === view || r.view === "both");

  function getRegionFill(id: string): string {
    const pain = painData[id];
    if (!pain) return hovered === id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)";
    const color = getPainColor(pain);
    return hovered === id ? color + "cc" : color + "88";
  }

  function getRegionStroke(id: string): string {
    const pain = painData[id];
    if (hovered === id) return "#f97316";
    if (!pain) return "rgba(255,255,255,0.15)";
    return getPainColor(pain);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => setView("front")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            view === "front" ? "bg-orange-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          Frontal
        </button>
        <button
          onClick={() => setView("back")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            view === "back" ? "bg-orange-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          Posterior
        </button>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 200 340"
          className="w-48 h-auto select-none"
          aria-label={`Mapa corporal vista ${view === "front" ? "frontal" : "posterior"}`}
        >
          {/* Body outline silhouette */}
          <g opacity="0.15">
            <ellipse cx="100" cy="28" rx="20" ry="22" fill="white" />
            <rect x="88" y="50" width="24" height="14" rx="4" fill="white" />
            <rect x="44" y="64" width="112" height="100" rx="12" fill="white" />
            <rect x="28" y="72" width="28" height="110" rx="8" fill="white" />
            <rect x="144" y="72" width="28" height="110" rx="8" fill="white" />
            <rect x="62" y="164" width="76" height="32" rx="6" fill="white" />
            <rect x="60" y="195" width="34" height="130" rx="8" fill="white" />
            <rect x="106" y="195" width="34" height="130" rx="8" fill="white" />
          </g>

          {/* Clickable regions */}
          {visibleRegions.map((region) => {
            const commonProps = {
              key: region.id,
              fill: getRegionFill(region.id),
              stroke: getRegionStroke(region.id),
              strokeWidth: hovered === region.id ? 1.5 : 0.8,
              className: "cursor-pointer transition-all duration-150",
              onClick: () => onBodyPartClick(region.id, region.label),
              onMouseEnter: () => setHovered(region.id),
              onMouseLeave: () => setHovered(null),
              role: "button",
              "aria-label": region.label,
            };

            if (region.type === "ellipse") {
              return (
                <ellipse
                  {...commonProps}
                  cx={region.cx}
                  cy={region.cy}
                  rx={region.rx}
                  ry={region.ry}
                />
              );
            }
            return (
              <rect
                {...commonProps}
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                rx="4"
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none shadow-lg">
            {BODY_REGIONS.find((r) => r.id === hovered)?.label}
            {painData[hovered] && ` — Dolor: ${painData[hovered]}/10`}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          <span>Leve (1-3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <span>Moderado (4-6)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <span>Severo (7-10)</span>
        </div>
      </div>
    </div>
  );
}
