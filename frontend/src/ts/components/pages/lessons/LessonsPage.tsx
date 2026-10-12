import { createSignal, For, JSXElement, Show } from "solid-js";
import { z } from "zod";

import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { lessons } from "../../../steno/lessons";
import { cn } from "../../../utils/cn";
import { Fa } from "../../common/Fa";
import { H2 } from "../../common/Headers";
import { Page } from "../../common/Page";
import { LessonView } from "./LessonView";

export function LessonsPage(): JSXElement {
  const [openIndex, setOpenIndex] = createSignal<number | undefined>(undefined);
  const [completed, setCompleted] = useLocalStorage({
    key: "stenoLessonsCompleted",
    schema: z.array(z.string()),
    fallback: [],
  });

  const open = (index: number | undefined) => {
    setOpenIndex(index);
    window.scrollTo({ top: 0 });
  };

  return (
    <Page id="lessons">
      <div class="content-grid">
        <Show
          when={
            openIndex() !== undefined
              ? lessons[openIndex() as number]
              : undefined
          }
          keyed
          fallback={
            <div class="grid gap-6">
              <div>
                <H2 fa={{ icon: "fa-graduation-cap" }} text="lessons" />
                <p class="max-w-[70ch] text-sub">
                  A short course in Plover steno theory. Each lesson explains
                  one idea, shows it on the board, then drills it chord by
                  chord. Work through them in order.
                </p>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <For each={lessons}>
                  {(lesson, index) => (
                    <button
                      type="button"
                      class="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded bg-sub-alt p-4 text-left text-text hover:bg-text hover:text-bg"
                      onClick={() => open(index())}
                    >
                      <div class="w-8 text-center text-2xl text-main">
                        {index() + 1}
                      </div>
                      <div>
                        <div class="text-lg">{lesson.title}</div>
                        <div class="text-sm text-sub">{lesson.summary}</div>
                      </div>
                      <Fa
                        icon="fa-check"
                        class={cn(
                          "text-main",
                          !completed().includes(lesson.id) && "invisible",
                        )}
                      />
                    </button>
                  )}
                </For>
              </div>
            </div>
          }
        >
          {(lesson) => (
            <LessonView
              lesson={lesson}
              number={(openIndex() as number) + 1}
              onBack={() => open(undefined)}
              onNext={
                (openIndex() as number) < lessons.length - 1
                  ? () => open((openIndex() as number) + 1)
                  : undefined
              }
              onComplete={() => {
                if (!completed().includes(lesson.id)) {
                  setCompleted([...completed(), lesson.id]);
                }
              }}
            />
          )}
        </Show>
      </div>
    </Page>
  );
}
