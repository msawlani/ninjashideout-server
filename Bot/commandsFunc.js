const fetch = require("node-fetch");
const url = "http://localhost:3001";
let activeIntervals = [];

export function Comms(message, userState, channel, isModUp, client) {
  message = message.toLowerCase();

  if (message.startsWith("!editcomm") && isModUp === true) {
    var command = {
      command: message.split(" ")[1],
      active: true,
      message: message.split(" ").slice(2).join(" "),
    };
    console.log(command);
    try {
      fetch(`${url}/commands/${command.command}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      }).catch((err) => {
        console.table(err);
      });
      client.say(channel, `${command.command} command has been edited!`);
    } catch (error) {
      console.table(error);
    }
  }

  if (message.startsWith("!editmessage") && isModUp === true) {
    var name = message.split(" ")[1];
    var timer = message.split(" ")[2];
    var message = message.split(" ").slice(3).join(" ");
    console.log(name);
  }

  if (message.startsWith("!delcomm") && isModUp === true) {
    var command = message.split(" ")[1];

    console.log(command);
    try {
      fetch(`${url}/commands/${command}`, { method: "DELETE" }).catch((err) => {
        console.table(err);
      });
      client.say(channel, `${command.command} command has been deleted!`);
    } catch (error) {
      console.table(error);
    }
  }

  if (message.startsWith("!delmessage") && isModUp === true) {
    var name = message.split(" ")[1];
    console.log(name);
  }

  if (message.startsWith("!addcomm") && isModUp === true) {
    var command = {
      command: message.split(" ")[1],
      active: true,
      message: message.split(" ").slice(2).join(" "),
    };
    console.log(command);
    try {
      fetch(`${url}/commands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      }).catch((err) => {
        console.table(err);
      });
      client.say(channel, `${command.command} command has been added!`);
    } catch (error) {
      console.table(error);
    }
  }

  if (message.startsWith("!addmessage") && isModUp === true) {
    var name = message.split(" ")[1];
    var time = message.split(" ")[2];
    var lines = message.split(" ")[3];
    var message = message.split(" ").slice(4).join(" ");
    // console.log(name);
    // console.log(timer);
    // console.log(message);
    let timedMessage = {
      name: name,
      time: time,
      lines: lines,
      message: message,
    };

    try {
      fetch(`${url}/timedmessages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timedMessage),
      }).catch((err) => {
        console.table(err);
      });
      client.say(channel, `${name} message has been added!`);
      startTimerMessage(client, channel, timedMessage);
    } catch (error) {
      console.table(error);
    }
  }

  fetch(`${url}/commands`)
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

let live;

fetch(`https://api.twitch.tv/helix/streams?user_login=sinsofaninja`, {
  headers: {
    "Client-ID": process.env.STREAMER_CLIENT_ID,
    Authorization: process.env.STREAMER_OAUTH2,
  },
})
  .then((res) => {
    if (!res.ok) {
      throw new Error("Network response is not OK");
    }
    return res.json();
  })
  .then((data) => {
    data.data.map((streamer) => {
      live = streamer.type;
    });
  });

export function startTimerMessage(client, channel, timerMessage, counter) {
  // if (response.data.data.length > 0) {
  //   console.log(`${channelName} is live`);
  // } else {
  //   console.log(`${channelName} is not live`);
  // }
  if (live === "live") {
    setInterval(() => {
      console.log("Done");
      console.log(timerMessage.message);
      //var followPhrases = phrases[Math.floor(Math.random() * phrases.length)];
      client.say(channel, `${timerMessage.message}`);
    }, parseInt(timerMessage.time) * 1000);
  } else {
    console.log("Offline");
  }
}
