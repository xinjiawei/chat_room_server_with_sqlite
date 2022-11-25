// deno-lint-ignore-file
// import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import * as  bcrypt  from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
// import { serve, ServerRequest } from "https://deno.land/std@0.90.0/http/server.ts";
// import { serveFile } from "https://deno.land/std@0.90.0/http/file_server.ts";
// import { posix } from "https://deno.land/std@0.90.0/path/mod.ts";
// import { Status } from "https://deno.land/std@0.90.0/http/http_status.ts";

// import { getIndexer } from "./static/index.js";
// import { apiError, TinyRouter } from "./static/router.js";

import { DB } from "./deps.ts";
import { serve, ServerRequest } from "./deps.ts";
import { serveFile } from "./deps.ts";
import { posix } from "./deps.ts";
import { Status } from "./deps.ts";

import { getIndexer } from "./static/index.js";
import { apiError, TinyRouter } from "./static/router.js";


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
      "thread_title": "Shakespeare Sonnet 18",
      "body": "<p>Shall I compare thee to a summer’s day?</p><p>我是否可以把你比喻成夏天？</p><p>Thou art more lovely and more temperate</p><p>雖然你比夏天更可愛更溫和：</p><p>Rough winds do shake the darling buds of May，</p><p>狂風會使五月嬌蕾紅消香斷，</p><p>And summer’s lease hath all too short a date:</p><p>夏天擁有的時日也轉瞬即過；</p><p>Sometime too hot the eye of heaven shines，</p><p>有時天空之巨眼目光太熾熱，</p>",
      "icon": "👋",
      "ownerid": 1,
      "posts": [
        {
          "text": "To read Shakespeare’s poems and still think that what he says about time is just time and what he says about love is just love is to treat Shakespeare as a beat poet and the poems as meat from the supermarket freezer. Life is less than a line of metaphor in the literal sense of Shakespeare.",
          "score": 10,
          "hidden": 0,
          "userid": 1
        },
        {
          "text": "This infinite universe is all illusion to me， and you are my rose， my entire possession.",
          "score": 9,
          "hidden": 1,
          "userid": 2
        }
      ]
    },
    {
      "thread_title": "Shakespeare Sonnet 19",
      "body": "<p>Devouring time，blunt thou the lion’s paws，</p><p>貪婪的時光喲， 去磨鈍獅爪吧，</p><p>And make the earth devour her own sweet brood;</p><p>並讓大地吞噬自己可愛的子孫；</p><p>Pluck the keen teeth from the fierce tiger’s jaws，</p><p>從兇猛的老虎口中找出其利牙，</p><p>And burn the long-lived Phoenix in her blood;</p><p>讓不死鳥斷種絶根被燒成灰燼；</p><p>Make glad and sorry seasons as thou fleet’st，</p><p>似箭的光陰喲，任你恣意妄爲，</p><p>And do whate’er thou wilt，swift-footed time，</p><p>讓四季在你的飛逝中悲歡離合，</p><p>To the wide world and all her fading sweets:</p><p>讓世界和世間尤物都花謝花飛；</p><p>But I forbid thee one most heinous crime，</p><p>但我不許你去犯這樁滔天罪過：</p><p>O carve not with thy hours my love’s fair brow，</p><p>別把歲月之痕刻在我愛友眉間，</p><p>Nor draw no lines there with thine antique pen;</p><p>別用你老朽的畫筆在那兒塗抹；</p><p>Him in thy course untainted do allow</p><p>請容他在你的跑道上纖塵不染，</p><p>For beauty’s pattern to succeeding men.</p><p>爲人類後代子孫留下美之楷模。</p><p>Yet do thy worst，old Time，despite thy wrong，</p><p>但老邁的時間喲，不管你有多狠，</p><p>My love shall in my verse ever live young.</p><p>我愛友仍將在你（譯錯：我）的詩中永葆青春。</p><p><br/></p>",
      "ownerid": 2,
      "icon": "👋",
      "posts": [
        {
          "text": "Shakespeare expanded my understanding of poetry. Before that， all I knew was that poetry could be used to express love and affection. Now I know that it can also be used to“Urge a friend to marry”. True. Everything can be a poem.",
          "score": 8,
          "hidden": 0,
          "userid": 3
        },
        {
          "text": "The themes of love poems have been turned over and over again by later generations of poets， but Shakespeare’s poems are still shocking to read.",
          "score": 7,
          "hidden": 0,
          "userid": 4
        }
      ]
    },
    {
      "thread_title": "Shakespeare Sonnet 20",
      "body": "<p>A woman’s face with nature’s own hand painted</p><p>你有大自然親手妝扮的女性的臉，</p><p>Hast thou，the master mistress of my passion;</p><p>你喲，我苦思苦戀的情郎兼情婦；</p><p>A woman’s gentle heart，but not acquainted</p><p>你有女性的柔情，但卻沒有沾染</p><p>With shifting change，as is false women’s fashion;</p><p>時髦女人的水性楊花和朝秦暮楚；</p><p>An eye more bright than theirs，less false in rolling，</p><p>你眼睛比她們的明亮，但不輕佻，</p><p>Gilding the object whereupon it gazeth;</p><p>不會把所見之物都鍍上一層黃金；</p><p>A man in hue，all hues in his controlling，</p><p>你集美於一身，令嬌娃玉郎拜倒，</p><p>Which steals men’s eyes and women’s souls amazeth;</p><p>勾住了男人的眼也驚了女兒的心，</p><p>And for a woman wert thou first created，</p><p>大自然開始本想造你爲紅顏姝麗，</p><p>Till nature as she wrought thee fell a-doting，</p><p>但塑造之中她卻爲你而墮入情網，</p><p>And by addition me of thee defeated，</p><p>心醉神迷之間她剝奪了我的權利，</p><p>By adding one thing to my purpose nothing:</p><p>把一件對我無用的東西加你身上。</p><p>But since she pricked thee out for women’s pleasure，</p><p>但既然她爲女人的歡娛把你塑成，</p><p>Mine be thy love，and thy love’s use their treasure.</p><p>就把心之愛給我，肉體愛歸她們。</p><p><br/></p>",
      "ownerid": 3,
      "icon": "👋",
      "posts": [
        {
          "text": "Poetry is beautiful， more beautiful than all his plays， because the play is someone else’s， the poem is his own.",
          "score": 6,
          "hidden": 0,
          "userid": 5
        },
        {
          "text": "The only thing that can be felt is the classical beauty that settles between the lines， the truth against the lies， the virtue against the hypocrisy， the timelessness of love and poetry against the finiteness of time.",
          "score": 5,
          "hidden": 0,
          "userid": 1
        }
      ]
    },
    {
      "thread_title": "Shakespeare Sonnet 24",
      "body": "<p>Mine eye hath played the painter，and hath steeled</p><p>我的眼晴在扮演著一名畫師，</p><p>Thy beauty’s form in table of my heart;</p><p>在心之畫板上繪下你的倩影；</p><p>My body is the frame wherein’tis held，</p><p>這幅肖像的畫框是我的身軀，</p><p>And perspective it is best painter’s art;</p><p>而透視法是畫師的高超技能。</p><p>For through the painter must you see his skill，</p><p>因爲要發現藏你真容的地方，</p><p>To find where your true image pictured lies，</p><p>你得透過畫師去看他的功夫；</p><p>Which in my bosom’s shop is hanging still，</p><p>這幅畫永遠掛在我心之畫廊，</p><p>That hath his windows glazed with thine eyes:</p><p>畫廊窗戶鑲著你的燦燦明目。</p><p>Now see what good turns eyes for eyes have done:</p><p>請看眼晴相互行善有何善報：</p><p>Mine eyes have drawn thy shape，and thine for me</p><p>我的眼睛描給出了你的形體，</p><p>Are windows to my breast，wherethrough the sun</p><p>而你的明眸是我心靈之窗口，</p><p>Delights to peep，to gaze therein on thee;</p><p>太陽愛透過這窗口把你窺視；</p><p>Yet eyes this cunning want to grace their art:</p><p>不過眼睛還應該完善這門技巧：</p><p>They draw but what they see，know not the heart.</p><p>它們只畫外觀，內心卻不知道。</p><p><br/></p>",
      "ownerid": 4,
      "icon": "👋",
      "posts": [
        {
          "text": "Beautiful sentimental and romantic verse.",
          "score": 4,
          "hidden": 0,
          "userid": 2
        },
        {
          "text": "Even when time and appearance are looking forward to the death of love， true love will always make the first love of the blazing fire.",
          "score": 2,
          "hidden": 0,
          "userid": 3
        }
      ]
    },
    {
      "thread_title": "Shakespeare Sonnet 29",
      "body": "<p>When in disgrace with fortune and men’s eyes</p><p>逢時運不濟，或遭世人白眼，</p><p>I all alone beweep my outcast state，</p><p>我獨自向隅而泣恨無枝可依，</p><p>And trouble deaf heav’n with my bootless cries，</p><p>忽而枉對聾聵蒼昊祈哀告憐，</p><p>And look upon myself，and curse my fate，</p><p>忽而反躬自省咒詛命運乖戾，</p><p>Wishing me like to one more rich in hope，</p><p>總指望自己像人家前程似錦，</p><p>Featured like him，like him with friends possessed，</p><p>夢此君美貌，慕斯賓朋滿座，</p><p>Desiring this man’s art and that man’s scope，</p><p>歎彼君藝高，饞夫機遇緣分，</p><p>With what I most enjoy contented least;</p><p>卻偏偏看輕自家的至福極樂；</p><p>Yet in these thoughts myself almost despising，</p><p>可正當我妄自菲薄自慚形穢，</p><p>Haply I think on thee，and then my state，</p><p>我忽然想到了你，於是我心</p><p>Like to the lark at break of day arising，</p><p>便像雲雀在黎明時振翮高飛，</p><p>From sullen earth sings hymns at heaven’s gate;</p><p>離開陰沉的大地歌唱在天門；（第3行原要向上天哭訴，此行轉成向上天之門歌詠。）</p><p>For thy sweet love remembered such wealth brings</p><p>因想到你甜蜜的愛價值千金，</p><p>That then I scorn to change my state with kings.</p><p>我不屑與帝王交換我的處境。</p><p><br/></p>",
      "ownerid": 5,
      "icon": "👋",
      "posts": [
        {
          "text": "",
          "score": 0,
          "hidden": 0,
          "userid": 4
        },
        {
          "text": "",
          "score": 0,
          "hidden": 0,
          "userid": 5
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
  if(re.toString() == "") return apiError(`user ${username} have no exist`,Status.NotFound,);
  console.log("cc2: " + re[0]);
  
  //返回多个同名用户,默认取第一个, 虽然不可能发生.

  let attr = insteadAndSplitStr(re[0],",","#.#");

  console.log("id: " + attr[0]);
  console.log("name: " + attr[1]);
  //const result1 = re.passwd;
  //To check a password:
  if(bcrypt.compareSync(password, attr[3])) {
    const info = {
      status: "success",
      id: attr[0],
      name: username,
      realname: attr[2]

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

router.get("^/api/v1/getthreads/?$", (_req: any, params: any[]) => {
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
  let attr = insteadAndSplitStr(re[0],",","#.#");
  console.log(re[0]);  

  const tempdataset = {"threads": []};
for (const datas of re) {
  let sqlattr = insteadAndSplitStr(datas,",","#.#");
  console.log(sqlattr);  
  let json_string = "{id: '"+ sqlattr[0] + "', owner_id: '" +sqlattr[1]+"', title: '"+ insteadStr(insteadStr(insteadStr(sqlattr[2],"\\\\","\\\\"),"\'","\\\'"),"\"","\\\"") + "', body: '" +insteadStr(insteadStr(insteadStr(sqlattr[3],"\\\\","\\\\"),"\'","\\\'"),"\"","\\\"")+ "', icon: '" +sqlattr[4]+"'}";
  let json_data = eval('(' + json_string + ')');
  tempdataset.threads.push(json_data);
  console.log(json_data);
}
console.log(tempdataset);


  return (tempdataset);
  db.close();
  
});


router.get("^/api/v1/getmycomments/(\\d+)/?$", (_req: any, params: any[]) => {
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
  const userid = params[0];
  const db = new DB("thread.db");
  //大于三分算正面评价.

  //const re0 = JSON.stringify(db.query<[string, number]>("SELECT * FROM forum_content WHERE score > 3 AND user_id = ?",[userid]));
  const re0 = JSON.stringify(db.query<[string, number]>("select c.*, t.title from forum_content c inner join forum_title t on c.title_id = t.id WHERE score > 3 AND user_id = ?",[userid]));
  const re = eval('(' + re0 + ')');
  //console.log(re); 
  if(re.toString() == "") return apiError(`id ${userid} have no comments`,Status.NotFound,);
  let attr = insteadAndSplitStr(re[0],",","#.#");
  console.log(attr);  

  const tempdataset = {"user_id": userid,"commnets": []};
for (const datas of re) {
  let sqlattr = insteadAndSplitStr(datas,",","#.#");
  console.log("pure database commment content : " + sqlattr[3]);
  let json_string = "{id: '" + sqlattr[0] + "', titleid: '" + sqlattr[1] + "', title: '" + sqlattr[8] + "', order: '" + sqlattr[5] +"', content: '"+ insteadStr(insteadStr(insteadStr(sqlattr[3],"\\\\","\\\\"),"\'","\\\'"),"\"","\\\"") + "', score: '" +sqlattr[4]+ "', ishidden: '" +sqlattr[6]+"'}";
  console.log("json_string: " + json_string);
  let json_data = eval('(' + json_string + ')');
  tempdataset.commnets.push(json_data);
  //console.log(json_data);
}
console.log(tempdataset);


  return (tempdataset);
    // Close connection
    db.close();
  
});

router.get("^/api/v1/getcomments/(\\d+)/?$", (_req: any, params: any[]) => {
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
  const titleid = params[0];
  const db = new DB("thread.db");
  //大于三分算正面评价.
  const re0 = JSON.stringify(db.query<[string, number]>("SELECT * FROM forum_content WHERE is_hidden = 0 AND title_id = ?",[titleid]));
  const re = eval('(' + re0 + ')');
  if(re.toString() == "") return apiError(`id ${titleid} have no comments`,Status.NotFound,);
  let attr = insteadAndSplitStr(re[0],",","#.#");
  console.log(attr);  

  const tempdataset = {"title_id": titleid,"commnets": []};
for (const datas of re) {
  let sqlattr = insteadAndSplitStr(datas,",","#.#");
  let aa = "\\";

  console.log("pure database commment content : " + aa + " | " + sqlattr[3]);
  // 傻逼了, 这里是"\\\\","\\\\", 前边也得四个斜杠, 表示匹配2个斜杠, 要是两个就成了正则表达式的界限符了.
  // 必须得匹配两个斜杠,,前端传值的时候, 因为是json, 所以要传也至少得传两个, 但是到了数据库里会转义成一个, 取出来又变成两个, 所以至少得匹配两个.
  // 前端发两个,收两个.匹配两个也得转, 不转的话,前端收到的会只有一个\, 即 \u0000,.
  // '也得转,虽然在json和代码里单写一个'没问题, 但是在这里json构造的时候, eval由于非严格模式,会把傻逼'当成界限符.
  // 总结: 下边这点代码写的有问题

  let json_string = "{id: '"+ sqlattr[0] + "', userid: '" +sqlattr[2]+"', content: '"+ insteadStr(insteadStr(insteadStr(sqlattr[3],"\\\\","\\\\"),"\'","\\\'"),"\"","\\\"") + "', score: '" +sqlattr[4]+"'}";
  console.log("json_string: " + json_string);
  let json_data = eval('(' + json_string + ')');
  tempdataset.commnets.push(json_data);
  //console.log(json_data);
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
  const title = insteadStr(req.json.title,",","，");
  const body = insteadStr(req.json.body,",","，");
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
  // 会把评分也隐藏
  //const re0 = JSON.stringify(db.query<[string, number]>("SELECT avg(score) FROM forum_content WHERE title_id = ? AND is_hidden = 0", [titleid]));
  //只隐藏评论
  const re0 = JSON.stringify(db.query<[string, number]>("SELECT avg(score) FROM forum_content WHERE title_id = ?", [titleid]));

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
    return apiError(`no titleid ${req.json.titleid} or have no coments`,Status.NotFound,);
  }
});

router.post("^/api/v1/comment/?$", (req: { json: {
userid: any;
comment: any;
scores: any;
ishidden: any;
titleid: any;
}; }, params: any) => {
  const titleid = req.json.titleid;
  const userid = req.json.userid;
  const comment = insteadStr(req.json.comment,",","，");
  console.log("0: "+comment + " | " + req.json.comment);
  const scores = req.json.scores;
  const ishidden = req.json.ishidden;

  const db = new DB("thread.db");
  //TODO 每人只能评论一次, 只能评论存在的帖子 但是不存在的用户也能评论存在的帖子 也没有做参数类型强校验.
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

function insteadAndSplitStr(t: any, f: String, to: String){
  let str=t.toString()

  //这是一个正则类型的参数.
  //let fromstr = /+f+/g;
  console.log("f: " + f);
  let n=str.replace(new RegExp(f,'g'),to);
  console.log("insteadAndSplitStr n: " + n);
  let sqlattr = n.split(to,);
  // TODO 逗号分隔是个大问题.得替换
  return sqlattr;
}

function insteadStr(t: any, f: String, to: String){
  let str=t.toString()

  //这是一个正则类型的参数.
  //let fromstr = /+f+/g;
  //console.log("f: " + f);
  let n=str.replace(new RegExp(f,'g'),to);
  console.log("insteadStr t,n,to: " + t + " | " + n + " | " + to);
  return n;
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
