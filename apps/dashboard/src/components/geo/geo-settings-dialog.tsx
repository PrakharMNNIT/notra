"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@notra/ui/components/shared/responsive-dialog";
import { Button } from "@notra/ui/components/ui/button";
import { Input } from "@notra/ui/components/ui/input";
import { Label } from "@notra/ui/components/ui/label";
import { Switch } from "@notra/ui/components/ui/switch";
import { Loader2Icon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useGeoSettingsUpsert } from "@/lib/hooks/use-geo";
import type { GeoSettings } from "@/types/geo";

interface GeoSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  settings: GeoSettings | null;
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function GeoSettingsDialog({
  open,
  onOpenChange,
  organizationId,
  settings,
}: GeoSettingsDialogProps) {
  const id = useId();
  const [companyName, setCompanyName] = useState("");
  const [aliases, setAliases] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [enabled, setEnabled] = useState(true);
  const upsert = useGeoSettingsUpsert(organizationId);

  useEffect(() => {
    if (open) {
      setCompanyName(settings?.companyName ?? "");
      setAliases(settings?.aliases.join(", ") ?? "");
      setCompetitors(settings?.competitors.join(", ") ?? "");
      setEnabled(settings?.enabled ?? true);
    }
  }, [open, settings]);

  const handleSave = () => {
    upsert.mutate(
      {
        organizationId,
        companyName: companyName.trim(),
        aliases: parseList(aliases),
        competitors: parseList(competitors),
        enabled,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <ResponsiveDialog onOpenChange={onOpenChange} open={open}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>GEO tracking settings</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            What should AI engines be checked for? Aliases count as mentions
            too.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="space-y-4 px-4 md:px-0">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Company name</Label>
            <Input
              id={`${id}-name`}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Notra"
              value={companyName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-aliases`}>Aliases</Label>
            <Input
              id={`${id}-aliases`}
              onChange={(event) => setAliases(event.target.value)}
              placeholder="usenotra, notra.so (comma separated)"
              value={aliases}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-competitors`}>Competitors to watch</Label>
            <Input
              id={`${id}-competitors`}
              onChange={(event) => setCompetitors(event.target.value)}
              placeholder="Buffer, Hypefury (comma separated)"
              value={competitors}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor={`${id}-enabled`}>Scans enabled</Label>
            <Switch
              checked={enabled}
              id={`${id}-enabled`}
              onCheckedChange={setEnabled}
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button
            disabled={companyName.trim().length === 0 || upsert.isPending}
            onClick={handleSave}
          >
            {upsert.isPending && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Save
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
