import { createSignal } from "solid-js";
import { ColorName, Theme } from "../constants/themes";
import { ThemeName } from "@monkeytype/schemas/configs";

export type ThemeIdentifier = ThemeName | "custom";
const defaultTheme: Theme & { name: ThemeIdentifier } = {
  name: "steno_dark",
  bg: "#22262a",
  main: "#05ad98",
  caret: "#05ad98",
  sub: "#878787",
  subAlt: "#2b3035",
  text: "#e9e6e7",
  error: "#ff3b3f",
  errorExtra: "#a82a2d",
  colorfulError: "#ff3b3f",
  colorfulErrorExtra: "#a82a2d",
};

export const [getTheme, setTheme] = createSignal(defaultTheme);

export function updateThemeColor(key: ColorName, color: string): void {
  setTheme((prev) => ({
    ...prev,
    [key]: color,
  }));
}
