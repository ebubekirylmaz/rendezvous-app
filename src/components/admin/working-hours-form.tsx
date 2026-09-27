"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateWorkingHours } from "@/actions/business";
import { DAY_KEYS, type DayHours, type DayKey, type WorkingHoursMap } from "@/lib/working-hours";

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function WorkingHoursForm({ initial }: { initial: WorkingHoursMap }) {
  const router = useRouter();
  const [hours, setHours] = useState<WorkingHoursMap>(initial);
  const [submitting, setSubmitting] = useState(false);

  function updateDay(day: DayKey, patch: Partial<DayHours>) {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateWorkingHours(hours);
      toast.success("Working hours updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-bold text-foreground">Working Hours</h2>
      <div className="mt-4 flex flex-col gap-2.5">
        {DAY_KEYS.map((day) => {
          const d = hours[day];
          return (
            <div
              key={day}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/60 px-4 py-2.5"
            >
              <span className="w-24 flex-shrink-0 text-sm font-medium text-foreground">{DAY_LABELS[day]}</span>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={!d.closed}
                  onChange={(e) => updateDay(day, { closed: !e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                Open
              </label>
              {d.closed ? (
                <span className="text-sm text-muted-foreground">Closed</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={d.start}
                    onChange={(e) => updateDay(day, { start: e.target.value })}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="time"
                    value={d.end}
                    onChange={(e) => updateDay(day, { end: e.target.value })}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Button type="submit" disabled={submitting} className="mt-5 rounded-full px-6">
        {submitting ? "Saving…" : "Save Working Hours"}
      </Button>
    </form>
  );
}
