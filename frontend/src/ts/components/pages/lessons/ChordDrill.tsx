import {
  createMemo,
  createSignal,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { ChordBuilder } from "../../../steno/chord";
import { Drill } from "../../../steno/lessons";
import {
  isDeadCode,
  parseStroke,
  Stroke,
  strokeToString,
} from "../../../steno/stroke";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";
import { StenoBoard } from "../../common/StenoBoard";

/**
 * Asks for one chord at a time and listens for it on the keyboard. A drill
 * only moves on once the chord is right.
 */
export function ChordDrill(props: {
  drills: Drill[];
  onComplete: () => void;
}): JSXElement {
  const [index, setIndex] = createSignal(0);
  const [showAnswer, setShowAnswer] = createSignal(true);
  const [pressed, setPressed] = createSignal<Stroke>(0);
  // the last finished stroke when it was wrong
  const [wrong, setWrong] = createSignal<Stroke | undefined>(undefined);
  const [mistakes, setMistakes] = createSignal(0);

  const finished = () => index() >= props.drills.length;
  const drill = () => props.drills[index()];
  const target = createMemo(() => parseStroke(drill()?.stroke ?? "") ?? 0);

  const chord = new ChordBuilder();

  const advance = () => {
    setWrong(undefined);
    setIndex((i) => i + 1);
    if (finished()) props.onComplete();
  };

  const restart = () => {
    setIndex(0);
    setMistakes(0);
    setWrong(undefined);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey || finished()) return;
    if (chord.down(event.code)) {
      event.preventDefault();
      setPressed(chord.current());
    } else if (isDeadCode(event.code)) {
      event.preventDefault();
    }
  };

  const onKeyup = (event: KeyboardEvent) => {
    const { handled, stroke } = chord.up(event.code);
    if (!handled) return;
    event.preventDefault();
    if (stroke === undefined) return;

    setPressed(0);
    if (stroke === target()) {
      advance();
    } else {
      setWrong(stroke);
      setMistakes((count) => count + 1);
    }
  };

  const onBlur = () => {
    chord.cancel();
    setPressed(0);
  };

  onMount(() => {
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("keyup", onKeyup);
    window.addEventListener("blur", onBlur);
  });
  onCleanup(() => {
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("keyup", onKeyup);
    window.removeEventListener("blur", onBlur);
  });

  // while keys are held show them, otherwise show the last wrong attempt
  const shown = () => (pressed() !== 0 ? pressed() : (wrong() ?? 0));

  return (
    <div class="grid gap-4 rounded border-2 border-sub-alt p-6">
      <div class="flex items-center justify-between text-sm text-sub">
        <div>
          {Math.min(index(), props.drills.length)} / {props.drills.length}
          <Show when={mistakes() > 0}>
            <span class="ml-4 text-error">{mistakes()} missed</span>
          </Show>
        </div>
        <Button
          variant="text"
          text={showAnswer() ? "hide answers" : "show answers"}
          fa={{ icon: showAnswer() ? "fa-eye-slash" : "fa-eye" }}
          onClick={(event) => {
            setShowAnswer((value) => !value);
            (event.currentTarget as HTMLElement).blur();
          }}
        />
      </div>
      <div class="h-1 w-full rounded bg-sub-alt">
        <div
          class="h-full rounded bg-main transition-[width]"
          style={{
            width: `${(Math.min(index(), props.drills.length) / props.drills.length) * 100}%`,
          }}
        ></div>
      </div>

      <Show
        when={!finished()}
        fallback={
          <div class="grid justify-items-center gap-4 py-8 text-center">
            <div class="text-2xl text-main">drill complete</div>
            <div class="text-sub">
              {mistakes() === 0
                ? "No missed strokes."
                : `${mistakes()} missed strokes. Run it again until it is clean.`}
            </div>
            <Button
              variant="button"
              text="again"
              fa={{ icon: "fa-redo-alt" }}
              class="px-6 py-2"
              onClick={(event) => {
                restart();
                (event.currentTarget as HTMLElement).blur();
              }}
            />
          </div>
        }
      >
        <div class="grid justify-items-center gap-4">
          <div class="text-sm text-sub">write</div>
          <div class="text-4xl text-text">{drill()?.prompt}</div>
          <StenoBoard
            class="w-96"
            stroke={showAnswer() ? target() : shown() & target()}
            mistakes={shown()}
          />
          <div
            class={cn(
              "h-6 font-mono text-base text-sub",
              wrong() !== undefined && pressed() === 0 && "text-error",
            )}
          >
            <Show
              when={wrong() !== undefined && pressed() === 0}
              fallback={showAnswer() ? drill()?.stroke : ""}
            >
              you wrote {strokeToString(wrong() as Stroke)}, try again
            </Show>
          </div>
          <Button
            variant="text"
            text="skip"
            fa={{ icon: "fa-forward" }}
            onClick={(event) => {
              advance();
              (event.currentTarget as HTMLElement).blur();
            }}
          />
        </div>
      </Show>
    </div>
  );
}
