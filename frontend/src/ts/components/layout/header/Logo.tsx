import { JSXElement } from "solid-js";

import { restartTestEvent } from "../../../events/test";
import { getActivePage } from "../../../states/core";
import { getFocus } from "../../../states/test";
import { cn } from "../../../utils/cn";
import { isDevEnvironment } from "../../../utils/env";

export function Logo(): JSXElement {
  return (
    <a
      href={`${location.origin}/`}
      class="-m-2 flex h-6 w-max gap-2 rounded-[0.8rem] p-2 focus-visible:**:data-[ui-element='logoSubtext']:text-transparent"
      aria-label="Monkeysteno Home"
      router-link
      style={{
        "box-sizing": "content-box",
        "font-family": "Lexend Deca ,sans-serif",
      }}
      data-ui-element="logo"
      onClick={() => {
        if (getActivePage() === "test") restartTestEvent.dispatch();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-680 -1030 300 180"
        style={{ "fill-rule": "evenodd" }}
        class={cn("h-full fill-[currentColor] text-main transition-colors", {
          "text-sub": getFocus(),
        })}
      >
        <g>
          <path d="M -630 -1030 L -430 -1030 C -402.404 -1030 -380 -1007.596 -380 -980 L -380 -900 C -380 -872.404 -402.404 -850 -430 -850 L -630 -850 C -657.596 -850 -680 -872.404 -680 -900 L -680 -980 C -680 -1007.596 -657.596 -1030 -630 -1030 Z M -630 -1010 C -646.557 -1010 -660 -996.557 -660 -980 L -660 -900 C -660 -883.443 -646.557 -870 -630 -870 L -430 -870 C -413.443 -870 -400 -883.443 -400 -900 L -400 -980 C -400 -996.557 -413.443 -1010 -430 -1010 Z"></path>
          <rect x="-640" y="-990" width="20" height="60" rx="10"></rect>
          <rect x="-610" y="-990" width="20" height="25" rx="10"></rect>
          <rect x="-580" y="-990" width="20" height="25" rx="10"></rect>
          <rect x="-610" y="-955" width="20" height="25" rx="10"></rect>
          <rect x="-580" y="-955" width="20" height="25" rx="10"></rect>
          <rect x="-540" y="-990" width="20" height="60" rx="10"></rect>
          <rect x="-500" y="-990" width="20" height="25" rx="10"></rect>
          <rect x="-470" y="-990" width="20" height="25" rx="10"></rect>
          <rect x="-440" y="-990" width="20" height="25" rx="10"></rect>
          <rect x="-500" y="-955" width="20" height="25" rx="10"></rect>
          <rect x="-470" y="-955" width="20" height="25" rx="10"></rect>
          <rect x="-440" y="-955" width="20" height="25" rx="10"></rect>
          <rect x="-590" y="-915" width="25" height="25" rx="10"></rect>
          <rect x="-557" y="-915" width="25" height="25" rx="10"></rect>
          <rect x="-527" y="-915" width="25" height="25" rx="10"></rect>
          <rect x="-494" y="-915" width="25" height="25" rx="10"></rect>
        </g>
      </svg>
      <div class="hidden h-6 place-content-center text-[2rem] leading-0 sm:grid">
        <div
          class={cn(
            "-mt-[1.65em] hidden pl-[0.5em] text-[0.315em] leading-0 text-sub transition-colors duration-125 lg:block",
            {
              "text-transparent": getFocus(),
            },
          )}
          data-ui-element="logoSubtext"
        >
          {isDevEnvironment() ? "localhost" : "monkey chord"}
        </div>
        <h1
          class={cn("-mt-[0.11em] text-text transition-colors duration-250", {
            "text-sub": getFocus(),
          })}
          data-ui-element="logoText"
        >
          monkeysteno
        </h1>
      </div>
    </a>
  );
}
