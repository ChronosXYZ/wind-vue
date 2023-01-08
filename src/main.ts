import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { NNTPClient } from "./nntp";

const app = createApp(App);

app.use(createPinia());

app.mount("#app");

const nntp = new NNTPClient("wss://nntp.antiope.link");
