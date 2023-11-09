const fetch = require("node-fetch");
const url = "http://localhost:3001";

export var chatLinesCounter = {
  counter: 0,
};

export function Comms(
  message,
  userState,
  channel,
  isModUp,
  client,
  isBroadcaster
) {
  message = message.toLowerCase();
  if (message.startsWith("!editcomm") && isModUp === true) {
    var command = {
      command: message.split(" ")[1],
      modandup: false,
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
      modandup: false,
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
          if (command.modandup === isModUp) {
            client.say(channel, command.message);
            command.active = false;
            // console.log(command.command);
            setTimeout(function () {
              command.active = true;
              console.log(`${command.command} Done`);
            }, 30000);
          } else {
            client.say(channel, command.message);
            command.active = false;
            // console.log(command.command);
            setTimeout(function () {
              command.active = true;
              console.log(`${command.command} Done`);
            }, 30000);
          }
        }
      });
    });
}

export function startTimerMessage(client, channel, timerMessage, counter) {
  setInterval(() => {
    if (timerMessage.lines <= chatLinesCounter.counter) {
      client.say(channel, `${timerMessage.message}`);
      chatLinesCounter.counter = 0;
    }
  }, parseInt(timerMessage.time) * 1000);
}

export function CustomCommands(
  channel,
  userState,
  message,
  client,
  isModUp,
  isBroadcaster
) {
  function refreshBot() {
    var thisTimeout = setTimeout(function () {
      client.connect().catch(console.error);
    }, 10000);
  }

  if (message.toLowerCase() === "!part" && isModUp) {
    client.part(channel);
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
    try {
      fetch(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${process.env.STREAMER_ID}`,
        {
          method: "POST",
          headers: {
            Authorization: process.env.STREAMER_OAUTH2,
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
    } catch (error) {
      console.log(error);
    }
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

  if (message.toLowerCase() === "!dice" && dice) {
    let dice = true;
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
    let song = true;
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
}
