import { For, JSXElement } from "solid-js";

import { StenoKey, Stroke, strokeHasKey } from "../../steno/stroke";
import { cn } from "../../utils/cn";

type KeyShape = {
  key: StenoKey;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};

// positions in key units, the board is 10 keys wide
const KEYS: KeyShape[] = [
  { key: "#", label: "#", x: 0, y: 0, width: 10, height: 0.45 },
  { key: "S-", label: "S", x: 0, y: 0.6, height: 2 },
  { key: "T-", label: "T", x: 1, y: 0.6 },
  { key: "P-", label: "P", x: 2, y: 0.6 },
  { key: "H-", label: "H", x: 3, y: 0.6 },
  { key: "*", label: "*", x: 4, y: 0.6, height: 2 },
  { key: "-F", label: "F", x: 5, y: 0.6 },
  { key: "-P", label: "P", x: 6, y: 0.6 },
  { key: "-L", label: "L", x: 7, y: 0.6 },
  { key: "-T", label: "T", x: 8, y: 0.6 },
  { key: "-D", label: "D", x: 9, y: 0.6 },
  { key: "K-", label: "K", x: 1, y: 1.6 },
  { key: "W-", label: "W", x: 2, y: 1.6 },
  { key: "R-", label: "R", x: 3, y: 1.6 },
  { key: "-R", label: "R", x: 5, y: 1.6 },
  { key: "-B", label: "B", x: 6, y: 1.6 },
  { key: "-G", label: "G", x: 7, y: 1.6 },
  { key: "-S", label: "S", x: 8, y: 1.6 },
  { key: "-Z", label: "Z", x: 9, y: 1.6 },
  { key: "A-", label: "A", x: 2.4, y: 2.8 },
  { key: "O-", label: "O", x: 3.4, y: 2.8 },
  { key: "-E", label: "E", x: 4.6, y: 2.8 },
  { key: "-U", label: "U", x: 5.6, y: 2.8 },
];

const UNIT = 20;
const GAP = 2;

/**
 * A steno machine diagram. Keys in `stroke` are lit; keys in `mistakes` are
 * shown as errors (pressed but not part of the expected stroke).
 */
export function StenoBoard(props: {
  stroke: Stroke;
  mistakes?: Stroke;
  class?: string;
}): JSXElement {
  return (
    <svg
      viewBox={`0 0 ${10 * UNIT} ${3.8 * UNIT}`}
      class={cn("h-auto w-80 max-w-full", props.class)}
      role="img"
    >
      <For each={KEYS}>
        {(shape) => {
          const lit = () => strokeHasKey(props.stroke, shape.key);
          const mistake = () =>
            strokeHasKey(props.mistakes ?? 0, shape.key) && !lit();
          const width = (shape.width ?? 1) * UNIT - GAP;
          const height = (shape.height ?? 1) * UNIT - GAP;
          return (
            <g>
              <rect
                x={shape.x * UNIT + GAP / 2}
                y={shape.y * UNIT + GAP / 2}
                width={width}
                height={height}
                rx={3}
                class={cn(
                  "fill-sub-alt",
                  lit() && "fill-main",
                  mistake() && "fill-error",
                )}
              ></rect>
              <text
                x={shape.x * UNIT + GAP / 2 + width / 2}
                y={shape.y * UNIT + GAP / 2 + height / 2}
                style={{
                  "text-anchor": "middle",
                  "dominant-baseline": "central",
                  "font-size": shape.key === "#" ? "6px" : "9px",
                }}
                class={cn("fill-sub", (lit() || mistake()) && "fill-bg")}
              >
                {shape.label}
              </text>
            </g>
          );
        }}
      </For>
    </svg>
  );
}
