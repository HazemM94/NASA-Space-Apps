"use client";

import React from "react";
import { CheckSquare, Clock, Circle } from "lucide-react";
import { TreatmentTask } from "@/types/astrohealth";

interface CountermeasureListProps {
  tasks: TreatmentTask[];
  onCompleteTask: (taskId: string) => Promise<void>;
}

export default function CountermeasureList({
  tasks,
  onCompleteTask,
}: CountermeasureListProps) {
  const pending = tasks.filter((t) => !t.is_completed).length;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white font-grotesk">
            Countermeasure Schedule
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 tabular-nums">
          {pending} Pending
        </span>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Circle className="w-7 h-7 text-slate-800" />
          <p className="text-[11px] font-mono text-slate-600 leading-relaxed">
            Run a RAG consultation to materialize protocol tasks
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-opacity ${
                task.is_completed
                  ? "bg-slate-900/30 border-white/[0.04] opacity-50"
                  : "bg-slate-900/60 border-white/[0.07]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 border border-white/[0.05] text-slate-400">
                    {task.task_type}
                  </span>
                </div>
                <p className="text-xs font-semibold text-white font-grotesk truncate">
                  {task.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{task.instructions}</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] font-mono text-slate-600">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(task.scheduled_for).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {!task.is_completed && (
                <button
                  type="button"
                  onClick={() => onCompleteTask(task.id)}
                  className="shrink-0 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                >
                  Complete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
