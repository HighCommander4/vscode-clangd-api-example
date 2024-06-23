import * as vscode from 'vscode';
import type { ClangdExtension, ASTParams, ASTNode } from '@clangd/vscode-clangd';

const CLANGD_EXTENSION = 'llvm-vs-code-extensions.vscode-clangd';
const CLANGD_API_VERSION = 1;

const ASTType = 'textDocument/ast';

export async function activate(_context: vscode.ExtensionContext) { 
  vscode.languages.registerHoverProvider(['c', 'cpp'], {
    provideHover: async (document, position, _token) => {
      const clangdExtension = vscode.extensions.getExtension<ClangdExtension>(CLANGD_EXTENSION);
      if (!clangdExtension) {
        return undefined;
      }
      if (!clangdExtension.isActive) {
        await clangdExtension.activate();
      }
      const api = clangdExtension.exports.getApi(CLANGD_API_VERSION);
      const textDocument = api.languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document);
      const range = api.languageClient.code2ProtocolConverter.asRange(new vscode.Range(position, position));
      const params: ASTParams = { textDocument, range };
    
      const ast: ASTNode | undefined = await api.languageClient.sendRequest(ASTType, params);      
      if (!ast) {
        return undefined;
      }
      return {
        contents: [ast.kind]
      };
     }
  })
}
