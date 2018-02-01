import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export class TwitchChatProvider implements vscode.TreeDataProvider<ChatEntry> {

	private _onDidChangeTreeData: vscode.EventEmitter<ChatEntry | undefined> = new vscode.EventEmitter<ChatEntry | undefined>()
	readonly onDidChangeTreeData: vscode.Event<ChatEntry | undefined> = this._onDidChangeTreeData.event
	public chatlog = [];

	constructor(private workspaceRoot: string, private config: vscode.WorkspaceConfiguration) { }

	addItem(chatLogObjectOrString): void {
		const message = typeof (chatLogObjectOrString) === 'object' ? this.formatMessage(chatLogObjectOrString) : chatLogObjectOrString
		this.chatlog.push(new ChatEntry(message, vscode.TreeItemCollapsibleState.None))
		this.refresh()
	}

	connectToChannel(channel, streamData): void {
		const channelName = streamData.stream ? streamData.stream.channel.display_name : channel
		this.chatlog.push(new ChatEntry('>>>>>>> JOINED: ' + channelName + ' [' + (streamData.stream ? 'online' : 'offline') + ']', vscode.TreeItemCollapsibleState.None))
		this.refresh()
	}

	sliceChat(): void {
		if (this.chatlog.length > this.config.historysize) {
			const tempArray: Array<ChatEntry> = this.chatlog.slice().reverse()
			this.chatlog = tempArray.slice(0, this.config.historysize).reverse();
		}
	}

	formatMessage(chatlogObject): string {
		return `${chatlogObject.username}: ${chatlogObject.message}`
	}

	refresh(): void {
		this.sliceChat()
		this._onDidChangeTreeData.fire()
	}

	getTreeItem(element: ChatEntry): vscode.TreeItem {
		return element
	}

	getChildren(element?: ChatEntry): Thenable<ChatEntry[]> {
		return new Promise(resolve => {
			resolve(this.chatlog.slice().reverse())
		})
	}
}

class ChatEntry extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState)
	}

	contextValue = 'chatentry'
}