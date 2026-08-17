"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Props {
  onSave: (name: string) => void;
  saving?: boolean;
  defaultName?: string;
}

export default function SaveProgramButton({ onSave, saving, defaultName = "My Program" }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Save program
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-40"
        placeholder="Program name"
      />
      <Button onClick={() => onSave(name)} loading={saving} className="w-auto px-4">
        Save
      </Button>
    </div>
  );
}