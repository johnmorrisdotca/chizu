import { describe, expect, it } from "vitest";
import { readMapColors } from "./element.ts";

describe("embed colour parsing", () => {
  it("keeps commas inside native CSS functions and accepts native variables", () => {
    expect(readMapColors("JP:rgb(47,107,79),GB:hsl(0,40%,40%),CA:var(--land)")).toEqual({ JP: "rgb(47,107,79)", GB: "hsl(0,40%,40%)", CA: "var(--land)" });
  });
  it("rejects malformed, unsafe and oversized values as a whole", () => {
    for (const value of ["JP:url(evil)", "JP:red;fill:url(evil)", "<img>:red", "JP:red,", "JP:red,GB:bad()", "JP:" + "a".repeat(16001)]) expect(readMapColors(value)).toBeNull();
    expect(readMapColors(null)).toEqual({});
  });
});
