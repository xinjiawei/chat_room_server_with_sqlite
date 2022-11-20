// deno-lint-ignore-file
import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import * as  bcrypt  from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
import { serve, ServerRequest } from "https://deno.land/std@0.90.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.90.0/http/file_server.ts";
import { posix } from "https://deno.land/std@0.90.0/path/mod.ts";
import { Status } from "https://deno.land/std@0.90.0/http/http_status.ts";


import { getIndexer } from "https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api/index.js";

import { apiError, TinyRouter } from "https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api/router.js";

const version = "22/05";

console.clear();
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
    body TEXT,
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
    { "username": "alisa", "name": "Amanda Costa Rodrigues", "password": "1"},
    { "username": "tiina",  "name": "Tiina Takko", "password": "1"},
    { "username": "owen",   "name": "Owen Dow", "password": "1"}
  ],
  "threads": [
    {
      "thread_title": "Does anybody play an instrument?",
      "body": "aaaaaaa",
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
          "score": 50,
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
      "body": "bbbbbbb",
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
  db.query("INSERT INTO user (user_name,user_realname,passwd) VALUES (?,?,?)", [datas.username, datas.name, bcrypt.hashSync(datas.password)]);
}

for (const datas of data['threads']) {
  /*
      id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    title TEXT,
    body TEXT,
    icon TEXT,
    is_delete TEXT
    */
  db.query("INSERT INTO forum_title (owner_id,title,body,icon,is_delete) VALUES (?,?,?,?,?)", [datas.ownerid, datas.thread_title, datas.body,
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
// for (const [name] of db.query("SELECT user_realname FROM user")) {
//   console.log(name);
// }

// for (const [name] of db.query("SELECT title FROM forum_title")) {
//   console.log(name);
// }
// for (const [name] of db.query("SELECT content FROM forum_content")) {
//   console.log(name);
// }


// Close connection
db.close();

// const result1 = db.query("SELECT passwd FROM user WHERE user_name = 'norman'");
// console.log(result1);



// //To hash a password (with auto-generated salt):
// const hash = bcrypt.hashSync("test");
// //To check a password:
// const result = bcrypt.compareSync("test", hash);
// console.log(result);


/* Set up some routes to handle */
const router = new TinyRouter();

router.post("^/api/v1/register/?$", (req: { json: {
userrealname: any; username: any; password: any;
}; }, params: any) => {

  const username = req.json.username;
  //To hash a password (with auto-generated salt):
  const password = bcrypt.hashSync(req.json.password);
  const userrealname = req.json.userrealname;
  const db = new DB("thread.db");
  
  const re0 = JSON.stringify(db.query<[string, number]>("SELECT * FROM user WHERE user_name = ?", [username]));
  const re = eval('(' + re0 + ')');
  console.log(re.toString());
  if(re.toString() == "") {
    db.query<[string, number]>("INSERT INTO user (user_name,user_realname,passwd) VALUES (?,?,?)", [username, userrealname, password]);
    const info = {
      status: "success",
      name: username
    };
    return {
      body: info,
      status: Status.OK,
    }
  } else {
    return apiError(`user ${req.json.username} already exist`,Status.Conflict,);
  }
  // Close connection
  db.close();
}
);
/* Give an index page when accessing the front */
router.post("^/api/v1/login/?$", (req: { json: { username: any; password: any;}; }, params: any) => {
  const username = req.json.username;
  const password = req.json.password;
  const db = new DB("thread.db");
  
  const re0 = JSON.stringify(db.query<[string, number]>("SELECT * FROM user  WHERE user_name = ?", [username]));
  const re = eval('(' + re0 + ')');
  console.log("cc2: " + re[0]);
  
  //返回多个同名用户,默认取第一个, 虽然不可能发生.
  let sqlattr = re[0].toString().split(",",);
  console.log("id: " + sqlattr[0]);
  console.log("name: " + sqlattr[1]);
  //const result1 = re.passwd;
  //To check a password:
  if(bcrypt.compareSync(password, sqlattr[3])) {
    const info = {
      status: "success",
      id: sqlattr[0],
      name: username,
      realname: sqlattr[2]

      // posts: [{
      //   text: req.json.text,
      //   user: req.json.user,
      // }]
    };
    // Close connection
    db.close();

    return {
      body: info,
      status: Status.OK,
    };
  } else {
    return apiError(`PASSWORD ERROE ${req.json.username}`,Status.Forbidden,);
  }
});

router.get("^/api/v1/threads/?$", (_req: any, params: any[]) => {
  /*
      id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    title TEXT,
    body TEXT,
    icon TEXT,
    is_delete TEXT
    */
  const db = new DB("thread.db");
  const re0 = JSON.stringify(db.query<[string, number]>("SELECT * FROM forum_title WHERE is_delete = ?",["0"]));
  const re = eval('(' + re0 + ')');
  let sqlattr = re[0].toString().split(",",);
  console.log(re[0]);  

  const tempdataset = {"threads": []};
for (const datas of re) {
  let sqlattr = datas.toString().split(",",);
  let json_string = "{id: '"+ sqlattr[0] + "', owner_id: '" +sqlattr[1]+"', title: '"+ sqlattr[2] + "', body: '" +sqlattr[3]+ "', icon: '" +sqlattr[4]+"'}";
  let json_data = eval('(' + json_string + ')');
  tempdataset.threads.push(json_data);
  console.log(json_data);
}
console.log(tempdataset);


  return (tempdataset);
    // Close connection
    db.close();
  
});

router.post("^/api/v1/postnewpoem/?$", (req: { json: {
userid: any;
title: any;
body: any;
icon: any;
}; }, params: any) => {
  /*
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER,
  title TEXT,
  body TEXT,
  icon TEXT,
  is_delete TEXT
  */
  const userid = req.json.userid;
  const title = req.json.title;
  const body = req.json.body;
  const icon = req.json.icon;

  const db = new DB("thread.db");
  
  const quary0 = JSON.stringify(db.query<[string, number]>("SELECT user_name FROM user WHERE user_id = ?", [userid]));
  const result = eval('(' + quary0 + ')');
  console.log(result.toString());
  if(result.toString() !== "") {
    db.query<[string, number]>("INSERT INTO forum_title (owner_id,title,body,icon,is_delete) VALUES (?,?,?,?,?)",
     [userid, title, body, icon, "0"]);
    const info = {
      status: "success",
      userid: userid
    };
    return {
      body: info,
      status: Status.OK,
    }
  } else {
    return apiError(` id ${req.json.userid} not exist`,Status.Conflict,);
  }
  // Close connection
  db.close();
});

router.post("^/api/v1/getavgscore/?$", (req: { json: {titleid: any;}; }, params: any) => {
  const titleid = req.json.titleid;

  const db = new DB("thread.db");
  
  const re0 = JSON.stringify(db.query<[string, number]>("SELECT avg(score) FROM forum_content WHERE title_id = ? AND is_hidden = 0", [titleid]));
  const re = eval('(' + re0 + ')').toString();
  console.log("avgscore: " + re);
  //const result1 = re.passwd;

  if(re !== "") {
    const info = {
      status: "success",
      titleid: titleid,
      score: re
    };
    // Close connection
    db.close();

    return {
      body: info,
      status: Status.OK,
    };
  } else {
    return apiError(`no titleid ${req.json.titleid}`,Status.NotFound,);
  }
});

router.post("^/api/v1/comment/?$", (req: { json: {
userid: any;
comment: any;
scores: any;
ishidden: any;titleid: any;
}; }, params: any) => {
  const titleid = req.json.titleid;
  const userid = req.json.userid;
  const comment = req.json.comment;
  const scores = req.json.scores;
  const ishidden = req.json.ishidden;

  const db = new DB("thread.db");
  
  const re0 = JSON.stringify(db.query<[string, number]>("SELECT user_id FROM forum_content WHERE title_id = ?", [titleid]));
  const re = eval('(' + re0 + ')').toString();
  let userids = re.toString().split(",",);
  for(const item of userids){
    if(item == userid) 
      return apiError(`you are alredy commnet ${req.json.titleid}`,Status.Conflict,)
    else {
      continue;
    }
  }
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
  db.query<[string, number]>("INSERT INTO forum_content (title_id,user_id,content,score,is_hidden,is_delete) VALUES (?,?,?,?,?,?)", 
  [titleid, userid, comment,scores,ishidden,"0"]);

  console.log("all commented users: " + re);
  //const result1 = re.passwd;

  // 在这个表里titleid和userid是共存的, 如果有title_id ,必然至少有一个user_id, 所以不用担心user id是否为空的情况.
  if(re !== "") {
    const info = {
      status: "success",
      titleid: titleid
    };
    // Close connection
    db.close();

    return {
      body: info,
      status: Status.OK,
    };
  } else {
    return apiError(`no titleid ${req.json.titleid}`,Status.NotFound,);
  }
});

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
