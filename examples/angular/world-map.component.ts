import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import "@johnmorrisdotca/chizu/element/define";

@Component({
  selector: "app-world-map",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<chizu-map region="world" [attr.highlight]="highlight" labels></chizu-map>`,
})
export class WorldMapComponent {
  @Input() highlight = "JP CA";
}
