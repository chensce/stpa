import { SNode, SEdge } from "sprotty-protocol";
import { EdgeDirection, STPAAspect } from "./stpa-model";

/**
 * Node representing a STPA component.
 */
export interface STPANode extends SNode {
    aspect: STPAAspect
    description: string
    hierarchyLvl: number
    connected?: boolean
}

/**
 * Edge representing an edge in the relationship graph.
 */
 export interface STPAEdge extends SEdge {
    connected?: boolean
}

/**
 * Node representing a system component in the control structure.
 */
export interface CSNode extends SNode {
    level?: number
    // processmodel?
}

/**
 * Edge representing control actions and feedback in the control structure.
 */
export interface CSEdge extends SEdge {
    direction: EdgeDirection
}