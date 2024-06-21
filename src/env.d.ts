/// <reference types="astro/client" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
  // replace `MY_KV` with your KV namespace
  d1_databases: KVNamespace;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime { 
		session: import("lucia").Session | null;
		user: import("lucia").User | null;
  }
}