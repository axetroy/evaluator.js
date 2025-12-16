import test from "node:test";
import assert from "node:assert/strict";
import { Tokenizer } from "./Tokenizer.js";

function tokensToText(tokens, source) {
	return tokens.map((t) => source.slice(t.start, t.end)).join("");
}

test("tokenize minimal object", () => {
	const source = "{}";
	const tokens = new Tokenizer(source).tokenize();

	assert.equal(tokens.length, 2);
	assert.equal(tokens[0].type, "braceL");
	assert.equal(tokens[1].type, "braceR");

	assert.equal(tokensToText(tokens, source), source);
});

test("preserve whitespace", () => {
	const source = "{ \n  }";
	const tokens = new Tokenizer(source).tokenize();

	const types = tokens.map((t) => t.type);
	assert.deepEqual(types, ["braceL", "whitespace", "braceR"]);

	assert.equal(tokensToText(tokens, source), source);
});

test("string with escape sequences", () => {
	const source = '"a\\n\\"b"';
	const tokens = new Tokenizer(source).tokenize();

	assert.equal(tokens.length, 1);
	assert.equal(tokens[0].type, "string");

	assert.equal(source.slice(tokens[0].start, tokens[0].end), source);
});

test("number formats", () => {
	const cases = ["0", "-1", "3.14", "1e10", "-2.5E-3"];

	for (const src of cases) {
		const tokens = new Tokenizer(src).tokenize();
		assert.equal(tokens.length, 1);
		assert.equal(tokens[0].type, "number");
		assert.equal(tokensToText(tokens, src), src);
	}
});

test("boolean and null", () => {
	const source = "true false null";
	const tokens = new Tokenizer(source).tokenize();

	const types = tokens.map((t) => t.type);
	assert.deepEqual(types, ["boolean", "whitespace", "boolean", "whitespace", "null"]);

	assert.equal(tokensToText(tokens, source), source);
});

test("object and array tokens", () => {
	const source = '{"a":[1,2]}';
	const tokens = new Tokenizer(source).tokenize();

	const types = tokens.map((t) => t.type);
	assert.deepEqual(types, ["braceL", "string", "colon", "bracketL", "number", "comma", "number", "bracketR", "braceR"]);

	assert.equal(tokensToText(tokens, source), source);
});

test("line comment", () => {
	const source = '{//c\n"a":1}';
	const tokens = new Tokenizer(source).tokenize();

	const types = tokens.map((t) => t.type);
	assert.ok(types.includes("comment"));

	assert.equal(tokensToText(tokens, source), source);
});

test("block comment", () => {
	const source = '{/* comment */"a":1}';
	const tokens = new Tokenizer(source).tokenize();

	assert.ok(tokens.some((t) => t.type === "comment"));
	assert.equal(tokensToText(tokens, source), source);
});

test("tokens fully cover source text", () => {
	const source = `{
    "a": 1,
    // comment
    "b": [ true, false ]
  }`;

	const tokens = new Tokenizer(source).tokenize();

	// 1. token 严格连续
	for (let i = 1; i < tokens.length; i++) {
		assert.equal(tokens[i - 1].end, tokens[i].start);
	}

	// 2. 覆盖完整文本
	assert.equal(tokens[0].start, 0);
	assert.equal(tokens[tokens.length - 1].end, source.length);

	// 3. 拼回原文
	assert.equal(tokensToText(tokens, source), source);
});

test("unexpected character throws", () => {
	assert.throws(() => {
		new Tokenizer("@").tokenize();
	});
});
