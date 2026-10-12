import { Config } from "../../config/store";
import { logTestEvent } from "../../test/events/data";
import { getTestEventCode } from "../../test/events/helpers";
import * as Steno from "../../steno/engine";

export async function onKeyup(event: KeyboardEvent): Promise<void> {
  const now = performance.now();
  logTestEvent("keyup", now, {
    code: getTestEventCode(event),
    ctrl: event.ctrlKey ? true : undefined,
    shift: event.shiftKey ? true : undefined,
    alt: event.altKey ? true : undefined,
    meta: event.metaKey ? true : undefined,
  });

  if (Steno.handleKeyup(event)) {
    return;
  }

  // allow arrows in arrows funbox
  const arrowsActive = Config.funbox.includes("arrows");
  if (
    event.key === "Home" ||
    event.key === "End" ||
    event.key === "PageUp" ||
    event.key === "PageDown" ||
    (event.key.startsWith("Arrow") && !arrowsActive)
  ) {
    event.preventDefault();
    return;
  }
}
