import assert from "node:assert";
import { suggestProgression } from "../lib/progression";

const s = (overrides: Partial<Parameters<typeof suggestProgression>[0]> = {}) =>
  suggestProgression({
    name: "Bench",
    repsMin: 6,
    repsMax: 10,
    lastLogs: [{ weight_kg: 60, reps: 10, rir_felt: 1 }],
    ...overrides,
  });

assert.equal(s()!.action, "up", "hit top of range at RIR 1 -> up");
assert.equal(s()!.weight, 62.5, "60 + 2.5 = 62.5");
assert.equal(
  s({ lastLogs: [{ weight_kg: 60, reps: 10, rir_felt: 3 }] })!.action,
  "up",
  "hit top of range even at higher RIR -> up"
);
assert.equal(
  s({ lastLogs: [{ weight_kg: 60, reps: 6, rir_felt: 1 }] })!.action,
  "hold",
  "bottom of range -> hold"
);
assert.equal(
  s({ lastLogs: [{ weight_kg: 60, reps: 4, rir_felt: 2 }] })!.action,
  "down",
  "below range -> down"
);
assert.equal(
  s({ lastLogs: [{ weight_kg: 60, reps: 4, rir_felt: 2 }] })!.weight,
  57.5,
  "60 - 2.5 = 57.5"
);
assert.equal(
  s({ lastLogs: [{ weight_kg: 60, reps: 8, rir_felt: 2 }, { weight_kg: 62.5, reps: 10, rir_felt: 1 }] })!.weight,
  65,
  "top set drives suggestion (62.5 + 2.5)"
);
assert.equal(s({ lastLogs: [{ weight_kg: null, reps: 8, rir_felt: 2 }] }), null, "no weight -> no suggestion");
assert.equal(s({ lastLogs: [] }), null, "no prior logs -> no suggestion");

console.log("progression: all assertions passed");