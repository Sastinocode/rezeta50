"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.FC<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  accentColor?: "orange" | "emerald" | "blue" | "purple" | "red";
}

const colorMap = {
  orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  red: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  subtitle,
  accentColor = "orange",
}: StatsCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-500";

  return (
    <Card className="animate-fade-in hover:border-white/20 transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
            <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
            {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
          </div>
          <div className={cn("p-2.5 rounded-xl border", colorMap[accentColor])}>
            <Icon className="size-5" />
          </div>
        </div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 mt-3 text-xs font-medium", trendColor)}>
            <TrendIcon className="size-3" />
            <span>
              {change > 0 ? "+" : ""}
              {change}% vs. semana anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
