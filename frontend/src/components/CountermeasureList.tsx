"use client";

import React from "react";
import { CheckSquare, Clock } from "lucide-react";
import { TreatmentTask } from "@/types/astrohealth";

interface CountermeasureListProps {
  tasks: TreatmentTask[];
  onCompleteTask: (taskId: string) => Promise<void>;
}

export default function CountermeasureList({
  tasks,
  onCompleteTask,
}: CountermeasureListProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Allowlisted Countermeasure Schedule
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {tasks.filter((t) => !t.is_completed).length} Pending
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-xs text-slate-400 p-4 bg-slate-950 rounded-lg border border-slate-800">
          No countermeasure tasks scheduled yet. Run a RAG consultation to
          materialize protocol tasks from the allowlisted catalog.
        </p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                task.is_completed
                  ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                  : "bg-slate-950 border-slate-800"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {task.countermeasure_id} • {task.task_type}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {task.title}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{task.instructions}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>
                    Scheduled:{" "}
                    {new Date(task.scheduled_for).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {!task.is_completed && (
                <button
                  type="button"
                  onClick={() => onCompleteTask(task.id)}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0"
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
