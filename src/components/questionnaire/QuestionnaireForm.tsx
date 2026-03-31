"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EvaluationResponse } from "@/types";

interface Question {
  id: string;
  category: string;
  text: string;
  maxScore: number;
  options: { value: number; label: string; color: string }[];
}

const MHQ_QUESTIONS: Question[] = [
  {
    id: "squat", category: "Movilidad Inferior", text: "Sentadilla profunda (rango completo sin compensación)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "hip_hinge", category: "Movilidad Inferior", text: "Bisagra de cadera (Romanian deadlift con control)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "shoulder_flex", category: "Movilidad Superior", text: "Flexión de hombro (elevación sobre cabeza)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "shoulder_rot", category: "Movilidad Superior", text: "Rotación de hombro (prueba mano-espalda)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "single_leg", category: "Estabilidad", text: "Apoyo monopodal (30 segundos sin compensación)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "core_stab", category: "Estabilidad", text: "Estabilidad de core (plancha frontal 60s)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "trunk_rotation", category: "Movilidad", text: "Rotación de tronco (sentado, brazos cruzados)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "push_up", category: "Fuerza", text: "Flexión de brazos (alineación correcta de hombro-cadera-pie)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "ankle_mob", category: "Movilidad Inferior", text: "Dorsiflexión de tobillo (punta de pie a pared ≥10cm)",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor / No puedo", color: "red" },
      { value: 1, label: "Limitación significativa", color: "orange" },
      { value: 2, label: "Limitación leve", color: "yellow" },
      { value: 3, label: "Sin limitación", color: "emerald" },
    ],
  },
  {
    id: "overall_pain", category: "Dolor General", text: "Nivel de dolor general durante actividad física",
    maxScore: 3,
    options: [
      { value: 0, label: "Dolor constante", color: "red" },
      { value: 1, label: "Dolor frecuente", color: "orange" },
      { value: 2, label: "Dolor ocasional", color: "yellow" },
      { value: 3, label: "Sin dolor", color: "emerald" },
    ],
  },
];

const AHQ_QUESTIONS: Question[] = [
  {
    id: "sleep", category: "Recuperación", text: "Calidad del sueño en los últimos 7 días",
    maxScore: 4,
    options: [
      { value: 0, label: "Muy mala (<5h)", color: "red" },
      { value: 1, label: "Mala (5-6h)", color: "orange" },
      { value: 2, label: "Regular (6-7h)", color: "yellow" },
      { value: 3, label: "Buena (7-8h)", color: "lime" },
      { value: 4, label: "Excelente (>8h)", color: "emerald" },
    ],
  },
  {
    id: "energy", category: "Bienestar", text: "Nivel de energía general",
    maxScore: 4,
    options: [
      { value: 0, label: "Sin energía", color: "red" },
      { value: 1, label: "Muy bajo", color: "orange" },
      { value: 2, label: "Moderado", color: "yellow" },
      { value: 3, label: "Alto", color: "lime" },
      { value: 4, label: "Excelente", color: "emerald" },
    ],
  },
  {
    id: "stress", category: "Mental", text: "Nivel de estrés (1=máximo estrés, 4=sin estrés)",
    maxScore: 4,
    options: [
      { value: 0, label: "Estrés extremo", color: "red" },
      { value: 1, label: "Estrés alto", color: "orange" },
      { value: 2, label: "Estrés moderado", color: "yellow" },
      { value: 3, label: "Estrés leve", color: "lime" },
      { value: 4, label: "Sin estrés", color: "emerald" },
    ],
  },
  {
    id: "motivation", category: "Mental", text: "Motivación para entrenar",
    maxScore: 4,
    options: [
      { value: 0, label: "Sin motivación", color: "red" },
      { value: 1, label: "Baja", color: "orange" },
      { value: 2, label: "Moderada", color: "yellow" },
      { value: 3, label: "Alta", color: "lime" },
      { value: 4, label: "Muy alta", color: "emerald" },
    ],
  },
  {
    id: "nutrition", category: "Nutrición", text: "Adherencia a plan nutricional",
    maxScore: 4,
    options: [
      { value: 0, label: "Ninguna", color: "red" },
      { value: 1, label: "Baja (<25%)", color: "orange" },
      { value: 2, label: "Moderada (25-75%)", color: "yellow" },
      { value: 3, label: "Alta (>75%)", color: "lime" },
      { value: 4, label: "Total (100%)", color: "emerald" },
    ],
  },
  {
    id: "hydration", category: "Nutrición", text: "Hidratación diaria",
    maxScore: 4,
    options: [
      { value: 0, label: "Muy poca (<1L)", color: "red" },
      { value: 1, label: "Poca (1-2L)", color: "orange" },
      { value: 2, label: "Adecuada (2-3L)", color: "yellow" },
      { value: 3, label: "Buena (3-4L)", color: "lime" },
      { value: 4, label: "Excelente (>4L)", color: "emerald" },
    ],
  },
  {
    id: "muscle_soreness", category: "Recuperación", text: "Dolor muscular post-entrenamiento (DOMS)",
    maxScore: 4,
    options: [
      { value: 0, label: "Muy severo (>72h)", color: "red" },
      { value: 1, label: "Severo (48-72h)", color: "orange" },
      { value: 2, label: "Moderado (24-48h)", color: "yellow" },
      { value: 3, label: "Leve (<24h)", color: "lime" },
      { value: 4, label: "Sin dolor", color: "emerald" },
    ],
  },
  {
    id: "readiness", category: "Rendimiento", text: "¿Te sientes listo para entrenar al máximo hoy?",
    maxScore: 4,
    options: [
      { value: 0, label: "No, lesionado", color: "red" },
      { value: 1, label: "No, muy cansado", color: "orange" },
      { value: 2, label: "Parcialmente", color: "yellow" },
      { value: 3, label: "Sí, casi listo", color: "lime" },
      { value: 4, label: "100% listo", color: "emerald" },
    ],
  },
];

const optionColorMap: Record<string, string> = {
  red: "border-red-500/40 hover:bg-red-500/10 data-[selected=true]:bg-red-500/20 data-[selected=true]:border-red-500",
  orange: "border-orange-500/40 hover:bg-orange-500/10 data-[selected=true]:bg-orange-500/20 data-[selected=true]:border-orange-500",
  yellow: "border-yellow-500/40 hover:bg-yellow-500/10 data-[selected=true]:bg-yellow-500/20 data-[selected=true]:border-yellow-500",
  lime: "border-lime-500/40 hover:bg-lime-500/10 data-[selected=true]:bg-lime-500/20 data-[selected=true]:border-lime-500",
  emerald: "border-emerald-500/40 hover:bg-emerald-500/10 data-[selected=true]:bg-emerald-500/20 data-[selected=true]:border-emerald-500",
};

interface QuestionnaireFormProps {
  type: "MHQ" | "AHQ";
  onSubmit: (responses: EvaluationResponse[], score: number, notes: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function QuestionnaireForm({ type, onSubmit, isSubmitting }: QuestionnaireFormProps) {
  const questions = type === "MHQ" ? MHQ_QUESTIONS : AHQ_QUESTIONS;
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const answered = Object.keys(responses).length;
  const progress = Math.round((answered / questions.length) * 100);

  const totalMax = questions.reduce((s, q) => s + q.maxScore, 0);
  const totalGained = Object.entries(responses).reduce((s, [id, val]) => {
    const q = questions.find((q) => q.id === id);
    return s + (q ? val : 0);
  }, 0);
  const score = totalMax > 0 ? Math.round((totalGained / totalMax) * 100) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (answered < questions.length) return;
    const responseList: EvaluationResponse[] = Object.entries(responses).map(([questionId, value]) => ({
      questionId,
      value,
      label: questions.find((q) => q.id === questionId)?.options.find((o) => o.value === value)?.label ?? "",
    }));
    await onSubmit(responseList, score, notes);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-400">{answered} de {questions.length} preguntas</span>
        <span className="font-semibold text-orange-400">Score preview: {score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Questions */}
      {questions.map((question, idx) => (
        <Card key={question.id} className={cn("transition-all", responses[question.id] !== undefined && "border-white/20")}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="text-xs text-orange-400/80 font-medium mb-0.5">{question.category}</p>
                <p className="text-sm text-white font-medium">{question.text}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 ml-9">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-selected={responses[question.id] === option.value}
                  onClick={() => setResponses((prev) => ({ ...prev, [question.id]: option.value }))}
                  className={cn(
                    "px-2 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left",
                    optionColorMap[option.color] ?? optionColorMap.emerald,
                    responses[question.id] === option.value ? "text-white" : "text-slate-400"
                  )}
                >
                  <span className="text-lg font-bold block mb-0.5">{option.value}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Notes */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium text-slate-300 block mb-2">Notas adicionales (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Observaciones sobre tu estado físico hoy..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={answered < questions.length || isSubmitting}
        loading={isSubmitting}
      >
        {answered < questions.length
          ? `Responde ${questions.length - answered} pregunta${questions.length - answered !== 1 ? "s" : ""} más`
          : "Enviar Evaluación"}
      </Button>
    </form>
  );
}
