import { createSignal } from "solid-js";

import { Stroke } from "./stroke";

/** The most recent stroke made in chord mode, for the on-screen board. */
export const [getLastStroke, setLastStroke] = createSignal<Stroke | undefined>(
  undefined,
);

/** The test word the hint diagram should show the outline for. */
export const [getHintWord, setHintWord] = createSignal<string | undefined>(
  undefined,
);

/** Keys held down right now in chord mode, before the stroke is released. */
export const [getPressedKeys, setPressedKeys] = createSignal<Stroke>(0);

export type CoachState = {
  /** how many strokes of the current word are done */
  strokeIndex: number;
  /** the stroke that was just rejected, until the next one lands */
  wrong: Stroke | undefined;
};

/** Progress through the current word in coach mode. */
export const [getCoachState, setCoachState] = createSignal<CoachState>({
  strokeIndex: 0,
  wrong: undefined,
});

export function resetCoachState(): void {
  setCoachState({ strokeIndex: 0, wrong: undefined });
}
