/*
 * KIELER - Kiel Integrated Environment for Layout Eclipse RichClient
 *
 * http://rtsys.informatik.uni-kiel.de/kieler
 *
 * Copyright 2022 by
 * + Kiel University
 *   + Department of Computer Science
 *     + Real-Time and Embedded Systems Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { inject, postConstruct } from "inversify";
import { ModelViewer } from "sprotty";
import { DISymbol } from "./di.symbols";
import { Model } from '../src-language-server/generated/ast';

export class StpaModelViewer extends ModelViewer {
    // @ts-ignore
    @inject(DISymbol.Sidebar) private sidebar: unknown;

    @postConstruct()
    init(): void {

    }

}

export class FtaModelViewer extends ModelViewer{

    @postConstruct()
    init(): void {

    }
}