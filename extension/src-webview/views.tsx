/*
 * KIELER - Kiel Integrated Environment for Layout Eclipse RichClient
 *
 * http://rtsys.informatik.uni-kiel.de/kieler
 *
 * Copyright 2021 by
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

/** @jsx svg */
import { VNode } from 'snabbdom';
import { Point, PolylineEdgeView, RectangularNodeView, RenderingContext, SEdge, SNode, svg, SPort, toDegrees, SGraphView, SGraph } from 'sprotty';
import { injectable } from 'inversify';
import { STPANode, PARENT_TYPE, STPA_NODE_TYPE, CS_EDGE_TYPE, STPAAspect, STPAEdge, STPA_EDGE_TYPE, CS_NODE_TYPE } from './stpa-model';
import { renderCircle, renderDiamond, renderHexagon, renderMirroredTriangle, renderPentagon, renderRectangle, renderRoundedRectangle, renderTrapez, renderTriangle } from './views-rendering';
import { inject } from 'inversify';
import { collectAllChildren } from './helper-methods';
import { DISymbol } from './di.symbols';
import { ColorStyleOption, DifferentFormsOption, RenderOptionsRegistry, ShowCSOption, ShowRelationshipGraphOption } from './options/render-options-registry';

let selectedNode: SNode | undefined;

@injectable()
export class PolylineArrowEdgeView extends PolylineEdgeView {

    @inject(DISymbol.RenderOptionsRegistry) renderOptionsRegistry: RenderOptionsRegistry;

    protected renderLine(edge: SEdge, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0];
        let path = `M ${firstPoint.x},${firstPoint.y}`;
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i];
            path += ` L ${p.x},${p.y}`;
        }

        // if an STPANode is selected, the components not connected to it should fade out
        const hidden = edge.type == STPA_EDGE_TYPE && selectedNode && !(edge as STPAEdge).highlight;

        const colorStyle = this.renderOptionsRegistry.getValue(ColorStyleOption);
        const printEdge = colorStyle == "black & white";
        const coloredEdge = colorStyle == "colorful";
        const lessColoredEdge = colorStyle == "fewer colors";
        const aspect = (edge.source as STPANode).aspect % 2 == 0 || !lessColoredEdge ? (edge.source as STPANode).aspect : (edge.source as STPANode).aspect - 1;
        return <path class-print-edge={printEdge} class-stpa-edge={coloredEdge || lessColoredEdge} class-hidden={hidden} aspect={aspect} d={path} />;
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        // if an STPANode is selected, the components not connected to it should fade out
        const hidden = edge.type == STPA_EDGE_TYPE && selectedNode && !(edge as STPAEdge).highlight;

        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];

        const colorStyle = this.renderOptionsRegistry.getValue(ColorStyleOption);
        const printEdge = colorStyle == "black & white";
        const coloredEdge = colorStyle == "colorful" && edge.type != CS_EDGE_TYPE;
        const sprottyEdge = colorStyle == "standard" || (edge.type == CS_EDGE_TYPE && !printEdge);
        const lessColoredEdge = colorStyle == "fewer colors";
        const aspect = (edge.source as STPANode).aspect % 2 == 0 || !lessColoredEdge ? (edge.source as STPANode).aspect : (edge.source as STPANode).aspect - 1;
        return [
            <path class-print-edge-arrow={printEdge} class-stpa-edge-arrow={coloredEdge || lessColoredEdge} class-hidden={hidden} aspect={aspect}
                class-sprotty-edge-arrow={sprottyEdge} d="M 6,-3 L 0,0 L 6,3 Z"
                transform={`rotate(${this.angle(p2, p1)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`} />
        ];
    }

    angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}

@injectable()
export class STPANodeView extends RectangularNodeView {

    @inject(DISymbol.RenderOptionsRegistry) renderOptionsRegistry: RenderOptionsRegistry;

    render(node: STPANode, context: RenderingContext): VNode {

        // determines the color of the node
        const colorStyle = this.renderOptionsRegistry.getValue(ColorStyleOption);
        const printNode = colorStyle == "black & white";
        const coloredNode = colorStyle == "colorful";
        const sprottyNode = colorStyle == "standard";
        const lessColoredNode = colorStyle == "fewer colors";
        const aspect = node.aspect % 2 == 0 || !lessColoredNode ? node.aspect : node.aspect - 1;

        // create the element based on the option and the aspect of the node
        let element: VNode;
        if (this.renderOptionsRegistry.getValue(DifferentFormsOption)) {
            switch (node.aspect) {
                case STPAAspect.LOSS:
                    element = renderTrapez(node);
                    break;
                case STPAAspect.HAZARD:
                    element = renderRectangle(node);
                    break;
                case STPAAspect.SYSTEMCONSTRAINT:
                    element = renderHexagon(node);
                    break;
                case STPAAspect.RESPONSIBILITY:
                    element = renderPentagon(node);
                    break;
                case STPAAspect.UCA:
                    element = renderCircle(node);
                    break;
                case STPAAspect.CONTROLLERCONSTRAINT:
                    element = renderMirroredTriangle(node);
                    break;
                case STPAAspect.SCENARIO:
                    element = renderTriangle(node);
                    break;
                case STPAAspect.SAFETYREQUIREMENT:
                    element = renderDiamond(node);
                    break;
                default:
                    element = renderRectangle(node);
                    break;
            }
        } else if (lessColoredNode) {
            // aspects with same color should have different forms
            switch (node.aspect) {
                case STPAAspect.LOSS:
                case STPAAspect.SYSTEMCONSTRAINT:
                case STPAAspect.UCA:
                case STPAAspect.SCENARIO:
                    element = renderRectangle(node);
                    break;
                case STPAAspect.HAZARD:
                case STPAAspect.RESPONSIBILITY:
                case STPAAspect.CONTROLLERCONSTRAINT:
                case STPAAspect.SAFETYREQUIREMENT:
                    element = renderRoundedRectangle(node);
                    break;
                default:
                    element = renderRectangle(node);
                    break;
            }
        } else {
            element = renderRectangle(node);
        }

        // if an STPANode is selected, the components not connected to it should fade out
        const hidden = (selectedNode instanceof STPANode) && !node.highlight;

        return <g
            class-print-node={printNode}
            class-stpa-node={coloredNode || lessColoredNode} aspect={aspect}
            class-sprotty-node={sprottyNode}
            class-sprotty-port={node instanceof SPort}
            class-mouseover={node.hoverFeedback} class-selected={node.selected}
            class-hidden={hidden}>
            <g>{element}</g>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class CSNodeView extends RectangularNodeView {

    @inject(DISymbol.RenderOptionsRegistry) renderOptionsRegistry: RenderOptionsRegistry;

    render(node: SNode, context: RenderingContext): VNode {
        // hides the control structure and/or relationship graph if the corresponding option is set to false
        if (!this.renderOptionsRegistry.getValue(ShowCSOption) && (node.type == CS_NODE_TYPE || node.type == PARENT_TYPE && node.children.filter(child => child instanceof SNode)[0].type == CS_NODE_TYPE)
            || !this.renderOptionsRegistry.getValue(ShowRelationshipGraphOption) && (node.type == STPA_NODE_TYPE || node.type == PARENT_TYPE && node.children.filter(child => child instanceof SNode)[0].type == STPA_NODE_TYPE)) {
            return <g></g>;
        }

        const colorStyle = this.renderOptionsRegistry.getValue(ColorStyleOption);
        const sprottyNode = colorStyle == "standard";
        const printNode = !sprottyNode;
        return <g>
            <rect class-print-node={printNode}
                class-sprotty-node={sprottyNode} class-sprotty-port={node instanceof SPort}
                class-mouseover={node.hoverFeedback} class-selected={node.selected}
                x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}
            > </rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class STPAGraphView<IRenderingArgs> extends SGraphView<IRenderingArgs> {

    render(model: Readonly<SGraph>, context: RenderingContext, args?: IRenderingArgs): VNode {
        let allNodes: SNode[] = [];
        collectAllChildren(model.children as SNode[], allNodes);
        selectedNode = allNodes.find(node => node.selected);

        return super.render(model, context, args);
    }

}