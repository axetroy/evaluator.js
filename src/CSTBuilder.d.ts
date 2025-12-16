import { Token } from "./Tokenizer";

interface NodePrimitives {
	type: "String" | "Number" | "Boolean" | "Null";
	start: number;
	end: number;
}

interface NodeObject {
	type: "Object";
	start: number;
	end: number;
	properties: Array<{
		key: NodePrimitives;
		value: Node;
	}>;
}

interface NodeArray {
	type: "Array";
	start: number;
	end: number;
	elements: Array<Node>;
}

type Node = NodePrimitives | NodeObject | NodeArray;

declare class CSTBuilder {
	constructor(tokens: Array<Token>);

	build(): Node;
}

export { CSTBuilder, Node, NodePrimitives, NodeObject, NodeArray };
