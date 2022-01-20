import { SNode, SEdge } from "sprotty-protocol";
import { EdgeDirection, STPAAspect } from "./STPA-model";

export interface STPANode extends SNode {

    aspect: STPAAspect
    description: string
    subcomp: boolean
}

export interface CSNode extends SNode {
    level?: number
    // processmodel?
}

export interface CSEdge extends SEdge {
    direction: EdgeDirection
}