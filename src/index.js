import { Tokenizer } from "./Tokenizer.js";
import { CSTBuilder } from "./CSTBuilder.js";
import { resolvePath } from "./PathResolver.js";

function replace(sourceText, patches) {
	const tokenizer = new Tokenizer(sourceText);
	const tokens = tokenizer.tokenize();

	const builder = new CSTBuilder(tokens);
	const root = builder.build();

	// 倒叙替换
	const reverseNodes = patches
		.map((patch) => {
			const node = resolvePath(root, patch.path, sourceText);

			return {
				node,
				patch,
			};
		})
		.filter((v) => v.node)
		.sort((a, b) => b.node.start - a.node.start);

	// 确保不会冲突
	reverseNodes.reduce((lastEnd, { node }) => {
		if (node.end > lastEnd) {
			throw new Error(`Patch conflict at path: ${node.path}`);
		}

		return node.start;
	}, Infinity);

	let result = sourceText;

	for (const { node, patch } of reverseNodes) {
		result = result.slice(0, node.start) + patch.value + result.slice(node.end);
	}

	return result;
}

const jsoncst = {
	replace: replace,
};

export { replace };
export default jsoncst;
