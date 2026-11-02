import "@johnmorrisdotca/chizu/element/define";

const map = document.createElement("chizu-map");
map.setAttribute("region", "world");
map.setAttribute("highlight", "JP CA");
map.setAttribute("labels", "");
document.body.append(map);
