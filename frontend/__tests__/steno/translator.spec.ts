import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { buildDictionary } from "../../src/ts/steno/dictionary";
import {
  parseStroke,
  strokeFromKeys,
  strokeToString,
} from "../../src/ts/steno/stroke";
import { Translator } from "../../src/ts/steno/translator";

const dictionary = buildDictionary({
  ...(JSON.parse(
    readFileSync("static/steno/plover-main.json", "utf8"),
  ) as Record<string, string>),
  ...(JSON.parse(
    readFileSync("static/steno/plover-commands.json", "utf8"),
  ) as Record<string, string>),
});

function type(outlines: string): string {
  const translator = new Translator(dictionary);
  let text = "";
  for (const outline of outlines.split(" ")) {
    const stroke = parseStroke(outline);
    if (stroke === undefined) throw new Error(`bad stroke ${outline}`);
    const change = translator.stroke(stroke);
    text = text.slice(0, text.length - change.backspaces) + change.text;
  }
  return text;
}

describe("stroke", () => {
  it.each([
    "KAT",
    "-T",
    "TP-PL",
    "STPH-R",
    "12-9",
    "1234ER78S",
    "#",
    "*",
    "R-R",
    "KPA*L",
    "#-D",
    "50",
  ])("round trips %s", (text) => {
    expect(strokeToString(parseStroke(text) as number)).toBe(text);
  });

  it("builds from keys", () => {
    expect(strokeToString(strokeFromKeys(["K-", "A-", "-T"]))).toBe("KAT");
    expect(strokeToString(strokeFromKeys(["#", "S-", "-T"]))).toBe("1-9");
    expect(strokeToString(strokeFromKeys(["#", "K-"]))).toBe("#K");
  });

  it("rejects invalid steno", () => {
    expect(parseStroke("TAK")).toBeUndefined();
    expect(parseStroke("")).toBeUndefined();
  });
});

describe("translator", () => {
  it("puts spaces between words", () => {
    expect(type("-T KAT")).toBe("the cat");
  });

  it("combines multi-stroke outlines", () => {
    expect(type("-T KOPL PAOUT ER")).toBe("the computer");
  });

  it("undoes one stroke at a time", () => {
    expect(type("-T KAT *")).toBe("the");
    expect(type("-T KOPL PAOUT ER *")).toBe(type("-T KOPL PAOUT"));
    expect(type("* *")).toBe("");
  });

  it("handles punctuation and capitalisation", () => {
    expect(type("-T KAT TP-PL -T KAT")).toBe("the cat. The cat");
    expect(type("KPA -T KAT KW-BG")).toBe("The cat,");
  });

  it("applies suffix spelling", () => {
    expect(type("RUPB -G")).toBe("running");
    expect(type("OEP -G")).toBe("opening");
    expect(type("KAT -S")).toBe("cats");
    expect(type("KRAOEU -D")).toBe("cried");
  });

  it("types raw steno for unknown outlines", () => {
    expect(type("-T STKPWHR")).toBe("the STKPWHR");
  });
});

describe("lookup", () => {
  it("finds outlines for test words", () => {
    expect(dictionary.lookup("the")?.text).toBe("-T");
    expect(dictionary.lookup("cat,")?.text).toBe("KAT");
    expect(dictionary.lookup("Cat")?.text).toBe("KAT");
    expect(dictionary.lookup("zzzzqq")).toBeUndefined();
  });
});

describe("lookup with a chord size limit", () => {
  it("only returns outlines made of small strokes", () => {
    expect(dictionary.lookup("the", 4)?.text).toBe("-T");
    for (const word of ["computer", "about", "people", "because"]) {
      const outline = dictionary.lookup(word, 4);
      for (const stroke of outline?.strokes ?? []) {
        expect(
          stroke.toString(2).replaceAll("0", "").length,
        ).toBeLessThanOrEqual(4);
      }
    }
  });

  it("returns nothing when every outline is too big", () => {
    expect(dictionary.lookup("strength", 2)).toBeUndefined();
  });
});
