import { For, JSXElement, Show } from "solid-js";

import { setConfig } from "../../../config/setters";
import { navigate } from "../../../controllers/route-controller";
import { Lesson } from "../../../steno/lessons";
import { parseStroke } from "../../../steno/stroke";
import * as CustomText from "../../../test/custom-text";
import { Button } from "../../common/Button";
import { H2, H3 } from "../../common/Headers";
import { StenoBoard } from "../../common/StenoBoard";
import { ChordDrill } from "./ChordDrill";

export function LessonView(props: {
  lesson: Lesson;
  number: number;
  onBack: () => void;
  onNext?: () => void;
  onComplete: () => void;
}): JSXElement {
  const practiceWords = () =>
    props.lesson.drills.flatMap((drill) =>
      drill.word !== undefined ? [drill.word] : [],
    );

  const practiceInTest = () => {
    setConfig("mode", "custom");
    CustomText.setPipeDelimiter(false);
    CustomText.setText(practiceWords());
    CustomText.setMode("shuffle");
    CustomText.setLimitMode("word");
    CustomText.setLimitValue(practiceWords().length * 2);
    void navigate("/");
  };

  return (
    <div class="grid gap-8">
      <div>
        <Button
          variant="text"
          text="all lessons"
          fa={{ icon: "fa-arrow-left" }}
          onClick={() => props.onBack()}
        />
      </div>
      <div>
        <H2
          fa={{ icon: "fa-graduation-cap" }}
          text={`${props.number}. ${props.lesson.title}`}
        />
        <p class="text-sub">{props.lesson.summary}</p>
      </div>

      <For each={props.lesson.sections}>
        {(section) => (
          <section>
            <H3 fa={{ icon: "fa-angle-right" }} text={section.heading} />
            <For each={section.paragraphs}>
              {(paragraph) => <p class="mb-3 max-w-[70ch]">{paragraph}</p>}
            </For>
            <Show when={section.chart}>
              <div class="mt-4 flex flex-wrap gap-6">
                <For each={section.chart}>
                  {(entry) => (
                    <div class="grid justify-items-center gap-1">
                      <StenoBoard
                        class="w-52"
                        stroke={parseStroke(entry.stroke) ?? 0}
                      />
                      <div class="text-sm">
                        <span class="text-text">{entry.label}</span>
                        <span class="ml-2 font-mono text-sub">
                          {entry.stroke}
                        </span>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </section>
        )}
      </For>

      <section>
        <H3 fa={{ icon: "fa-keyboard" }} text="drill" />
        <p class="mb-4 max-w-[70ch] text-sub">
          Press the chord on your keyboard and release. The board shows what you
          are holding; keys that do not belong turn red.
        </p>
        <ChordDrill
          drills={props.lesson.drills}
          onComplete={() => props.onComplete()}
        />
      </section>

      <div class="flex flex-wrap gap-4">
        <Show when={practiceWords().length > 0}>
          <Button
            variant="button"
            class="px-6 py-2"
            text="practice these words in a test"
            fa={{ icon: "fa-play" }}
            onClick={practiceInTest}
          />
        </Show>
        <Show when={props.onNext}>
          <Button
            variant="button"
            class="px-6 py-2"
            text="next lesson"
            fa={{ icon: "fa-chevron-right" }}
            onClick={() => props.onNext?.()}
          />
        </Show>
      </div>
    </div>
  );
}
