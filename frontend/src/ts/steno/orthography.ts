// Spelling rules for attaching a suffix, after Plover's English orthography.
// Each rule matches "word ^ suffix".
const RULES: [RegExp, string][] = [
  // artistic + ly = artistically
  [/^(.*[aeiou]c) \^ ly$/i, "$1ally"],
  // establish + s = establishes
  [/^(.*(?:s|sh|x|z|zh)) \^ s$/i, "$1es"],
  // speech + s = speeches (but not stomach + s)
  [/^(.*(?:oa|ea|i|ee|oo|au|ou|l|n|(?<![gin]a)r|t)ch) \^ s$/i, "$1es"],
  // cherry + s = cherries
  [/^(.+[bcdfghjklmnpqrstvwxz])y \^ s$/i, "$1ies"],
  // die + ing = dying
  [/^(.+)ie \^ ing$/i, "$1ying"],
  // metallurgy + ist = metallurgist
  [/^(.+[cdfghlmnpr])y \^ ist$/i, "$1ist"],
  // beauty + ful = beautiful
  [/^(.+[bcdfghjklmnpqrstvwxz])y \^ ([a-hj-xz].*)$/i, "$1i$2"],
  // write + en = written
  [/^(.+)te \^ en$/i, "$1tten"],
  // free + ed = freed
  [/^(.+e)e \^ (e.+)$/i, "$1$2"],
  // narrate + ing = narrating
  [/^(.+[bcdfghjklmnpqrstuvwxz])e \^ ([aeiouy].*)$/i, "$1$2"],
  // defer + ed = deferred
  [
    /^(.*(?:[bcdfghjklmnprstvwxyz]|qu)[aeiou])([bcdfgklmnprtvz]) \^ ([aeiouy].*)$/i,
    "$1$2$2$3",
  ],
];

/**
 * Join a suffix onto a word. `isWord` decides between candidate spellings
 * (open + ing = opening, but run + ing = running).
 */
export function addSuffix(
  word: string,
  suffix: string,
  isWord: (candidate: string) => boolean,
): string {
  const simple = word + suffix;
  if (!/^[a-z]+$/i.test(suffix) || !/[a-z]$/i.test(word)) return simple;

  // only the last word takes part in the spelling change
  const split = word.search(/[a-z']+$/i);
  const head = word.slice(0, split);
  const tail = word.slice(split);

  const candidates = [tail + suffix];
  const input = `${tail} ^ ${suffix}`;
  for (const [pattern, replacement] of RULES) {
    if (pattern.test(input)) {
      candidates.push(input.replace(pattern, replacement));
    }
  }

  const known = candidates.find((candidate) => isWord(candidate.toLowerCase()));
  return head + (known ?? candidates[1] ?? candidates[0]);
}
