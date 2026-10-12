import { createMemo, createResource, For, JSXElement, Show } from "solid-js";

import { getConfig } from "../../../config/store";
import { loadDictionary } from "../../../steno/dictionary";
import { getStenoMaxKeys } from "../../../steno/max-keys";
import {
  getCoachState,
  getHintWord,
  getPressedKeys,
} from "../../../steno/state";
import { strokeToString } from "../../../steno/stroke";
import { cn } from "../../../utils/cn";
import { StenoBoard } from "../../common/StenoBoard";

// longer outlines are shown as text only
const MAX_BOARDS = 4;

export function StenoHints(): JSXElement {
  const enabled = () => getConfig.stenoMode !== "off" && getConfig.stenoHints;

  const [dictionary] = createResource(enabled, async (on) =>
    on ? loadDictionary() : undefined,
  );

  const outline = createMemo(() => {
    const word = getHintWord();
    if (word === undefined) return undefined;
    return dictionary()?.lookup(word, getStenoMaxKeys());
  });

  const coaching = () =>
    getConfig.stenoMode === "chord" && getConfig.stenoCoach;

  // which stroke of the outline is next; without the coach only single
  // stroke words can be followed
  const activeBoard = () => (coaching() ? getCoachState().strokeIndex : 0);

  const wrongStroke = () => (coaching() ? getCoachState().wrong : undefined);

  // keys being held win over the last rejected stroke
  const shownKeys = () => {
    const pressed = getPressedKeys();
    if (pressed !== 0) return pressed;
    return wrongStroke() ?? 0;
  };

  return (
    <Show when={enabled()}>
      <div
        data-ui-element="stenoHints"
        class="flex min-h-48 w-full flex-col items-center gap-2 py-6 text-sm text-sub"
      >
        <Show
          when={outline()}
          fallback={
            <Show when={dictionary() !== undefined && getHintWord()}>
              <div>no dictionary entry, fingerspell this word</div>
            </Show>
          }
        >
          {(found) => (
            <>
              <div class="flex flex-wrap justify-center gap-4">
                <For each={found().strokes.slice(0, MAX_BOARDS)}>
                  {(stroke, index) => (
                    <StenoBoard
                      stroke={stroke}
                      mistakes={index() === activeBoard() ? shownKeys() : 0}
                      class={cn(
                        "transition-opacity",
                        index() !== activeBoard() && "opacity-40",
                      )}
                    />
                  )}
                </For>
              </div>
              <div class="font-mono text-xl text-text">{found().text}</div>
              <div class="h-5 font-mono text-error">
                <Show when={wrongStroke()}>
                  {(wrong) => <>you wrote {strokeToString(wrong())}</>}
                </Show>
              </div>
            </>
          )}
        </Show>
      </div>
    </Show>
  );
}
