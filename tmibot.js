//This bot was created using javascript and uses the tmi api to connect to twitch by Sins of a Ninja
import tmi from "tmi.js";
import Commands from "./commands.json";
import TimedMessages from "./TimedMessages.json";
const badwords = require("./badwords.json");
const fetch = require("node-fetch");

//functions and vars
var users = [];
var permit = [];
var shoutOut = true;
var schedule = true;
var dice = true;
var counter = 0;
var messageDeletes = 0;
var linkDeletes = 0;
var mods = true;
var title = true;
var game = true;
var following = true;
var vips = true;
var uptime = true;
var song = true;

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
function checkUsers(status, username, channel) {
  if (status === "Joined") {
    // const user = new User(username, points);
    // users.push(user);

    console.log("Joined " + username);
  }
  if (status === "Left") {
    console.log("Left " + users[i].username);

    // for (let i = 0; i < users.length; i++) {
    //   if (users[i] === username) {
    //     users.shift(users[i]);
    //   }
    // }
  }
}

//refreshes bot
function refreshBot() {
  var thisTimeout = setTimeout(function () {
    client.connect().catch(console.error);
  }, 10000);
}

async function getLive() {
  let resp = await fetch(
    "https://api.twitch.tv/helix/search/channels?query=sinsofaninja",
    {
      method: "get",
      headers: {
        "client-id": "duual3o5vi0axbc7qryzgo9f18z2ek",
        Authorization: "Bearer rgllofa4q2yeh1z61l1xt76boajucs",
      },
    }
  );
  let data = await resp.json();
  let is_live = data.data[0];
  return is_live;
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
  if (value >= 1 && isModUp == false) {
    // console.log(userState.badges.broadcaster);

    count = count + 1;
    client.say(
      channel,
      `@${userState.username}, [WARNING!] [Stop Posting Links!]`
    );
    client.deletemessage(channel, userState.id);
    count = count + 1;
    console.log("count" + count);
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
    client.say(channel, `@${userState.username}, ${phrases[valuePhrases]} `);
    client.deletemessage(channel, userState.id);
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
  if (value >= 1 && isModUp == true) {
    client.deletemessage(channel, userState.id);
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

function Comms(message, userState, channel, isModUp) {
  message = message.toLowerCase();

  if (message.startsWith("!editcomm") && isModUp === true) {
    var command = message.split(" ")[1];
    var message = message.split(" ").slice(2).join(" ");
    console.log(command);
    if (command !== "" && message !== "") {
      for (let [i, comm] of Commands.commands.entries()) {
        if (comm.command === command) {
          comm.message = message;
          fs.writeFile("./commands.json", JSON.stringify(Commands), (err) => {
            if (err) {
              console.log(err);
            } else {
              client.say(
                channel,
                `@${userState.username} --> You have edited the ${command} command`
              );
              console.log(`${command} has been edited`);
            }
          });
        }
      }
    } else {
      client.say(
        channel,
        "Must enter the command name and message you want to replace."
      );
    }
  }

  if (message.startsWith("!editmessage") && isModUp === true) {
    var name = message.split(" ")[1];
    var timer = message.split(" ")[2];
    var message = message.split(" ").slice(3).join(" ");
    console.log(name);

    for (let [i, nam] of TimedMessages.timedMessage.entries()) {
      if (nam.name === name) {
        nam.timer = timer;
        if (message !== "") {
          nam.message = message;
        }

        fs.writeFile(
          "./TimedMessages.json",
          JSON.stringify(TimedMessages),
          (err) => {
            if (err) {
              console.log(err);
            } else {
              client.say(
                channel,
                `@${userState.username} --> You have edited the ${name} timed message`
              );
              console.log(`${name} timed message has been edited`);
            }
          }
        );
      }
    }
  }

  if (message.startsWith("!delcomm") && isModUp === true) {
    var command = message.split(" ")[1];
    console.log(command);

    for (let [i, comm] of Commands.commands.entries()) {
      if (comm.command === command) {
        Commands.commands.splice(i, 1);
        fs.writeFile("./commands.json", JSON.stringify(Commands), (err) => {
          if (err) {
            console.log(err);
          } else {
            client.say(
              channel,
              `@${userState.username} --> You have deleted the ${command} command`
            );
            console.log(`${command} has been deleted`);
          }
        });
      }
    }
  }

  if (message.startsWith("!delmessage") && isModUp === true) {
    var name = message.split(" ")[1];
    console.log(name);

    for (let [i, message] of TimedMessages.timedMessage.entries()) {
      if (message.name === name) {
        TimedMessages.timedMessage.splice(i, 1);
        fs.writeFile(
          "./TimedMessages.json",
          JSON.stringify(TimedMessages),
          (err) => {
            if (err) {
              console.log(err);
            } else {
              client.say(
                channel,
                `@${userState.username} --> You have deleted the ${name} timed message`
              );
              console.log(`${name} timed message has been deleted`);
            }
          }
        );
      }
    }
  }

  if (message.startsWith("!addcomm") && isModUp === true) {
    var command = message.split(" ")[1];
    var message = message.split(" ").slice(2).join(" ");
    console.log(command);
    console.log(message);
    Commands["commands"].push({
      command: command,
      active: true,
      message: message,
    });
  }

  if (message.startsWith("!addmessage") && isModUp === true) {
    var name = message.split(" ")[1];
    var timer = message.split(" ")[2];
    var lines = message.split(" ")[3];
    var message = message.split(" ").slice(4).join(" ");
    // console.log(name);
    // console.log(timer);
    // console.log(message);
    if (name !== "" && timer !== "" && lines !== "" && message !== "") {
      TimedMessages["timedMessage"].push({
        name: name,
        timer: timer,
        remaining: 0,
        lines: lines,
        message: message,
      });
      console.log(TimedMessages);
      fs.writeFile(
        "./TimedMessages.json",
        JSON.stringify(TimedMessages),
        (err) => {
          if (err) {
            console.log(err);
          } else {
            client.say(
              channel,
              `@${userState.username} --> You have added the ${name} timed message`
            );
            console.log(`${name} timed message has been added`);
          }
        }
      );
    } else {
      client.say(
        channel,
        `@${userState.username} --> Must enter name of message, how many minutes, how many chat lines, and what the message says.`
      );
    }
  }

  fetch("http://localhost:3001/commands")
    .then((res) => res.json())
    .then((data) => {
      data.map((command) => {
        if (message === `!${command.command}`) {
          client.say(channel, command.message);
          command.active = false;
          // console.log(command.command);
          setTimeout(function () {
            command.active = true;
            console.log(`${command.command} Done`);
          }, 30000);
        }
      });
    });
}
function ShoutOut(message, userState, channel, isModUp, shoutOut) {
  message = message.toLowerCase();

  if (message.startsWith("!shoutout")) {
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
    username: process.env.TWITCH_USER,
    password: process.env.OAUTH,
  },
  channels: ["SinsofaNinja"],
});

//connecting client to server
client.on("connected", (port, address) => {
  console.log(client);
  TimedMessages.timedMessage.forEach((name) => {
    console.log(parseInt(name.timer));

    setInterval(() => {
      //var followPhrases = phrases[Math.floor(Math.random() * phrases.length)];
      if (counter >= name.lines) {
        client.say("SinsofaNinja", `${name.message}`);
        counter = 0;
      }
    }, parseInt(name.timer) * 60000);
  });
});
client.connect().catch(console.error);
//chat moderation and commands
client.on("message", (channel, userState, message, self) => {
  // Don't listen to my own messages..
  if (self) return;
  if (userState.username === process.env.TWITCH_USER) return;
  //bools for mod broadcaster and both
  let isMod = userState.mod || userState["user-type"] === "mod";
  let isBroadcaster = userState.username === "sinsofaninja";
  let isModUp = isMod || isBroadcaster;
  // console.log("Broadcaster: ", isBroadcaster);
  // console.log("Mod: ", isMod);
  // console.log("Mod Up: ", isModUp);

  checkChatForLinks(userState, message, channel, isModUp, permit);

  FilterChat(userState, message, channel, isModUp, isBroadcaster);
  //SuperFilterChat(userState, message, channel, isModUp);

  // if (message.toLowerCase() === "!watchtime") {

  //       console.log(`${userState.username}`);
  // }

  if (message.toLowerCase()) {
    counter++;
    // console.log(counter);
  }
  client.on(
    "messagedeleted",
    (channel, username, deletedMessage, userstate) => {
      if (badwords.badWordsList.includes(deletedMessage)) {
        messageDeletes++;
      }
    }
  );
  Comms(message, userState, channel, isModUp);
  ShoutOut(message, userState, channel, isModUp, shoutOut);

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
      `@${userState.username}, I stream every Saturday & Sunday at 3pm CST / 4pm EST sometimes I do bonus streams on Thursday or Friday.`
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

  //  getLive().then((data) => {
  //    let live = data.is_live;
  //    if (live === true) {
  //       checkUsers("Joined", username);
  //      console.log("Online");
  //    }
  //    else{
  //      console.log("Offline");
  //      }
  //  });
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
  // checkUsers("Left", username);
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
