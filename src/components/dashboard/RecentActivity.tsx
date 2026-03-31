"use client";

import React from "react";
import { ClipboardList, MapPin, Dumbbell, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const activityConfig = {
  evaluation: { icon: ClipboardList, label: "Evaluación", color: "text-blue-400" },
  body_map: { icon: MapPin, label: "Dolor", color: "text-red-400" },
  session: { icon: Dumbbell, label: "Sesión", color: "text-emerald-400" },
  program: { icon: Activity, label: "Programa", color: "text-purple-400" },
};

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (!items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">
            No hay actividad reciente. ¡Comienza tu primera evaluación!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {items.map((item, idx) => {
          const config = activityConfig[item.type];
          const Icon = config.icon;
          const isLast = idx === items.length - 1;

          return (
            <div key={item.id} className="flex items-start gap-3 py-3 relative">
              {!isLast && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-white/5" />
              )}
              <div className={`mt-0.5 p-2 rounded-full bg-white/5 shrink-0 ${config.color}`}>
                <Icon className="size-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  <Badge variant="muted" className="text-[10px] shrink-0">{config.label}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                <p className="text-[10px] text-slate-600 mt-1">{formatRelativeTime(item.timestamp)}</p>
              </div>
              {item.score !== undefined && (
                <span className="text-sm font-bold text-orange-400 tabular-nums shrink-0">{item.score}%</span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
