import "@johnmorrisdotca/chizu/element/define";

const map = document.querySelector("chizu-map")!;
map.addEventListener("chizu-load", (event) => console.log((event as CustomEvent<{ region: string }>).detail.region));
