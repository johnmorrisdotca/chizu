import { createApp } from "vue";
import WorldMap from "./WorldMap.vue";

const app = createApp(WorldMap);
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith("chizu-");
app.mount("#app");
