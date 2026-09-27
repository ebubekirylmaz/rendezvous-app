"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAppointment, getAvailableSlotsAction } from "@/actions/appointments";
import type { ServiceData } from "@/lib/data";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function NewAppointmentDialog({
  businessId,
  services,
  trigger,
}: {
  businessId: string;
  services: ServiceData[];
  trigger: React.ReactElement;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [slotsQuery, setSlotsQuery] = useState<{ key: string; available: string[]; booked: string[] }>({
    key: "",
    available: [],
    booked: [],
  });

  const slotsKey = open && serviceId && date ? `${serviceId}:${date}` : "";
  const loadingSlots = Boolean(slotsKey) && slotsQuery.key !== slotsKey;
  const slots = loadingSlots ? { available: [] as string[], booked: [] as string[] } : slotsQuery;

  useEffect(() => {
    if (!slotsKey) return;
    let cancelled = false;
    getAvailableSlotsAction(businessId, serviceId, date).then((res) => {
      if (!cancelled) setSlotsQuery({ key: slotsKey, ...res });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsKey]);

  function reset() {
    setServiceId(services[0]?.id ?? "");
    setDate(todayISO());
    setTime("");
    setName("");
    setPhone("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId || !time) {
      toast.error("Please select a service and a time.");
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment({
        businessId,
        serviceId,
        date,
        time,
        customerName: name,
        customerPhone: phone,
      });
      toast.success("Appointment added.");
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apt-service">Service</Label>
            <select
              id="apt-service"
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setTime("");
              }}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.durationMinutes} min · ${s.price}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apt-date">Date</Label>
            <input
              id="apt-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apt-time">Time</Label>
            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">Checking availability…</p>
            ) : (
              <select
                id="apt-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
              >
                <option value="">Select a time</option>
                {slots.available.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            )}
            {!loadingSlots && slots.available.length === 0 && (
              <p className="text-xs text-muted-foreground">No available times for this day.</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apt-name">Customer Name</Label>
            <Input id="apt-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apt-phone">Phone</Label>
            <Input id="apt-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting || !time} className="rounded-full">
              {submitting ? "Saving…" : "Add Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
