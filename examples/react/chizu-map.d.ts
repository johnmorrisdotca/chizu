import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "chizu-map": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { region?: string; highlight?: string; labels?: boolean; lang?: string; theme?: string };
    }
  }
}
