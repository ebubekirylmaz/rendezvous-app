"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBusinessSettings } from "@/actions/business";
import type { BusinessData } from "@/lib/data";

export function BusinessSettingsForm({ business }: { business: BusinessData }) {
  const router = useRouter();
  const [name, setName] = useState(business.name);
  const [slug, setSlug] = useState(business.slug);
  const [phone, setPhone] = useState(business.phone);
  const [address, setAddress] = useState(business.address);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateBusinessSettings({ name, slug, phone, address });
      toast.success("Business information updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-bold text-foreground">Business Information</h2>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="business-name">Business Name</Label>
          <Input id="business-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="business-slug">Booking Page Link</Label>
          <div className="flex items-center gap-1.5">
            <span className="whitespace-nowrap text-sm text-muted-foreground">bookapp.com/</span>
            <Input
              id="business-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="flex-1"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="business-phone">Phone</Label>
          <Input id="business-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="business-address">Address</Label>
          <Input id="business-address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={submitting} className="mt-5 rounded-full px-6">
        {submitting ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
