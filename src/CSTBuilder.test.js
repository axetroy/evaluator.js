import test from "node:test";
import assert from "node:assert/strict";
import { Tokenizer } from "./Tokenizer.js";
import { CSTBuilder } from "./CSTBuilder.js"; // 你的 CSTBuilder 文件

function buildCST(source) {
	const tokens = new Tokenizer(source).tokenize();
	const builder = new CSTBuilder(tokens);
	return builder.build();
}

test("minimal object {}", () => {
	const source = "{}";
	const cst = buildCST(source);

	assert.equal(cst.type, "Object");
	assert.equal(cst.start, 0);
	assert.equal(cst.end, 2);
	assert.deepEqual(cst.properties, []);
});

test("empty array []", () => {
	const source = "[]";
	const cst = buildCST(source);

	assert.equal(cst.type, "Array");
	assert.equal(cst.start, 0);
	assert.equal(cst.end, 2);
	assert.deepEqual(cst.elements, []);
});

test("object with primitives", () => {
	const source = '{"a":1,"b":true,"c":null}';
	const cst = buildCST(source);

	assert.equal(cst.type, "Object");
	assert.equal(cst.properties.length, 3);

	assert.equal(cst.properties[0].key.start, 1);
	assert.equal(cst.properties[0].value.type, "Number");
	assert.equal(source.slice(cst.properties[0].value.start, cst.properties[0].value.end), "1");

	assert.equal(cst.properties[1].value.type, "Boolean");
	assert.equal(source.slice(cst.properties[1].value.start, cst.properties[1].value.end), "true");

	assert.equal(cst.properties[2].value.type, "Null");
	assert.equal(source.slice(cst.properties[2].value.start, cst.properties[2].value.end), "null");
});

test("array with primitives", () => {
	const source = "[1,true,null]";
	const cst = buildCST(source);

	assert.equal(cst.type, "Array");
	assert.equal(cst.elements.length, 3);

	assert.equal(cst.elements[0].type, "Number");
	assert.equal(source.slice(cst.elements[0].start, cst.elements[0].end), "1");

	assert.equal(cst.elements[1].type, "Boolean");
	assert.equal(source.slice(cst.elements[1].start, cst.elements[1].end), "true");

	assert.equal(cst.elements[2].type, "Null");
	assert.equal(source.slice(cst.elements[2].start, cst.elements[2].end), "null");
});

test("nested object and array", () => {
	const source = '{"a":[1,2],"b":{"c":3}}';
	const cst = buildCST(source);

	assert.equal(cst.type, "Object");
	assert.equal(cst.properties.length, 2);

	const aNode = cst.properties[0].value;
	assert.equal(aNode.type, "Array");
	assert.equal(aNode.elements.length, 2);
	assert.equal(source.slice(aNode.elements[0].start, aNode.elements[0].end), "1");

	const bNode = cst.properties[1].value;
	assert.equal(bNode.type, "Object");
	assert.equal(bNode.properties.length, 1);
	assert.equal(source.slice(bNode.properties[0].value.start, bNode.properties[0].value.end), "3");
});

test("object with whitespace and comments", () => {
	const source = `{
    // comment
    "a": 1,
    /* block comment */
    "b": [true, false]
  }`;

	const cst = buildCST(source);

	assert.equal(cst.type, "Object");
	assert.equal(cst.properties.length, 2);

	// key "a"
	assert.equal(source.slice(cst.properties[0].key.start, cst.properties[0].key.end), '"a"');
	assert.equal(cst.properties[0].value.type, "Number");

	// key "b"
	assert.equal(source.slice(cst.properties[1].key.start, cst.properties[1].key.end), '"b"');
	const bNode = cst.properties[1].value;
	assert.equal(bNode.type, "Array");
	assert.equal(bNode.elements[0].type, "Boolean");
});

test("string with escaped characters", () => {
	const source = '{"a":"\\n\\t\\""}';
	const cst = buildCST(source);

	const strNode = cst.properties[0].value;
	assert.equal(strNode.type, "String");
	assert.equal(source.slice(strNode.start, strNode.end), '"\\n\\t\\""');
});

test("all nodes within source range", () => {
	const source = '{"a":1,"b":[true,false]}';
	const cst = buildCST(source);

	function checkNode(node) {
		assert(node.start >= 0 && node.end <= source.length);

		if (node.type === "Object") {
			for (const prop of node.properties) {
				checkNode(prop.key);
				checkNode(prop.value);
			}
		} else if (node.type === "Array") {
			for (const el of node.elements) checkNode(el);
		}
	}

	checkNode(cst);
});
