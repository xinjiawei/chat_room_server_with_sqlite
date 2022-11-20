import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import * as  bcrypt  from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
import { serve, ServerRequest } from "https://deno.land/std@0.90.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.90.0/http/file_server.ts";
import { posix } from "https://deno.land/std@0.90.0/path/mod.ts";
import { Status } from "https://deno.land/std@0.90.0/http/http_status.ts";


import { getIndexer } from "https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api/index.js";

import { apiError, TinyRouter } from "https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api/router.js";

const version = "22/05";


// Open a database
const db = new DB("thread.db");
db.execute(`
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS forum_title;
DROP TABLE IF EXISTS forum_content;
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT,
    user_realname TEXT,
    passwd TEXT
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS forum_title (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    title TEXT,
    icon TEXT,
    is_delete TEXT
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS forum_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_id INTEGER,
    user_id INTEGER,
    content TEXT,
    score INTEGER,
    orders INTEGER,
    is_hidden INTEGER,
    is_delete TEXT
  )
`);

/* Load a "database". */
const databaseJSON = `{
  "users": [
    { "username": "norman", "name": "Norman C. Lowery", "password": "1"},
    { "username": "josa",   "name": "Jósa Marcsa", "password": "1"},
    { "username": "amanda", "name": "Amanda Costa Rodrigues", "password": "1"},
    { "username": "tiina",  "name": "Tiina Takko", "password": "1"},
    { "username": "owen",   "name": "Owen Dow", "password": "1"}
  ],
  "threads": [
    {
      "thread_title": "Does anybody play an instrument?",
      "icon": "🎸",
      "ownerid": 1,
      "posts": [
        {
          "text": "I love to play guitar, anybody else?",
          "score": 5,
          "hidden": 0,
          "userid": 1
        },
        {
          "text": "Not me.",
          "score": 5,
          "hidden": 0,
          "userid": 3
        },
        {
          "text": "Ok. Thanks for your contribution @amanda",
          "score": 5,
          "hidden": 0,
          "userid": 1
        },
        {
          "text": "I play the air drums!",
          "score": 5,
          "hidden": 0,
          "userid": 5
        }
      ]
    },
    {
      "thread_title": "Hey everybody!",
      "ownerid": 2,
      "icon": "👋",
      "posts": [
        {
          "text": "I love making new friends!",
          "score": 5,
          "hidden": 0,
          "userid": 2
        },
        {
          "text": "Welcome @josa",
          "score": 5,
          "hidden": 0,
          "userid": 5
        },
        {
          "text": "Thanks Owen",
          "score": 5,
          "hidden": 0,
          "userid": 2
        },
        {
          "text": "Who invited Josa?.",
          "score": 5,
          "hidden": 0,
          "userid": 3
        },
        {
          "text": "@amanda be nice. Last warning.",
          "score": 5,
          "hidden": 0,
          "userid": 1
        }
      ]
    }
  ]
}`;
const data = JSON.parse(databaseJSON);

// Run a simple query
for (const datas of data['users']) {
  /*
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT,
    user_realname TEXT,
    passwd TEXT
    */
  db.query("INSERT INTO user (user_name,user_realname,passwd) VALUES (?,?,?)", [datas.username, datas.name, datas.password]);
}

for (const datas of data['threads']) {
  /*
      id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    title TEXT,
    icon TEXT,
    is_delete TEXT
    */
  db.query("INSERT INTO forum_title (owner_id,title,icon,is_delete) VALUES (?,?,?,?)", [datas.user, datas.thread_title, 
    datas.icon, '0']);
}

for (const datasets of data['threads']) {
  const ownerid = datasets.ownerid;
  //order by id 也能实现排序
  let order = 1;
  for (const datas of datasets['posts']) {
  /*
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_id INTEGER,
    user_id INTEGER,
    content TEXT,
    score INTEGER,
    orders INTEGER,
    is_hidden INTEGER,
    is_delete TEXT
    */
  db.query("INSERT INTO forum_content (title_id,user_id,content,score,orders,is_hidden,is_delete) VALUES (?,?,?,?,?,?,?)", [ownerid, datas.userid,
   datas.text, datas.score, order, datas.hidden, '0']);
  order++;
  }
}

//for (let i=0;i<10;++i) console.log(i);
//console.log(i);

// Print out data in table
for (const [name] of db.query("SELECT user_realname FROM user")) {
  console.log(name);
}

for (const [name] of db.query("SELECT title FROM forum_title")) {
  console.log(name);
}
for (const [name] of db.query("SELECT content FROM forum_content")) {
  console.log(name);
}

// Close connection
db.close();


//To hash a password (with auto-generated salt):
const hash = bcrypt.hashSync("test");
//To check a password:
const result = bcrypt.compareSync("test", hash);
console.log(result);


/* Set up some routes to handle */
const router = new TinyRouter();

/* Give an index page when accessing the front */
router.get("^/?$", getIndexer(router, data));
router.get(
  "^/api/threads/?$",
  () => data.threads.map(({ posts, ...rest }) => rest),
);

router.add("OPTIONS", "^", () => "");

/* catch all for static files */
const target = posix.resolve("static");
router.get("^", async (req: ServerRequest, params: any) => {
  const normalizedUrl = normalizeURL(req.url);
  let fsPath = posix.join(target, normalizedUrl);
  console.log(target.toString()+" | "+fsPath.toString());
  if (fsPath.indexOf(target) !== 0) {
    fsPath = target;
  }

  try {
    return await serveFile(req, fsPath);
  } catch (e) {
    console.error(e.message);
    return {
      body: "No matching route or file",
      status: Status.NotFound,
    };
  }
});

async function main() {
  /* Create the server! */
  const server = serve({
    port: 7777,
  });
  console.log("Connect to http://localhost:7777/");

  /* Handle incoming requests */
  for await (const req of server) {
    console.log(`${new Date().toISOString()}\t${req.method}\t${req.url}`);

      try {
        await req.respond(await router.handle(req));
      } catch (err) {
        console.error(`Error: ${err.message}`);
      }
    
  }
}

/* Adapted from https://deno.land/std@0.90.0/http/file_server.ts */
function normalizeURL(url: any) {
  let normalizedUrl = url;
  try {
    normalizedUrl = decodeURI(normalizedUrl);
  } catch (e) {
    if (!(e instanceof URIError)) {
      throw e;
    }
  }

  try {
    const absoluteURI = new URL(normalizedUrl);
    normalizedUrl = absoluteURI.pathname;
  } catch (e) {
    //wasn't an absoluteURI
    if (!(e instanceof TypeError)) {
      throw e;
    }
  }

  if (normalizedUrl[0] !== "/") {
    throw new URIError("The request URI is malformed.");
  }

  normalizedUrl = posix.normalize(normalizedUrl);
  const startOfParams = normalizedUrl.indexOf("?");
  return startOfParams > -1
    ? normalizedUrl.slice(0, startOfParams)
    : normalizedUrl;
}

if (import.meta.main) {
  main();
}
