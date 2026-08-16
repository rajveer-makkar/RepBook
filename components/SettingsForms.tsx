"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { updateProfile, updateSettings, type ProfileResult } from "@/lib/actions/profile";

const initialState: ProfileResult = {};

export function ProfileForm({
  profile,
}: {
  profile: {
    display_name?: string | null;
    sex?: string | null;
    height_cm?: number | null;
    age?: number | null;
    sleep_hours?: string | null;
    activity?: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label>Display name</Label>
        <Input name="display_name" defaultValue={profile.display_name ?? ""} />
      </div>
      <div>
        <Label>Sex</Label>
        <Select name="sex" defaultValue={profile.sex ?? ""}>
          <option value="">—</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Height (cm)</Label>
          <Input name="height_cm" type="number" defaultValue={profile.height_cm ?? ""} />
        </div>
        <div>
          <Label>Age</Label>
          <Input name="age" type="number" defaultValue={profile.age ?? ""} />
        </div>
      </div>
      <div>
        <Label>Sleep (avg hours)</Label>
        <Select name="sleep_hours" defaultValue={profile.sleep_hours ?? ""}>
          <option value="">—</option>
          {["<5", "5", "6", "7", "8", "9+"].map((s) => (
            <option key={s} value={`${s}h`}>{s}h</option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Activity level</Label>
        <Select name="activity" defaultValue={profile.activity ?? ""}>
          <option value="">—</option>
          {["Under 5k steps", "5-6k", "7-8k", "9-10k", "10k+"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <Button type="submit" loading={pending}>
        Save profile
      </Button>
    </form>
  );
}

export function SettingsForm({ unit }: { unit: string }) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label>Units</Label>
        <Select name="unit" defaultValue={unit}>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </Select>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <Button type="submit" loading={pending}>
        Save units
      </Button>
    </form>
  );
}