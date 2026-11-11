import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChizuCity } from "./cities.ts";
import { mountCities } from "./mountCities.ts";

const TOKYO: ChizuCity = { id: "Q1490", name: { en: "Tokyo" }, lat: 35.69, lon: 139.69, population: 14_000_000 };
const PARIS: ChizuCity = { id: "Q90", name: { en: "Paris" }, lat: 48.86, lon: 2.35, population: 2_100_000 };
const settle = () => new Promise((done) => setTimeout(done, 0));

afterEach(() => vi.restoreAllMocks());

describe("a mounted map's cities", () => {
  it("hand back a list as it is, and nothing without one", () => {
    let cities: readonly ChizuCity[] | null = [TOKYO];
    const get = mountCities(
      () => ({ cities }),
      () => {},
    );
    expect(get()).toEqual([TOKYO]);
    cities = null;
    expect(get()).toBeNull();
  });

  it("call a loader once, however often the map draws, and draw again when it answers", async () => {
    const loader = vi.fn(async () => [TOKYO]);
    const redraw = vi.fn();
    const get = mountCities(() => ({ cities: loader }), redraw);
    expect(get()).toBeNull();
    expect(get()).toBeNull();
    await settle();
    expect(get()).toEqual([TOKYO]);
    expect(get()).toEqual([TOKYO]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(redraw).toHaveBeenCalledTimes(1);
  });

  it("ignore the answer of a loader that was swapped for another, and ask the new one once", async () => {
    let answerFirst: (list: readonly ChizuCity[]) => void = () => {};
    const first = vi.fn(() => new Promise<readonly ChizuCity[]>((done) => (answerFirst = done)));
    const second = vi.fn(async () => [PARIS]);
    let loader: () => Promise<readonly ChizuCity[]> = first;
    const redraw = vi.fn();
    const get = mountCities(() => ({ cities: loader }), redraw);
    get();
    loader = second;
    get();
    await settle();
    answerFirst([TOKYO]);
    await settle();
    expect(get()).toEqual([PARIS]);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(redraw).toHaveBeenCalledTimes(1);
  });

  it("report a failed loader once and never ask it again, whether it rejects or throws at once", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const loader of [
      vi.fn(async () => Promise.reject(new Error("no kuni"))),
      vi.fn(() => {
        throw new Error("no kuni");
      }),
    ]) {
      error.mockClear();
      const get = mountCities(
        () => ({ cities: loader as () => Promise<readonly ChizuCity[]> }),
        () => {},
      );
      for (let draw = 0; draw < 5; draw += 1) {
        expect(get()).toBeNull();
        await settle();
      }
      expect(loader).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledTimes(1);
      expect(String(error.mock.calls[0]?.[0])).toContain("@johnmorrisdotca/kuni 1.6.0");
    }
  });
});
