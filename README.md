# Twitch Chat for Visual Studio Code

[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/hammster1911.twitch-chat.svg)](https://marketplace.visualstudio.com/items?itemName=hammster1911.twitch-chat)
[![Installs](https://img.shields.io/vscode-marketplace/d/hammster1911.twitch-chat.svg)](https://marketplace.visualstudio.com/items?itemName=hammster1911.twitch-chat)
[![Rating](https://img.shields.io/vscode-marketplace/r/hammster1911.twitch-chat.svg)](https://marketplace.visualstudio.com/items?itemName=hammster1911.twitch-chat)

![Logo](https://raw.githubusercontent.com/Hammster/twitch-chat/master/media/twitchChat.png "twitch-chat extension logo")

## Features

Adds a Chat log to the Explorer view
Send chat messages without leaving VScode

![Screenshot](https://raw.githubusercontent.com/Hammster/twitch-chat/master/media/example.jpg "Screenshot showing the twitch-chat extension")


## Extension Settings

These settings have to be 

```js
{
  // Generate a token here: http://www.twitchapps.com/tmi
  "twitchChat.oauth": "************",
  "twitchChat.username": "TwitchUserName",
  "twitchChat.channel": "channelname",
  // Optional: Set the amount of chatmessages that are shown
  "twitchChat.historysize": 20
}
```
## Known Issues

The Chatlogs are limited to a set height, therefore text is cut off and you have to read the content by hovering the entry
Icons are not displayed