"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAppointment, getAvailableSlotsAction } from "@/actions/appointments";
import type { BusinessData, ServiceData } from "@/lib/data";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Select Service", "Date & Time", "Contact Info", "Confirmation"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildDateOptions(count = 6) {
  // Every upcoming day is listed; days the business has marked closed simply
  // come back with no available slots from getAvailableSlotsAction.
  const options: { iso: string; label: string; day: string }[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (options.length < count) {
    options.push({
      iso: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`,
      label: String(cursor.getDate()),
      day: DAY_SHORT[cursor.getDay()],
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return options;
}

function formatDateLong(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", weekday: "long" }).format(date);
}

function getServiceIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("hair") || n.includes("cut")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" />
        <line x1="8.5" y1="7.5" x2="19" y2="18" /><line x1="8.5" y1="16.5" x2="19" y2="6" />
      </svg>
    );
  }
  if (n.includes("facial") || n.includes("skin")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.2 6.2l2.3 2.3M15.5 15.5l2.3 2.3M17.8 6.2l-2.3 2.3M8.5 15.5l-2.3 2.3" />
      </svg>
    );
  }
  if (n.includes("mani") || n.includes("pedi") || n.includes("nail")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.8 5.8l2 2M16.2 16.2l2 2M18.2 5.8l-2 2M7.8 16.2l-2 2" />
      </svg>
    );
  }
  if (n.includes("massage")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4C10 4 4 10 4 18c8 0 14-6 16-14z" /><path d="M9 15c3-3 6-5 10-9" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.7 21 3 13.3 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12l-8 8-9-9V4h7l10 10z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 pt-2">
      <div className="flex items-center justify-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary" : "w-1.5 bg-border"
            )}
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Step {step + 1} of 4 &middot; {STEP_LABELS[step]}
      </div>
    </div>
  );
}

export function BookingWizard({ business }: { business: BusinessData }) {
  const [dateOptions] = useState(() => buildDateOptions());
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [dateIndex, setDateIndex] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [slotsQuery, setSlotsQuery] = useState<{ key: string; available: string[]; booked: string[] }>({
    key: "",
    available: [],
    booked: [],
  });

  const service: ServiceData | null = business.services.find((s) => s.id === serviceId) ?? null;
  const selectedDate = dateOptions[dateIndex];
  const slotsKey = service ? `${service.id}:${selectedDate.iso}` : "";
  const loadingSlots = Boolean(service) && slotsQuery.key !== slotsKey;
  const slots = loadingSlots ? { available: [] as string[], booked: [] as string[] } : slotsQuery;

  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    getAvailableSlotsAction(business.id, service.id, selectedDate.iso).then((res) => {
      if (!cancelled) setSlotsQuery({ key: slotsKey, ...res });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsKey]);

  async function handleConfirm() {
    if (!service || !time) return;
    setSubmitting(true);
    try {
      const result = await createAppointment({
        businessId: business.id,
        serviceId: service.id,
        date: selectedDate.iso,
        time,
        customerName: name,
        customerPhone: phone,
      });
      setAppointmentId(result.id);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the appointment, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(0);
    setServiceId(null);
    setTime(null);
    setName("");
    setPhone("");
    setAppointmentId(null);
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background sm:h-auto sm:max-w-[420px] sm:rounded-[28px] sm:shadow-xl sm:my-6 overflow-hidden">
      {step === 0 ? (
        <div className="flex-shrink-0 rounded-b-[28px] bg-gradient-to-br from-[#F3D9DC] to-[#EADCF0] px-6 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground">
              {business.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="font-heading text-xl font-bold leading-tight text-foreground">{business.name}</div>
              <div className="text-[13px] text-muted-foreground">Book Online</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-shrink-0 items-center px-5 pt-5">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground"
            aria-label="Back"
          >
            <BackArrow />
          </button>
          <div className="flex-1 -ml-9 text-center font-heading text-[17px] font-bold text-foreground">
            Book Appointment
          </div>
        </div>
      )}

      <ProgressDots step={step} />

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
        {step === 0 && (
          <div className="flex flex-col gap-3.5">
            <h1 className="font-heading text-[22px] font-bold text-foreground">
              Which service would you like?
            </h1>
            <div className="flex flex-col gap-3">
              {business.services.map((s) => {
                const active = s.id === serviceId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={cn(
                      "relative flex items-center gap-3.5 rounded-[18px] border-[1.5px] px-4 py-3.5 text-left transition-colors",
                      active ? "border-primary bg-secondary" : "border-border bg-card"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]",
                        active ? "bg-[#EDD7DA] text-primary" : "bg-secondary text-primary"
                      )}
                    >
                      {getServiceIcon(s.name)}
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold text-foreground">{s.name}</div>
                      <div className="text-[13px] text-muted-foreground">{s.durationMinutes} min</div>
                    </div>
                    <div className="text-[15px] font-bold text-foreground">${s.price}</div>
                    {active && (
                      <div className="absolute -top-2 right-3 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon />
                      </div>
                    )}
                  </button>
                );
              })}
              {business.services.length === 0 && (
                <p className="text-sm text-muted-foreground">No services available at the moment.</p>
              )}
            </div>
          </div>
        )}

        {step === 1 && service && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 rounded-2xl bg-secondary px-3.5 py-2.5 text-[13px] font-medium text-foreground">
              <div className="flex h-6.5 w-6.5 items-center justify-center rounded-[9px] bg-[#EDD7DA] text-primary">
                {getServiceIcon(service.name)}
              </div>
              {service.name} &middot; {service.durationMinutes} min &middot; ${service.price}
            </div>

            <h1 className="font-heading text-[21px] font-bold text-foreground">
              When would you like to come in?
            </h1>

            <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
              {dateOptions.map((d, i) => (
                <button
                  key={d.iso}
                  onClick={() => setDateIndex(i)}
                  className={cn(
                    "flex h-16 w-14 flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border-[1.5px]",
                    i === dateIndex ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                  )}
                >
                  <div className={cn("text-[11px]", i === dateIndex ? "text-primary-foreground/80" : "text-muted-foreground")}>{d.day}</div>
                  <div className="text-lg font-bold">{d.label}</div>
                </button>
              ))}
            </div>

            <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              Available Times
            </div>

            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <div className="grid grid-cols-4 gap-2.5">
                {slots.available.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-xl border-[1.5px] text-sm font-medium",
                      slot === time
                        ? "border-primary bg-primary text-primary-foreground font-semibold"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    {slot}
                  </button>
                ))}
                {slots.booked.map((slot) => (
                  <div
                    key={slot}
                    className="flex h-10 items-center justify-center rounded-xl bg-muted text-sm font-medium text-muted-foreground line-through"
                  >
                    {slot}
                  </div>
                ))}
                {slots.available.length === 0 && slots.booked.length === 0 && (
                  <p className="col-span-4 text-sm text-muted-foreground">No available times for this day.</p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && service && (
          <div className="flex flex-col gap-4.5">
            <div className="flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-border bg-card p-3.5">
              <div className="flex items-center gap-2 text-[13.5px]">
                <span className="text-primary">{getServiceIcon(service.name)}</span>
                <span>{service.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[13.5px]">
                <span className="text-primary"><CalendarIcon /></span>
                <span>{formatDateLong(selectedDate.iso)}</span>
              </div>
              <div className="flex items-center gap-2 text-[13.5px]">
                <span className="text-primary"><ClockIcon /></span>
                <span>{time}</span>
              </div>
            </div>

            <h1 className="font-heading text-[21px] font-bold text-foreground">Your Contact Info</h1>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-muted-foreground">Full Name</label>
              <div className="flex h-[50px] items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-card px-4">
                <span className="text-muted-foreground"><UserIcon /></span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-muted-foreground">Phone Number</label>
              <div className="flex h-[50px] items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-card px-4">
                <span className="text-muted-foreground"><PhoneIcon /></span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Your appointment will be created with this information, and a confirmation notice will be emailed to the business.
            </p>
          </div>
        )}

        {step === 3 && service && appointmentId && (
          <div className="flex flex-col items-center pt-6">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#F0D8DA] text-primary">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="mt-5 text-center font-heading text-[26px] font-bold text-foreground">
              Your Appointment is Booked!
            </h1>
            <p className="mt-1.5 text-center text-sm text-muted-foreground">
              {business.name} is looking forward to seeing you.
            </p>

            <div className="mt-6 w-full rounded-[18px] bg-card p-4.5 shadow-sm">
              <SummaryRow icon={<span className="text-primary">{getServiceIcon(service.name)}</span>} label="Service" value={service.name} />
              <SummaryRow icon={<CalendarIcon />} label="Date" value={formatDateLong(selectedDate.iso)} />
              <SummaryRow icon={<ClockIcon />} label="Time" value={`${time} · ${service.durationMinutes} min`} />
              <SummaryRow icon={<TagIcon />} label="Price" value={`$${service.price}`} valueClass="text-primary font-bold" />
              <div className="my-1.5 h-px bg-border" />
              <SummaryRow icon={<UserIcon />} label="Full Name" value={name || "—"} />
              <SummaryRow icon={<PhoneIcon />} label="Phone" value={phone || "—"} />
            </div>

            <div className="mt-3.5 flex w-full items-start gap-2.5 rounded-2xl bg-secondary px-3.5 py-3">
              <span className="mt-0.5 flex-shrink-0 text-primary"><ClockIcon /></span>
              <p className="text-xs leading-relaxed text-[#6b5a54]">
                We&apos;ll send you a reminder email 1 day before your appointment.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-border bg-card px-5 pb-6 pt-4">
        {step < 3 && (
          <Button
            size="lg"
            disabled={
              (step === 0 && !service) ||
              (step === 1 && (!time || !slots.available.includes(time))) ||
              (step === 2 && (!name || !phone)) ||
              submitting
            }
            className="h-[52px] w-full rounded-full text-base font-semibold"
            onClick={() => {
              if (step === 2) {
                void handleConfirm();
              } else {
                setStep((s) => s + 1);
              }
            }}
          >
            {step === 2 ? (submitting ? "Saving…" : "Confirm Appointment") : "Continue"}
          </Button>
        )}
        {step === 3 && (
          <div className="flex flex-col items-center gap-2.5">
            <Button size="lg" className="h-[52px] w-full rounded-full text-base font-semibold" onClick={reset}>
              Back to Start
            </Button>
            <button onClick={reset} className="text-[13px] text-muted-foreground underline underline-offset-2">
              Cancel Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("text-sm font-semibold text-foreground", valueClass)}>{value}</div>
    </div>
  );
}
