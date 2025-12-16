import { Node } from "./CSTBuilder";

type Path = string | Array<string>;

declare function resolvePath(root: Node, path: Path): Node | null;

export { resolvePath };
