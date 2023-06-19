/*
 * KIELER - Kiel Integrated Environment for Layout Eclipse RichClient
 *
 * http://rtsys.informatik.uni-kiel.de/kieler
 *
 * Copyright 2023 by
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

import * as vscode from 'vscode';
import { StpaComponent, StpaResult, UCA_TYPE, createFile } from './utils';

export async function createMarkdownFile(data: StpaResult): Promise<void> {
    // Ask the user where to save the sbm
    const currentFolder = vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;
    const uri = await vscode.window.showSaveDialog({
        filters: { Markdown: ['md'] },
        // TODO: not possible with current vscode version
        // title: 'Save Markdown to...',
        defaultUri: currentFolder ? vscode.Uri.file(`${currentFolder}/report.md`) : undefined,
    });
    if (uri === undefined) {
        // The user did not pick any file to save to.
        return;
    }
    // create a markdown file
    // TODO: adjust path
    const markdown = createMarkdownText(data, uri.path.substring(0, uri.path.lastIndexOf('/')));

    createFile(uri.path, markdown);

}

class Headers {
    static Loss = "Losses";
    static Hazard = "Hazards";
    static SystemLevelConstraint = "System-level Constraints";
    static Responsibility = "Responsibilities";
    static UCA = "UCAs";
    static ControllerConstraint = "Controller Constraints";
    static LossScenario = "Loss Scenarios";
    static SafetyRequirement = "Safety Requirements";
}

function createMarkdownText(data: StpaResult, uri: string): string {
    // TODO: add control structure, context table, diagrams
    let markdown = "";
    markdown += `# STPA Report\n\n`;
    // losses
    markdown += stpaAspectToMarkdown(Headers.Loss, data.losses);
    // hazards
    markdown += stpaAspectToMarkdown(Headers.Hazard, data.hazards);
    // system-level constraints
    markdown += stpaAspectToMarkdown(Headers.SystemLevelConstraint, data.systemLevelConstraints);
    // control structure
    markdown += addControlStructure(uri);
    // responsibilities
    markdown += recordToMarkdown(Headers.Responsibility, data.responsibilities);
    // UCAs TODO
    markdown += ucasToMarkdown(data.ucas);
    // controller constraints
    markdown += stpaAspectToMarkdown(Headers.ControllerConstraint, data.controllerConstraints);
    // loss scenarios
    markdown += scenariosToMarkdown(data.ucaScenarios, data.scenarios);
    // safety requirements
    markdown += stpaAspectToMarkdown(Headers.SafetyRequirement, data.safetyCons);
    // summarize safety constraints
    markdown += addSummary(data);
    return markdown;
}

function stpaAspectToMarkdown(aspect: string, components: StpaComponent[]): string {
    let markdown = `## ${aspect}\n\n`;
    for (const component of components) {
        markdown += stpaComponentToMarkdown(component);
        markdown += `  \n`;
    }
    markdown += `\n`;
    return markdown;
}

function stpaComponentToMarkdown(component: StpaComponent): string {
    let markdown = `**${component.id}**: ${component.description}`;
    if (component.references !== undefined && component.references !== "") {
        markdown += ` [${component.references}]`;
    }
    return markdown;
}

function recordToMarkdown(aspect: string, data: Record<string, StpaComponent[]>): string {
    let markdown = `## ${aspect}\n\n`;
    for (const reference in data) {
        markdown += `_${reference}_  \n`;
        for (const component of data[reference]) {
            markdown += stpaComponentToMarkdown(component);
            markdown += `  \n`;
        }
        markdown += `\n`;
    }
    return markdown;
}

function scenariosToMarkdown(ucaScenarios: Record<string, StpaComponent[]>, scenarios: StpaComponent[]): string {
    let markdown = recordToMarkdown(Headers.LossScenario, ucaScenarios);
    if (scenarios.length !== 0) {
        markdown += `**Scenarios without associated UCA**\n\n`;
        markdown += scenarios.map(scenario => stpaComponentToMarkdown(scenario)).join("  \n");
        markdown += `\n`;
    }
    return markdown;
}

function ucasToMarkdown(actionUcas: { controlAction: string, ucas: Record<string, StpaComponent[]>; }[]): string {
    let markdown = `## ${Headers.UCA}\n\n`;
    markdown += `| Control Action | not provided | provided | too late or too early | applied too long or stopped too soon |\n`;
    // TODO: alignment? (:---:)
    markdown += `| --- | --- | --- | --- | --- |\n`;
    for (const actionUCA of actionUcas) {
        markdown += `| ${actionUCA.controlAction} |`;
        markdown += actionUCA.ucas[UCA_TYPE.NOT_PROVIDED].map(uca => stpaComponentToMarkdown(uca)).join("<br><br>");
        markdown += "|";
        markdown += actionUCA.ucas[UCA_TYPE.PROVIDED].map(uca => stpaComponentToMarkdown(uca)).join("<br><br>");
        markdown += "|";
        markdown += actionUCA.ucas[UCA_TYPE.WRONG_TIME].map(uca => stpaComponentToMarkdown(uca)).join("<br><br>");
        markdown += "|";
        markdown += actionUCA.ucas[UCA_TYPE.CONTINUOUS].map(uca => stpaComponentToMarkdown(uca)).join("<br><br>");
        markdown += "|\n";
    }
    markdown += `\n`;
    return markdown;
}

function addSummary(data: StpaResult): string {
    let markdown = "## Summarized Safety Constraints\n\n";
    for (const component of data.systemLevelConstraints) {
        markdown += stpaComponentToMarkdown(component);
        markdown += `  \n`;
    }
    for (const component of data.controllerConstraints) {
        markdown += stpaComponentToMarkdown(component);
        markdown += `  \n`;
    }
    for (const component of data.safetyCons) {
        markdown += stpaComponentToMarkdown(component);
        markdown += `  \n`;
    }
    return markdown;
}

function addControlStructure(uri: string): string {
    let markdown = `## Control Structure\n\n`;
    vscode.commands.executeCommand('stpa.md.diagram.export', uri + "/images/control-structure.svg");
    markdown += `![Control Structure](./images/control-structure.svg)\n\n`;
    return markdown;
}