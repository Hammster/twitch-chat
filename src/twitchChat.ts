import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export class TwitchChatProvider implements vscode.TreeDataProvider<ChatEntry> {

	private _onDidChangeTreeData: vscode.EventEmitter<ChatEntry | undefined> = new vscode.EventEmitter<ChatEntry | undefined>()
	readonly onDidChangeTreeData: vscode.Event<ChatEntry | undefined> = this._onDidChangeTreeData.event
	public chatlog = [];

	constructor(private workspaceRoot: string, private config: vscode.WorkspaceConfiguration) {}

	addItem(chatLogObject): void {
		this.chatlog.push(new ChatEntry(this.formatMessage(chatLogObject), vscode.TreeItemCollapsibleState.None))
		if (this.chatlog.length > this.config.historysize) {
			const tempArray: Array<ChatEntry> = this.chatlog.slice().reverse()
			this.chatlog = tempArray.slice(0, this.config.historysize).reverse();
		}
		this.refresh()
	}

	formatMessage(chatlogObject): string {
		return `${chatlogObject.username}: ${chatlogObject.message}`
	}

	refresh(): void {
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