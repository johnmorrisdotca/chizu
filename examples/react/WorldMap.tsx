import "@johnmorrisdotca/chizu/element/define";

export function WorldMap({ highlight = "JP CA" }: { highlight?: string }) {
  return <chizu-map region="world" highlight={highlight} labels />;
}
