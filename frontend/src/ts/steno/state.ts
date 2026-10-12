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
