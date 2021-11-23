"use strict";
/********************************************************************************
 * Copyright (c) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.openInTextEditorMessageType = exports.didCloseMessageType = exports.acceptMessageType = void 0;
var vscode_languageclient_1 = require("vscode-languageclient");
/////////////////////////////////////
// Sprotty LSP extensions
exports.acceptMessageType = new vscode_languageclient_1.NotificationType('diagram/accept');
exports.didCloseMessageType = new vscode_languageclient_1.NotificationType('diagram/didClose');
exports.openInTextEditorMessageType = new vscode_languageclient_1.NotificationType('diagram/openInTextEditor');
//# sourceMappingURL=protocol.js.map