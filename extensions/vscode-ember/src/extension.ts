import * as vscode from 'vscode';
import { ChatViewProvider } from './ChatViewProvider';
import { EmberClient } from './EmberClient';

let client: EmberClient;
let chatViewProvider: ChatViewProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('Ember AI extension activated');

    // Initialize client
    const config = vscode.workspace.getConfiguration('ember');
    const serverUrl = config.get<string>('serverUrl') || 'http://localhost:3000';
    client = new EmberClient(serverUrl);

    // Register chat view
    chatViewProvider = new ChatViewProvider(context.extensionUri, client);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('ember.chatView', chatViewProvider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('ember.chat', () => {
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ember.explain', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showWarningMessage('No text selected');
                return;
            }

            const language = editor.document.languageId;
            const prompt = `Explain this ${language} code:\n\n\`\`\`${language}\n${selection}\n\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ember.improve', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showWarningMessage('No text selected');
                return;
            }

            const language = editor.document.languageId;
            const prompt = `Improve this ${language} code. Suggest optimizations, better practices, and explain the improvements:\n\n\`\`\`${language}\n${selection}\n\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ember.generateTests', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showWarningMessage('No text selected');
                return;
            }

            const language = editor.document.languageId;
            const prompt = `Generate unit tests for this ${language} code:\n\n\`\`\`${language}\n${selection}\n\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('ember.serverUrl')) {
                const newUrl = vscode.workspace.getConfiguration('ember').get<string>('serverUrl') || 'http://localhost:3000';
                client.setServerUrl(newUrl);
            }
        })
    );
}

export function deactivate() {
    console.log('Ember AI extension deactivated');
}