import { Config } from "../config/store";
import { loadDictionary } from "./dictionary";

/** The chord size limit in effect, Infinity when there is none. */
export function getStenoMaxKeys(): number {
  if (Config.stenoMode === "off" || Config.stenoMaxKeys === "off") {
    return Infinity;
  }
  return Number(Config.stenoMaxKeys);
}

/** Keeps the words that have an outline within the chord size limit. */
export async function filterWordsByStenoMaxKeys(
  words: string[],
): Promise<string[]> {
  const maxKeys = getStenoMaxKeys();
  if (maxKeys === Infinity) return words;

  const dictionary = await loadDictionary();
  const filtered = words.filter(
    (word) => dictionary.lookup(word, maxKeys) !== undefined,
  );
  // an empty word list would break the test, better to ignore the limit
  return filtered.length > 0 ? filtered : words;
}
