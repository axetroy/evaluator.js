import { Node } from "acorn";

export declare class Evaluator {
	constructor(variables: unknown);

	static evaluate<T = unknown>(expression: string, variables: unknown): T;

	evaluate<T = unknown>(expression: string): T;
}

export declare function getNodeString(node: Node): string;
