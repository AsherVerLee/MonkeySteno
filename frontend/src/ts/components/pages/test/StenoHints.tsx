import { createMemo, createResource, For, JSXElement, Show } from "solid-js";

import { getConfig } from "../../../config/store";
import { loadDictionary } from "../../../steno/dictionary";
import { getHintWord } from "../../../steno/state";
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
    return dictionary()?.lookup(word);
  });

  return (
    <Show when={enabled()}>
      <div
        data-ui-element="stenoHints"
        class="flex min-h-36 w-full flex-col items-center gap-2 py-6 text-sm text-sub"
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
                  {(stroke) => <StenoBoard stroke={stroke} />}
                </For>
              </div>
              <div class="font-mono text-base text-text">{found().text}</div>
            </>
          )}
        </Show>
      </div>
    </Show>
  );
}
