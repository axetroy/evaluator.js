import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { TemplateParser } from "./TemplateParser.js";

describe("TemplateParser", () => {
	describe("Basic Parsing", () => {
		test("should return empty array for empty template", () => {
			const parser = new TemplateParser();
			const tokens = parser.parse("");
			assert.deepEqual(tokens, []);
		});

		test("should parse plain text without expressions", () => {
			const parser = new TemplateParser();
			const tokens = parser.parse("hello");
			assert.equal(tokens.length, 1);
			assert.equal(tokens[0].type, "text");
			assert.equal(tokens[0].value, "hello");
			assert.equal(tokens[0].start, 0);
			assert.equal(tokens[0].end, 5);
		});

		test("should parse text with expression and text", () => {
			const parser = new TemplateParser();
			const tokens = parser.parse("a{{b}}c");
			assert.equal(tokens.length, 3);

			assert.equal(tokens[0].type, "text");
			assert.equal(tokens[0].value, "a");
			assert.equal(tokens[0].start, 0);
			assert.equal(tokens[0].end, 1);

			assert.equal(tokens[1].type, "expression");
			assert.equal(tokens[1].value, "b");
			assert.equal(tokens[1].start, 1);
			assert.equal(tokens[1].end, 6);
			assert.equal(tokens[1].contentStart, 3);
			assert.equal(tokens[1].contentEnd, 4);

			assert.equal(tokens[2].type, "text");
			assert.equal(tokens[2].value, "c");
			assert.equal(tokens[2].start, 6);
			assert.equal(tokens[2].end, 7);
		});

		test("should trim whitespace from expressions", () => {
			const parser = new TemplateParser();
			const tokens = parser.parse("x{{   y + 1   }}z");
			assert.equal(tokens.length, 3);
			assert.equal(tokens[1].type, "expression");
			assert.equal(tokens[1].value, "y + 1");
		});
	});

	describe("Position Indices", () => {
		test("should calculate correct position indices", () => {
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
	});

	describe("Edge Cases", () => {
		test("should treat unclosed expression as text", () => {
			const parser = new TemplateParser();
			const tokens = parser.parse("a{{b c");
			assert.equal(tokens.length, 2);
			assert.equal(tokens[0].type, "text");
			assert.equal(tokens[0].value, "a");
			assert.equal(tokens[1].type, "text");
			assert.equal(tokens[1].value, "{{b c");
		});

		test("should skip empty or whitespace-only expressions", () => {
			const parser = new TemplateParser();
			const tokens = parser.parse("a{{   }}b");
			assert.equal(tokens.length, 2);
			assert.equal(tokens[0].type, "text");
			assert.equal(tokens[0].value, "a");
			assert.equal(tokens[1].type, "text");
			assert.equal(tokens[1].value, "b");
		});

		test("should handle expressions with nested closing delimiters", () => {
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
	});

	describe("Configuration Options", () => {
		test("should handle preserveWhitespace option", () => {
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

		test("should support custom delimiters", () => {
			const parser = new TemplateParser({ expressionStart: "<%", expressionEnd: "%>" });
			const tokens = parser.parse("hi<% a + b %>!");
			assert.equal(tokens.length, 3);
			assert.equal(tokens[1].type, "expression");
			assert.equal(tokens[1].value, "a + b");
			assert.equal(tokens[1].start, 2);
			assert.equal(tokens[1].end, 13);
			assert.equal(tokens[1].contentStart, 4);
			assert.equal(tokens[1].contentEnd, 11);
		});
	});

	describe("Static Method", () => {
		test("should parse using static method", () => {
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
	});
});
