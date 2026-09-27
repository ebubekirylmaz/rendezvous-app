"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cancelAppointment } from "@/actions/appointments";
import { NewAppointmentDialog } from "@/components/admin/new-appointment-dialog";
import type { AppointmentData, BusinessData } from "@/lib/data";

const PALETTE = ["#C97B84", "#B9A6CE", "#9CB380", "#D19A6A", "#8FB6C9", "#C9A6C9"];

function renderEventContent(arg: EventContentArg) {
  return (
    <div className="overflow-hidden px-1.5 py-1 leading-tight">
      <div className="truncate text-[11px] font-bold">{arg.event.title}</div>
      <div className="truncate text-[10px] opacity-90">
        {arg.event.extendedProps.serviceName as string}
      </div>
    </div>
  );
}

export function AdminCalendarView({
  business,
  appointments,
}: {
  business: BusinessData;
  appointments: AppointmentData[];
}) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<AppointmentData | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const serviceColors = useMemo(() => {
    const map = new Map<string, string>();
    business.services.forEach((s, i) => map.set(s.id, PALETTE[i % PALETTE.length]));
    return map;
  }, [business.services]);

  const events = useMemo(
    () =>
      appointments.map((apt) => {
        const color = serviceColors.get(apt.serviceId) ?? PALETTE[0];
        return {
          id: apt.id,
          title: apt.customerName,
          start: apt.startTime,
          end: apt.endTime,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { serviceName: apt.serviceName },
        };
      }),
    [appointments, serviceColors]
  );

  function updateTitle() {
    const api = calendarRef.current?.getApi();
    if (api) setTitle(api.view.title);
  }

  function handleEventClick(info: EventClickArg) {
    const appointment = appointments.find((apt) => apt.id === info.event.id) ?? null;
    setSelected(appointment);
  }

  async function handleCancel() {
    if (!selected) return;
    setCancelling(true);
    try {
      await cancelAppointment(selected.id);
      toast.success("Appointment cancelled.");
      setSelected(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-5 md:px-8 md:py-7">
      <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Weekly View</h1>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                calendarRef.current?.getApi().prev();
                updateTitle();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground"
              aria-label="Previous week"
            >
              ‹
            </button>
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <button
              onClick={() => {
                calendarRef.current?.getApi().next();
                updateTitle();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground"
              aria-label="Next week"
            >
              ›
            </button>
          </div>
        </div>
        <NewAppointmentDialog
          businessId={business.id}
          services={business.services.filter((s) => s.active)}
          trigger={
            <Button className="h-11 w-full rounded-full px-5 text-sm font-semibold sm:w-auto">
              + New Appointment
            </Button>
          }
        />
      </div>

      <div className="flex flex-shrink-0 flex-wrap items-center gap-4.5">
        {business.services.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: serviceColors.get(s.id) }} />
            {s.name}
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-full overflow-x-auto">
          <div className="h-full min-w-[720px]">
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              allDaySlot={false}
              nowIndicator
              height="100%"
              slotMinTime="09:00:00"
              slotMaxTime="19:00:00"
              slotDuration="00:30:00"
              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              businessHours={{ daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "19:00" }}
              events={events}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              datesSet={updateTitle}
            />
          </div>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(next) => !next && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-semibold text-foreground">{selected.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-semibold text-foreground">{selected.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-semibold text-foreground">{selected.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold text-foreground">
                  {new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(selected.startTime)}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={cancelling}
              onClick={handleCancel}
              className="rounded-full"
            >
              {cancelling ? "Cancelling…" : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
