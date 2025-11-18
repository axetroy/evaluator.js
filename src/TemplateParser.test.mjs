import test from "node:test";
import assert from "node:assert/strict";
import { TemplateParser } from "./TemplateParser.js";

test("empty template -> []", () => {
	const parser = new TemplateParser();
	const tokens = parser.parse("");
	assert.deepEqual(tokens, []);
});

test("plain text only", () => {
	const parser = new TemplateParser();
	const tokens = parser.parse("hello");
	assert.equal(tokens.length, 1);
	assert.equal(tokens[0].type, "text");
	assert.equal(tokens[0].value, "hello");
	assert.equal(tokens[0].start, 0);
	assert.equal(tokens[0].end, 5);
});

test("text + expression + text", () => {
	const parser = new TemplateParser();
	const tokens = parser.parse("a{{b}}c");
	assert.equal(tokens.length, 3);

	assert.equal(tokens[0].type, "text");
	assert.equal(tokens[0].value, "a");
	assert.equal(tokens[0].start, 0);
	assert.equal(tokens[0].end, 1);

	assert.equal(tokens[1].type, "expression");
	assert.equal(tokens[1].value, "b");
	// positions include markers
	assert.equal(tokens[1].start, 1);
	assert.equal(tokens[1].end, 6);
	assert.equal(tokens[1].contentStart, 3);
	assert.equal(tokens[1].contentEnd, 4);

	assert.equal(tokens[2].type, "text");
	assert.equal(tokens[2].value, "c");
	assert.equal(tokens[2].start, 6);
	assert.equal(tokens[2].end, 7);
});

test("expression with spaces is trimmed", () => {
	const parser = new TemplateParser();
	const tokens = parser.parse("x{{   y + 1   }}z");
	assert.equal(tokens.length, 3);
	assert.equal(tokens[1].type, "expression");
	assert.equal(tokens[1].value, "y + 1");
});

test('position indices are correct for "a{{ b + c }}d"', () => {
	const parser = new TemplateParser();
	const template = "a{{ b + c }}d";
	const tokens = parser.parse(template);
	assert.equal(tokens.length, 3);

	assert.equal(tokens[0].type, "text");
	assert.equal(template.slice(tokens[0].start, tokens[0].end), "a");

	assert.equal(tokens[1].type, "expression");
	assert.equal(template.slice(tokens[1].start, tokens[1].end), "{{ b + c }}");
	assert.equal(template.slice(tokens[1].contentStart, tokens[1].contentEnd), " b + c ");

	assert.equal(tokens[2].type, "text");
	assert.equal(template.slice(tokens[2].start, tokens[2].end), "d");
});

test("unclosed expression is treated as text tail", () => {
	const parser = new TemplateParser();
	const tokens = parser.parse("a{{b c");
	assert.equal(tokens.length, 2);
	assert.equal(tokens[0].type, "text");
	assert.equal(tokens[0].value, "a");
	assert.equal(tokens[1].type, "text");
	assert.equal(tokens[1].value, "{{b c");
});

test("skip empty/whitespace-only expression", () => {
	const parser = new TemplateParser();
	const tokens = parser.parse("a{{   }}b");
	assert.equal(tokens.length, 2);
	assert.equal(tokens[0].type, "text");
	assert.equal(tokens[0].value, "a");
	assert.equal(tokens[1].type, "text");
	assert.equal(tokens[1].value, "b");
});

test("preserveWhitespace = false trims text tokens and drops empty ones", () => {
	const parser = new TemplateParser({ preserveWhitespace: false });
	const tokens = parser.parse("  a  {{  x + 1  }}  b  ");
	assert.equal(tokens.length, 3);
	assert.deepEqual(
		tokens.map((t) => t.type),
		["text", "expression", "text"]
	);
	assert.deepEqual(
		tokens.map((t) => t.value),
		["  a  ", "x + 1", "  b  "]
	);
});

test("custom delimiters", () => {
	const parser = new TemplateParser({ expressionStart: "<%", expressionEnd: "%>" });
	const tokens = parser.parse("hi<% a + b %>!");
	assert.equal(tokens.length, 3);
	assert.equal(tokens[1].type, "expression");
	assert.equal(tokens[1].value, "a + b");
	// indices: h(0)i(1)<(2)%(3) ...(content starts at 4) ...(%) at 11 >(12) !(13)
	assert.equal(tokens[1].start, 2);
	assert.equal(tokens[1].end, 13);
	assert.equal(tokens[1].contentStart, 4);
	assert.equal(tokens[1].contentEnd, 11);
});

test("static parse works like instance parse", () => {
	const tokens = TemplateParser.parse("x{{y}}z");
	assert.equal(tokens.length, 3);
	assert.deepEqual(
		tokens.map((t) => t.type),
		["text", "expression", "text"]
	);
	assert.deepEqual(
		tokens.map((t) => t.value),
		["x", "y", "z"]
	);
});

test("expression with nested }} works correctly", () => {
	const parser = new TemplateParser();
	const tokens = parser.parse('Value: {{ "This is a curly brace: }}" }} end.');
	assert.equal(tokens.length, 3);
	assert.equal(tokens[0].type, "text");
	assert.equal(tokens[0].value, "Value: ");
	assert.equal(tokens[1].type, "expression");
	assert.equal(tokens[1].value, '"This is a curly brace: }}"');
	assert.equal(tokens[2].type, "text");
	assert.equal(tokens[2].value, " end.");
});
