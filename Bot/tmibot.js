//This bot was created using javascript and uses the tmi api to connect to twitch by Sins of a Ninja
import tmi from "tmi.js";
const badwords = require("./Data/badwords.json");
const fetch = require("node-fetch");
const url = "http://localhost:3001";
import { Comms, startTimerMessage, chatLinesCounter } from "./commandsFunc";
const MongoClient = require("mongodb").MongoClient;
const clientId = process.env.STREAMER_CLIENT_ID;
const accessToken = process.env.STREAMER_OAUTH2;

let clientdb = new MongoClient(process.env.DBCONNECTION);
let collection = clientdb.db("Ninjashideout").collection("viewers");

//functions and vars
var users = [];
var permit = [];
var shoutOut = true;
var schedule = true;
var dice = true;
var messageDeletes = 0;
var linkDeletes = 0;
var mods = true;
var title = true;
var game = true;
var following = true;
var vips = true;
var uptime = true;
var song = true;
var counter = 0;

let viewers = [];
let foundViewer = {};

//this is to create the user and involves time watched, points,
//and username plus there are prototypes to count points and total watch time
// var points = 0;

// function User(name, points) {
//   this.points = points;
//   this.name = name;
//   setInterval(function () {
//     points = ++points % 360;
//     console.log(points);
//   }, 1000);
// }

//check if user has join or left and creates a user object
//on join it will add that user to list of users
//on left it will delete user from list and store it into a file for next time they join
async function checkUsers(status, username, channel) {
  const viewer = {
    username: username,
    kunai: 0,
  };
  let foundViewer = await collection.findOne({ username: username });

  if (status === "Joined") {
    if (foundViewer) {
      viewers.push({
        username: foundViewer.username,
        kunai: foundViewer.kunai,
      });
    } else if (!viewers.includes((viewer) => viewer.username == username)) {
      viewers.push(viewer);
    }

    console.log(viewers);
    console.log("Joined " + username);
  }
  if (status === "Left") {
    let leftViewer = viewers.find((viewer) => viewer.username == username);

    if (foundViewer) {
      fetch(`${url}/kunaiSystem/${leftViewer.username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leftViewer),
      })
        .then((res) => res.json())
        .then((data) => console.log(data));
    } else {
      fetch(`${url}/kunaiSystem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leftViewer),
      })
        .then((res) => res.json())
        .then((data) => console.log(data));
      console.log(viewers);
      console.log("Left " + username);
    }

    viewers.splice(leftViewer);

    // for (let i = 0; i < users.length; i++) {
    //   if (users[i] === username) {
    //     users.shift(users[i]);
    //   }
    // }
  }
}
function DeleteMessage(id) {
  fetch(
    `https://api.twitch.tv/helix/moderation/chat?broadcaster_id=58688659&moderator_id=584386199&message_id=${id}`,
    {
      method: "DELETE",
      headers: {
        "Client-ID": process.env.BOT_ID,
        Authorization: process.env.BOT_TOKEN,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => console.log("Error", data));
}
//refreshes bot
function refreshBot() {
  var thisTimeout = setTimeout(function () {
    client.connect().catch(console.error);
  }, 10000);
}

async function getLive() {
  try {
    fetch(`https://api.twitch.tv/helix/streams?user_login=sinsofaninja`, {
      method: "GET",
      headers: {
        "Client-ID": process.env.STREAMER_CLIENT_ID,
        Authorization: process.env.STREAMER_OAUTH2,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data.length != 0) {
          console.log("he is live");
          setInterval(() => {
            for (let viewer of viewers) {
              viewer.kunai++;
            }
          }, 300000);
        } else {
          console.log("he is not live");
          setTimeout(() => getLive(), 5000);
        }
      });
  } catch (error) {
    console.log(error);
    setTimeout(() => getLive(), 5000);
  }
}

async function Test() {
  let resp = await fetch(
    "https://api.twitch.tv/helix/clips?broadcaster_id=58438619",
    {
      method: "get",
      headers: {
        "client-id": "duual3o5vi0axbc7qryzgo9f18z2ek",
        Authorization: "Bearer buz0d818e3zr9hglckw6b7uknj0jid",
      },
    }
  );
  let data = await resp.json();
  return data;
}

//checks if someone sends a link and if not a mod or broadcaster then it is deleted and client says something
function checkChatForLinks(userState, message, channel, isModUp, permit) {
  message = message.toLowerCase();
  var arr = [".tv", ".com", ".org", ".net", ".edu", ".gov", "https", "http"];
  var user = "";
  var value = 0;
  var count = 0;
  arr.forEach(function (word) {
    value = value + message.includes(word);
  });
  permit.forEach(function (name) {
    user = name;
    console.log(user);
  });

  console.log(value);
  if (value >= 1 && isModUp === false) {
    // console.log(userState.badges.broadcaster);
    try {
      count = count + 1;
      client.say(
        channel,
        `@${userState.username}, [WARNING!] [Stop Posting Links!]`
      );
      DeleteMessage(userState.id);
      count = count + 1;
      console.log("count" + count);
    } catch (error) {
      console.log(error);
    }
  }

  if (count === 3) {
    client.timeout(
      channel,
      userState.username,
      120,
      "Third time, I told you to stop and you didn't!"
    );
    count = 0;
  }
}
//check if there are bad words being sent and deletes them then client sends a message to chat
function SuperFilterChat(userState, message, channel, isModUp) {
  message = message.toLowerCase();
  var phrases = [
    "Hey! stop saying those words",
    "I can do this all day, stop saying that!",
    "HEY YOU, YEA YOU! Bad words will not be tolerated!",
  ];
  var valuePhrases = Math.floor(Math.random() * phrases.length);
  var value = 0;
  badwords.superBadWordsList.forEach((word) => {
    value = value + message.includes(word);
  });

  console.log(value);
  if (value >= 1 && isModUp === false) {
    // console.log(userState.badges.broadcaster);
    try {
      client.say(channel, `@${userState.username}, ${phrases[valuePhrases]} `);
      DeleteMessage(userState.id);
    } catch (error) {
      console.log(error);
    }
  }
  if (messageDeletes == 3) {
    client.timeout(
      channel,
      userState.username,
      120,
      "Third time, I told you to stop and you didn't!"
    );
    messageDeletes = 0;
  }
}

function FilterChat(userState, message, channel, isModUp, isBroadcaster) {
  message = message.toLowerCase();
  var phrases = [
    "Hey! stop saying those words",
    "I can do this all day, stop saying that!",
    "HEY YOU, YEA YOU! Bad words will not be tolerated!",
  ];
  var valuePhrases = Math.floor(Math.random() * phrases.length);
  var value = 0;
  var count = 0;

  badwords.badWordsList.forEach((word) => {
    value = value + message.includes(word);
  });

  // console.log(value);
  if (value >= 1 && isModUp === false) {
    try {
      client.say(channel, `@${userState.username}, ${phrases[valuePhrases]} `);
      DeleteMessage(userState.id);
    } catch (error) {
      console.log(error);
    }
  }
  if (messageDeletes == 3) {
    client.timeout(
      channel,
      userState.username,
      120,
      "Third time, I told you to stop and you didn't!"
    );
    messageDeletes = 0;
  }
}

function KunaiCommands(message, userState, channel, isModUp) {
  message = message.toLowerCase();

  if (message.startsWith("!givekunai") && isModUp) {
    var user = message.split(" ")[1];
    var kunai = Number(message.split(" ")[2]);
    let viewerToAdd = viewers.find((viewer) => viewer.username === user);
    viewerToAdd.kunai += kunai;
    client.say(
      channel,
      `Added ${kunai} kunai(s) to ${user}. They now have a total of ${viewerToAdd.kunai}`
    );
  }

  if (message.startsWith("!removekunai") & isModUp) {
    var user = message.split(" ")[1];
    var kunai = Number(message.split(" ")[2]);
    let viewerToRemove = viewers.find((viewer) => viewer.username === user);
    let newKunai = Math.max(0, viewerToRemove.kunai - kunai);
    viewerToRemove.kunai = newKunai;
    client.say(
      channel,
      `Removed ${kunai} kunai(s) from ${user}. They now have a total of ${viewerToRemove.kunai}`
    );
  }
}

function ShoutOut(message, userState, channel, isModUp, shoutOut) {
  message = message.toLowerCase();

  if (message.startsWith("!shoutout") && isModUp) {
    var user = message.split(" ")[1];
    console.log(user);
    if (typeof user !== "undefined" && isModUp === true) {
      client.say(
        channel,
        `Hey guys, ${user} streams go check them out! https://www.twitch.tv/${user}`
      );
    } else {
      if (shoutOut === true) {
        client.say(
          channel,
          `Hey guys, @${userState.username} streams go check them out! https://www.twitch.tv/${userState.username}`
        );
        shoutOut = false;
        setTimeout(function () {
          shoutOut = true;
          console.log("shoutOut Done");
        }, 30000);
      }
    }
  }
}

// function rollDice() {
//   const sides = 6;
//   return Math.floor(Math.random() * sides) + 1;
// }

// //making client
const client = new tmi.Client({
  options: { debug: true },
  connection: {
    reconnect: true,
    secure: true,
    timeout: 180000,
    reconnectDecay: 1.4,
    reconnectInterval: 1000,
  },
  identity: {
    username: process.env.BOT_NAME,
    password: process.env.BOT_OAUTH,
  },
  channels: ["SinsofaNinja"],
});

//connecting client to server
client.on("connected", (port, address) => {
  let isLive = fetch(
    `https://api.twitch.tv/helix/streams?user_login=sinsofaninja`,
    {
      headers: {
        "Client-ID": process.env.STREAMER_CLIENT_ID,
        Authorization: process.env.STREAMER_OAUTH2,
      },
    }
  ).then((res) => {
    console.log(res);
    // if (res.data.length) {
    //   console.log("Online");
    //   return true;
    // } else {
    //   console.log("Offline");
    //   return false;
    // }
  });
  console.log(client);
  fetch(`${url}/timedmessages`)
    .then((res) => res.json())
    .then((data) => {
      data.forEach((timedMessage) => {
        startTimerMessage(client, "sinsofaninja", timedMessage);
      });
    });
  getLive();
});

client.connect().catch(console.error);

client.on("disconnected", () => {
  console.log("Disconnected");
});

client.on("message", (channel, userState, message, self) => {
  // Don't listen to my own messages..
  if (self) return;
  if (userState.username === process.env.BOT_NAME) return;
  //bools for mod broadcaster and both
  let isMod = userState.mod || userState["user-type"] === "mod";
  let isBroadcaster = userState.username === "sinsofaninja";
  let isModUp = isMod || isBroadcaster;
  // console.log("Broadcaster: ", isBroadcaster);
  // console.log("Mod: ", isMod);
  // console.log("Mod Up: ", isModUp);

  console.log(userState.id);

  chatLinesCounter.counter++;

  if (isBroadcaster === false) {
    console.log("test");
  }

  checkChatForLinks(userState, message, channel, isModUp, permit);

  KunaiCommands(message, userState, channel, isModUp);

  FilterChat(userState, message, channel, isModUp, isBroadcaster);
  //SuperFilterChat(userState, message, channel, isModUp);

  // if (message.toLowerCase() === "!watchtime") {

  //       console.log(`${userState.username}`);
  // }
  client.on(
    "messagedeleted",
    (channel, username, deletedMessage, userstate) => {
      if (badwords.badWordsList.includes(deletedMessage)) {
        messageDeletes++;
      }
    }
  );
  Comms(message, userState, channel, isModUp, client, isBroadcaster);
  ShoutOut(message, userState, channel, isModUp, shoutOut);

  if (message.toLowerCase() === "!part") {
    client.part(channel);
  }

  if (message.toLowerCase() === "!join") {
    client.join(channel);
  }

  if (message.toLowerCase() === "!kunai") {
    let viewer = viewers.find(
      (viewer) => viewer.username === userState.username
    );

    if (viewer) {
      client.say(
        channel,
        `${viewer.username}, You have ${viewer.kunai} kunai(s)`
      );
    }
  }

  if (message.toLowerCase() === "!recthat") {
    fetch(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${process.env.STREAMER_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: process.env.STREAMER_OAUTH,
          "Client-Id": process.env.STREAMER_CLIENT_ID,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (
          data.message != "Clipping is not possible for an offline channel."
        ) {
          client.say(
            channel,
            `Clip has been successfully saved! ${data.message}`
          );
          return;
        }
        client.say(channel, data.message);
      });
  }

  if (message.toLowerCase() === "!ad" && isBroadcaster === true) {
    client.say(channel, "Will be playing a 30 second Ad.");
    client
      .commercial(channel, 30)
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (message.toLowerCase() === "!mods") {
    client
      .mods(channel)
      .then((data) => {
        client.say(channel, "Here is a list of mods: " + data.join(", "));
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
    mods = false;
    setTimeout(function () {
      mods = true;
      console.log("mods Done");
    }, 30000);
  }
  if (message.toLowerCase() === "!users") {
    console.log(users);
  }

  if (message.toLowerCase() === "!vips") {
    client
      .vips(channel)
      .then((data) => {
        client.say(channel, "Here is a list of vips: " + data.join(", "));
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
    vips = false;
    setTimeout(function () {
      vips = true;
      console.log("vips Done");
    }, 30000);
  }

  if (message.toLowerCase() === "!dice" && dice) {
    const num = rollDice();
    client.say(channel, `@${userState.username}, You rolled a ${num}`);
    dice = false;
    setTimeout(function () {
      dice = true;
      console.log("dice Done");
    }, 10000);
  }

  if (message.toLowerCase() === "!refresh" && isBroadcaster === true) {
    client
      .disconnect()
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
    refreshBot();
  }
  if (message.toLowerCase() === "!song") {
    fetch(`https://groke.se/twitch/spotify/?9f7081b35b86f448e452bc81935f2927`)
      .then((res) => res.text())
      .then((song) =>
        client.say(
          channel,
          `@${userState.username}, Currently listening to, ${song}`
        )
      );
    song = false;
    setTimeout(function () {
      song = true;
      console.log("song Done");
    }, 15000);
  }
  if (message.toLowerCase() === "!title") {
    fetch(`https://decapi.me/twitch/title/sinsofaninja`)
      .then((res) => res.text())
      .then((title) =>
        client.say(
          channel,
          `@${userState.username}, Currently the title is: ${title}`
        )
      );
    title = false;
    setTimeout(function () {
      title = true;
      console.log("title Done");
    }, 15000);
  }
  if (message.toLowerCase() === "!game") {
    fetch(`https://decapi.me/twitch/game/sinsofaninja`)
      .then((res) => res.text())
      .then((game) =>
        client.say(
          channel,
          `@${userState.username}, Currently I am playing: ${game}`
        )
      );
    game = false;
    setTimeout(function () {
      game = true;
      console.log("game Done");
    }, 15000);
  }

  if (message.toLowerCase() === "!following") {
    fetch(
      `https://api.2g.be/twitch/followage/sinsofaninja/${userState.username}?format=monthday`
    )
      .then((res) => res.text())
      .then((date) => client.say(channel, date));
    following = false;
    setTimeout(function () {
      following = true;
      console.log("following Done");
    }, 10000);
  }

  if (message.toLowerCase() === "!uptime" && isBroadcaster) {
    fetch(`https://decapi.me/twitch/uptime/sinsofaninja`)
      .then((res) => res.text())
      .then((uptime) => client.say(channel, uptime));
    uptime = false;
    setTimeout(function () {
      uptime = true;
      console.log("uptime Done");
    }, 10000);
  }

  if (message.toLowerCase() === "!alive" && alive) {
    getLive().then((data) => {
      console.log(data);
    });
    alive = false;
    setTimeout(function () {
      alive = true;
      console.log("alive Done");
    }, 30000);
  }
  if (message.toLowerCase() === "!clip") {
    Test().then((data) => {
      console.log(data);
    });
  }
  if (message.toLowerCase() === "!schedule" && schedule) {
    client.say(
      channel,
      `@${userState.username}, I stream Thursday to Monday at 2pm CST / 3pm EST to 5pm EST.`
    );

    schedule = false;
    setTimeout(function () {
      schedule = true;
      console.log("schedule Done");
    }, 30000);
  }
});

//handles when someone joins
client.on("join", (channel, username, self) => {
  checkUsers("Joined", username);
});

client.on("resub", (channel, username, months, message, userstate, methods) => {
  // Do your stuff.
  //let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
  client.say(
    channel,
    `Welcome back, ${userstate.username}, Thanks for the ${months} months!`
  );
});

client.on("subscription", (channel, username, method, message, userstate) => {
  client.say(channel, `${userstate.username}, Thanks for subbing :)`);
});

client.on(
  "subgift",
  (channel, username, streakMonths, recipient, methods, userstate) => {
    // Do your stuff.
    let senderCount = ~~userstate["msg-param-sender-count"];
    if (senderCount > 1) {
      client.say(
        channel,
        `Thanks for gifting ${senderCount} subs, ${userstate.username}`
      );
    } else {
      client.say(
        channel,
        `Thanks for gifting ${senderCount} sub, ${userstate.username}`
      );
    }
  }
);

client.on("notice", (channel, msgid, message) => {
  console.log(channel, msgid, message);
});

//handles when someone leaves
client.on("part", (channel, username, self) => {
  checkUsers("Left", username);
});

//handles if i raid someone and client says which channel, link to channel, and viewer count
client.on("raided", (channel, username, viewers) => {
  if (viewers > 1 || viewers === 0) {
    client.say(
      channel,
      `!so @${username} Go follow this amazing person, they just raided me with ${viewers} Viewers!! https://www.twitch.tv/${username}`
    );
  } else {
    client.say(
      channel,
      `!so @${username} Go follow this amazing person, they just raided me with ${viewers} Viewer!! https://www.twitch.tv/${username}`
    );
  }
});

//handles if i host someone and client says which channel, link to channel, and viewer count
client.on("hosting", (channel, target, viewers) => {
  if (viewers > 1 || viewers === 0) {
    client.say(
      channel,
      "Quick join this raid! https://www.twitch.tv/" +
        target +
        " with " +
        viewers +
        " viewers!"
    );
  } else {
    client.say(
      channel,
      "Quick join this raid! https://www.twitch.tv/" +
        target +
        " with " +
        viewers +
        " viewer!"
    );
  }
});

client.on("hosted", (channel, username, viewers) => {
  client.say(
    channel,
    "You are now being hosted by " +
      username +
      ", with " +
      viewers +
      " viewers " +
      " Go follow this person https://www.twitch.tv/" +
      username
  );
});
