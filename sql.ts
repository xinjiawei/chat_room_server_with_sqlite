import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";

// Open a database
const db = new DB("thread.db");
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
    orders INTEGER,
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
          "userid": 1
        },
        {
          "text": "Not me.",
          "userid": 3
        },
        {
          "text": "Ok. Thanks for your contribution @amanda",
          "userid": 1
        },
        {
          "text": "I play the air drums!",
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
          "userid": 2
        },
        {
          "text": "Welcome @josa",
          "userid": 5
        },
        {
          "text": "Thanks Owen",
          "userid": 2
        },
        {
          "text": "Who invited Josa?.",
          "userid": 3
        },
        {
          "text": "@amanda be nice. Last warning.",
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
  let order = 1;
  for (const datas of datasets['posts']) {

/*  id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_id INTEGER,
    user_id INTEGER,
    content TEXT,
    orders INTEGER,
    is_delete TEXT
    */
  db.query("INSERT INTO forum_content (title_id,user_id,content,orders,is_delete) VALUES (?,?,?,?,?)", [ownerid, datas.userid,
   datas.text, order, '0']);
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
for (const [name] of db.query("SELECT  FROM forum_content")) {
  console.log(name);
}

// Close connection
db.close();