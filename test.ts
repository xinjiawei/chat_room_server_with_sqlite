// main.ts
console.log(Deno.args); // [ "a", "b", "-c", "--quiet" ]
// fetch.js
const result = await fetch("https://deno.land/");
// env.js
Deno.env.get("HOME");
// run.js
const proc = Deno.run({ cmd: ["whoami"] });

//deno install --allow-read --allow-net https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api/chat_server.js