"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ChatViewProvider_1 = require("./ChatViewProvider");
const EmberClient_1 = require("./EmberClient");
let client;
let chatViewProvider;
function activate(context) {
    console.log('Ember AI extension activated');
    // Initialize client
    const config = vscode.workspace.getConfiguration('ember');
    const serverUrl = config.get('serverUrl') || 'http://localhost:3000';
    client = new EmberClient_1.EmberClient(serverUrl);
    // Register chat view
    chatViewProvider = new ChatViewProvider_1.ChatViewProvider(context.extensionUri, client);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('ember.chatView', chatViewProvider));
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('ember.chat', () => {
        vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ember.explain', async () => {
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
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ember.improve', async () => {
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
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ember.generateTests', async () => {
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
    }));
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('ember.serverUrl')) {
            const newUrl = vscode.workspace.getConfiguration('ember').get('serverUrl') || 'http://localhost:3000';
            client.setServerUrl(newUrl);
        }
    }));
}
function deactivate() {
    console.log('Ember AI extension deactivated');
}
