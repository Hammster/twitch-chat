'use strict'

import * as vscode from 'vscode'
import { TwitchChatProvider } from './twitchChat'
import * as twitchBot from 'twitch-bot'

export function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.rootPath
	const config = vscode.workspace.getConfiguration('twitchChat')
	const twitchChatProvider = new TwitchChatProvider(rootPath, config)
	const channel = config.channel
	const username = config.username
	const oauth = config.oauth
	let joined = false
	let activeChannel = channel


	if (channel && username && oauth) {
		const bot = new twitchBot({
			username: username,
			oauth: oauth,
			channels: [channel]
		})

		bot.on('join', () => {
			if (!joined) {
				joined = true
				bot.on('message', (chatter) => {
					twitchChatProvider.addItem(chatter)
				})
			}
		})

		bot.on("error", err => {
			vscode.window.showErrorMessage(err)
		})

		vscode.commands.registerCommand('twitchChat.sendMessage', () => {
			vscode.window.showInputBox({ prompt: "Enter a Chat message" }).then((message) => {
				if(message) {
					bot.say(message)
					twitchChatProvider.addItem({message:message, username:username})
				}
			})
		})

		vscode.commands.registerCommand('twitchChat.changeChannel', () => {
			vscode.window.showInputBox({ prompt: "Enter a channelname" }).then((newChannel) => {
				if(newChannel) {
					bot.part(channel)
					bot.join(newChannel)
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
