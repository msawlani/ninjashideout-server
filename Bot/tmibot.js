//This bot was created using javascript and uses the tmi api to connect to twitch by Sins of a Ninja
import tmi from "tmi.js";
const badwords = require("./Data/badwords.json");
const fetch = require("node-fetch");
const url = "http://localhost:3001";
import {
  Comms,
  startTimerMessage,
  chatLinesCounter,
  CustomCommands,
} from "./commandsFunc";
const MongoClient = require("mongodb").MongoClient;
const clientId = process.env.STREAMER_CLIENT_ID;
const accessToken = process.env.STREAMER_OAUTH2;

let clientdb = new MongoClient(process.env.DBCONNECTION);
let collection = clientdb.db("Ninjashideout").collection("viewers");

//functions and vars
var permit = [];
var shoutOut = true;
var messageDeletes = 0;

let viewers = [];

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
    let leftViewer =
      viewers.find((viewer) => viewer.username == username) || {};
    let user;
    let index = viewers.findIndex((viewer) => viewer.username === username);
    if (leftViewer !== undefined) user = leftViewer.username;
    try {
      fetch(`${url}/kunaiSystem/${user}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leftViewer),
      })
        .then((res) => res.json())
        .then((data) => console.log(data));
      viewers.splice(index, 1);
    } catch (error) {
      console.log(error);
    }

    // else {
    //   try {
    //     fetch(`${url}/kunaiSystem`, {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(leftViewer),
    //     })
    //       .then((res) => res.json())
    //       .then((data) => console.log(data));
    //     console.log(viewers);
    //     console.log("Left " + username);
    //     viewers.splice(index, 1);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }

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

  chatLinesCounter.counter++;

  CustomCommands(
    channel,
    userState,
    message,
    client,
    isModUp,
    isBroadcaster,
    viewers
  );

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
