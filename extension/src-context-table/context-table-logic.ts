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

import { BigCell, ContexTableRule, Type, ContexTableVariable, ContexTableVariableValues } from "./utils";

/**
 * Sets the column attribute of {@code rules}.
 * @param variables The variable values of the current row.
 * @param rules The available rules.
 * @param selectedController The currently selected controller.
 * @param selectedAction The currently selected control action.
 * @param selectedType The currently selected control action type.
 */
export function determineColumnsForRules(variables: ContexTableVariable[], rules: ContexTableRule[], selectedController: string,
    selectedAction: string, selectedType: number): void {
    // update the columns of all rules
    rules.forEach(rule => {
        // compare control action of the rule with the selected one and  
        // the context of the rule with the current context
        if (rule.controlAction.controller === selectedController && rule.controlAction.action === selectedAction
            && checkValues(rule.variables, variables)) {
            // determine the column for which the rule applies
            const ruleType = rule.type.toLowerCase();
            let column = -1;
            if (selectedType === Type.NOT_PROVIDED && ruleType == "not-provided") {
                column = 1;
            } else if (ruleType == "provided") {
                column = 1;
            } else if (ruleType == "too-early" || ruleType == "too-late" || ruleType == "wrong-time") {
                column = 2;
            } else if (ruleType == "stopped-too-soon" || ruleType == "applied-too-long") {
                column = 3;
            } else if (ruleType == "not-provided") {
                column = 4;
            } else {
                console.log("The given control action type is not supported: " + ruleType);
            }
            rule.column = column;
        } else {
            rule.column = undefined;
        }
    });
}

/**
 * Creates the result cells.
 * @param rules The available rules. The column attribute must be set!
 * @param hazardColumnsCount The number of columns the "Hazardous?"-column currently has.
 * @returns The cells for the "Hazardous?"-column.
 */
export function createResults(rules: ContexTableRule[], hazardColumnsCount: number): BigCell[] {
    const cells: BigCell[] = [];
    // keeps track on how many neihbouring columns have no rule applied
    let noAppliedRuleCounter: number = 0;
    // go through all of the hazardous columns
    for (let hazardColumn = 1; hazardColumn <= hazardColumnsCount; hazardColumn++) {
        // TODO: can there be multiple rules with the same column?
        const currentRule = rules.find(rule => rule.column === hazardColumn);
        if (!currentRule) {
            // there is no rule for this column
            noAppliedRuleCounter++;
            if (hazardColumn == hazardColumnsCount) {
                // its the last column so we can fill the missing columns with a cell containing the value "No"
                cells.push({ cssClass: "result", value: "No", colSpan: noAppliedRuleCounter });
            }
        } else {
            // it may be that previous columns had no rule
            // in this case a cell with value "No" must be created that covers these columns
            if (noAppliedRuleCounter != 0) {
                cells.push({ cssClass: "result", value: "No", colSpan: noAppliedRuleCounter });
                noAppliedRuleCounter = 0;
            }
            // add the hazards, defined by the rule, as a cell
            cells.push({ cssClass: "result", value: currentRule.id, colSpan: 1, title: currentRule.hazards.toString() });
        }
    }
    return cells;
}

/**
 * Checks whether the values of {@code variables1} and {@code variables2} are the same
 * @param variables1 Variables that should be compared to the other set.
 * @param variables2 Variables that should be compared to the other set.
 * @returns true if all values are equal; false otherwise.
 */
function checkValues(variables1: ContexTableVariable[], variables2: ContexTableVariable[]): boolean {
    for (let i = 0; i < variables1.length; i++) {
        const firstVariable = variables1[i];
        // get corresponding variable
        const correspondingVariable = variables2.find(secondVariable => secondVariable.name === firstVariable.name);
        // check values
        if (firstVariable.value != correspondingVariable?.value) {
            return false;
        }
    }
    return true;
}