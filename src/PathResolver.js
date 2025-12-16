function unescapeString(str) {
	return str.replace(/\\(.)/g, (_, ch) => {
		switch (ch) {
			case '"':
				return '"';
			case "\\":
				return "\\";
			case "/":
				return "/";
			case "b":
				return "\b";
			case "f":
				return "\f";
			case "n":
				return "\n";
			case "r":
				return "\r";
			case "t":
				return "\t";
			default:
				return ch; // \uXXXX 可后续增强
		}
	});
}

function extractString(stringNode, sourceText) {
	// sourceText 是完整 JSON 文本
	// stringNode.start / end 覆盖包含引号
	const raw = sourceText.slice(stringNode.start + 1, stringNode.end - 1);
	return unescapeString(raw);
}

export function resolvePath(root, path, sourceText) {
	const parts = Array.isArray(path) ? path : parsePath(path);
	let node = root;

	for (const part of parts) {
		if (!node) return null;

		if (node.type === "Object") {
			node = resolveObjectProperty(node, part, sourceText);
		} else if (node.type === "Array") {
			node = resolveArrayElement(node, part);
		} else {
			return null;
		}
	}

	return node;
}

function resolveObjectProperty(objectNode, key, sourceText) {
	if (typeof key !== "string") return null;

	for (const prop of objectNode.properties) {
		const name = extractString(prop.key, sourceText);
		if (name === key) {
			return prop.value;
		}
	}
	return null;
}

function resolveArrayElement(arrayNode, index) {
	if (typeof index !== "number") return null;
	return arrayNode.elements[index] || null;
}

function parsePath(path) {
	if (path.startsWith("/")) {
		return parseJSONPointer(path);
	}
	return parseDotPath(path);
}

function parseDotPath(path) {
	const result = [];
	let i = 0;

	while (i < path.length) {
		const ch = path[i];

		// skip dot
		if (ch === ".") {
			i++;
			continue;
		}

		// array index: [123]
		if (ch === "[") {
			i++;
			let num = "";
			while (i < path.length && path[i] !== "]") {
				num += path[i++];
			}
			i++; // skip ]
			result.push(Number(num));
			continue;
		}

		// identifier
		let name = "";
		while (i < path.length && /[a-zA-Z0-9_$]/.test(path[i])) {
			name += path[i++];
		}
		result.push(name);
	}

	return result;
}

function parseJSONPointer(pointer) {
	if (pointer === "") return [];

	if (pointer[0] !== "/") {
		throw new Error("Invalid JSON Pointer");
	}

	return pointer
		.slice(1)
		.split("/")
		.map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"))
		.map((seg) => {
			return /^\d+$/.test(seg) ? Number(seg) : seg;
		});
}
