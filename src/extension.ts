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

	if (channel && username && oauth) {
		const bot = new twitchBot({
			username: username,
			oauth: oauth,
			channels: [channel]
		})

		bot.on('join', () => {
			if (!joined) {
				joined = true
				bot.on('message', (x) => {
					twitchChatProvider.addItem(x)
				})
			}
		})

		bot.on("error", err => {
			vscode.window.showErrorMessage(err)
		})

		vscode.commands.registerCommand('twitchChat.sendMessage', () => {
			vscode.window.showInputBox({ prompt: "Enter a Chat message" }).then((x) => {
				if(x) {
					bot.say(x)
					twitchChatProvider.addItem({message:x, username:username})
				}
			})
		})

		vscode.window.registerTreeDataProvider('twitchChat', twitchChatProvider)
	} else {
		vscode.window.showWarningMessage('TwitchChat need additional configuration')
	}
}
