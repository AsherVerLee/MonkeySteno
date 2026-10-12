import { codeToStenoKey, keyBit, Stroke } from "./stroke";

/**
 * Collects held keys into a chord. The stroke is complete when the last key
 * is released.
 */
export class ChordBuilder {
  // physical keys currently held, and the chord they have built up so far
  private held = new Set<string>();
  private chord: Stroke = 0;

  /** @returns true when the key is a steno key */
  down(code: string): boolean {
    const key = codeToStenoKey(code);
    if (key === undefined) return false;
    this.held.add(code);
    this.chord |= keyBit(key);
    return true;
  }

  /** @returns the finished stroke once every key is up */
  up(code: string): { handled: boolean; stroke?: Stroke } {
    if (!this.held.delete(code)) return { handled: false };
    if (this.held.size > 0 || this.chord === 0) return { handled: true };
    const stroke = this.chord;
    this.chord = 0;
    return { handled: true, stroke };
  }

  /** The keys pressed so far in the chord being built. */
  current(): Stroke {
    return this.chord;
  }

  /** Drop a half-built chord, e.g. when focus is lost mid-stroke. */
  cancel(): void {
    this.held.clear();
    this.chord = 0;
  }
}
