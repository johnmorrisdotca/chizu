import "@angular/compiler";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { WorldMapComponent } from "./world-map.component";

void bootstrapApplication(WorldMapComponent, { providers: [provideZonelessChangeDetection()] });
