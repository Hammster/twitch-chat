'use strict'

import * as vscode from 'vscode'
import { TwitchChatProvider } from './twitchChat'
import * as twitchBot from 'twitch-bot'
import * as https from 'https'
import * as EventEmitter from 'events'

class TwitchChatEventEmitter extends EventEmitter {}
const twitchChatEventEmitter = new TwitchChatEventEmitter();

function getStreamData(channel) {
	https.get({
		'host': 'api.twitch.tv',
		'path': '/kraken/streams/' + channel,
		'port': 443,
		'method': 'GET',
		'headers': {
			// This is limited to a certain amount of requests, 
			// if the plugin gets to popular we need a config to set a custom Client-ID
			'Client-ID': 't4z7hvfvcrgmfrg9xtmed66ihiwk3d'
		}
	}, res => {
		res.setEncoding('utf8');
		let body = '';
		res.on('data', data => {
			body += data;
		})
		res.on('end', () => {
			twitchChatEventEmitter.emit('streamDataUpdate', JSON.parse(body));
			return JSON.parse(body)
		})
	})
}

export function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.rootPath
	const config = vscode.workspace.getConfiguration('twitchChat')
	const twitchChatProvider = new TwitchChatProvider(rootPath, config)
	const channel = config.channel
	const username = config.username
	const oauth = config.oauth
	let joined = false
	let activeChannel = channel
	let streamData = getStreamData(activeChannel)

	if (channel && username && oauth) {
		console.log(channel)
		const bot = new twitchBot({
			username: username,
			oauth: oauth,
			channels: [channel]
		})

		bot.on('join', () => {
			console.log("try joining")
			if (!joined) {
				joined = true
				console.log("joined")
				
				bot.on('message', (chatter) => {
					twitchChatProvider.addItem(chatter)
				})
			}
			console.log("===================")
		})

		bot.on('error', err => {
			vscode.window.showErrorMessage(err)
		})

		bot.on('part', (chatter) => {
			bot.join(activeChannel)
			streamData = getStreamData(activeChannel)
		})

		twitchChatEventEmitter.on('streamDataUpdate', (newStreamData) => {
			twitchChatProvider.connectToChannel(activeChannel, newStreamData)
		})

		vscode.commands.registerCommand('twitchChat.sendMessage', () => {
			vscode.window.showInputBox({ prompt: 'Enter a Chat message' }).then((message) => {
				if (message) {
					bot.say(message)
					twitchChatProvider.addItem({ message: message, username: username })
				}
				console.log("===================")
			})
		})

		vscode.commands.registerCommand('twitchChat.changeChannel', () => {
			vscode.window.showInputBox({ prompt: 'Enter a channelname' }).then((newChannel) => {
				if (newChannel) {
					bot.part(channel)
					activeChannel = newChannel
				}
			})
		})

		vscode.commands.registerCommand('twitchChat.openActiveStream', () => {
			vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://www.twitch.tv/' + activeChannel))
		})

		vscode.window.registerTreeDataProvider('twitchChat', twitchChatProvider)
	} else {
		vscode.window.showWarningMessage('TwitchChat need additional configuration')
	}
}