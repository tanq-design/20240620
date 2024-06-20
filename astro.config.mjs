import { defineConfig } from 'astro/config';
import vue from "@astrojs/vue";
import cloudflare from "@astrojs/cloudflare";

import auth from "auth-astro";

// https://astro.build/config
export default defineConfig({
  integrations: [vue(), auth()],
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  })
});