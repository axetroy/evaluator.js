import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { evalTemplate, evalExpression } from "./index.js";

describe("evalTemplate", () => {
	describe("Basic Features", () => {
		test("should replace simple variables", () => {
			const TEMPLATE = "Hello, {{ name }}!";
			const variables = { name: "World" };
			const output = evalTemplate(TEMPLATE, variables);
			assert.equal(output, "Hello, World!");
		});

		test("should evaluate basic expressions", () => {
			const TEMPLATE = "2 + 2 = {{ 2 + 2 }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "2 + 2 = 4");
		});

		test("should evaluate nested expressions", () => {
			const TEMPLATE = "The result of (2 + 3) * 4 is {{ (2 + 3) * 4 }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "The result of (2 + 3) * 4 is 20");
		});

		test("should handle mixed variables and expressions", () => {
			const TEMPLATE = "Hello, {{ name }}! Today is {{ new Date().toLocaleDateString() }}.";
			const variables = { name: "World" };
			const output = evalTemplate(TEMPLATE, variables);
			const expectedOutput = `Hello, World! Today is ${new Date().toLocaleDateString()}.`;
			assert.equal(output, expectedOutput);
		});

		test("should handle undefined variables", () => {
			const TEMPLATE = "Hello, {{ name }}!";
			const variables = {};
			const output = evalTemplate(TEMPLATE, variables);
			assert.equal(output, "Hello, undefined!");
		});

		test("should handle multiple expressions", () => {
			const TEMPLATE = "{{ a }} + {{ b }} = {{ a + b }}";
			const output = evalTemplate(TEMPLATE, { a: 10, b: 20 });
			assert.equal(output, "10 + 20 = 30");
		});

		test("should return template as-is when no expressions", () => {
			const TEMPLATE = "Hello World";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "Hello World");
		});

		test("should handle non-existent function calls", () => {
			const TEMPLATE = "This will cause an error: {{ nonExistentFunction() }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "This will cause an error: undefined");
		});
	});

	describe("Template Literals Support", () => {
		test("should handle basic template literals", () => {
			const TEMPLATE = "{{ `hello ${ name }, I am robot!` }}";
			const output = evalTemplate(TEMPLATE, { name: "world" });
			assert.equal(output, "hello world, I am robot!");
		});

		test("should handle template literals with prefix", () => {
			const TEMPLATE = "{{ `${action}, How are you?` }}";
			const output = evalTemplate(TEMPLATE, { action: "Hi" });
			assert.equal(output, "Hi, How are you?");
		});

		test("should handle nested template literals with encoding", () => {
			const TEMPLATE2 =
				"https://example.com?redirect={{ encodeURIComponent(`https://example.com?folderName=${ encodeURIComponent(folderName) }`) }}";
			const output2 = evalTemplate(TEMPLATE2, { folderName: "目录名" });
			assert.equal(
				output2,
				"https://example.com?redirect=https%3A%2F%2Fexample.com%3FfolderName%3D%25E7%259B%25AE%25E5%25BD%2595%25E5%2590%258D"
			);

			const outputURL = new URL(output2);

			assert.equal(outputURL.searchParams.get("redirect"), "https://example.com?folderName=%E7%9B%AE%E5%BD%95%E5%90%8D");
			assert.equal(decodeURIComponent(outputURL.searchParams.get("redirect")), "https://example.com?folderName=目录名");
		});
	});

	describe("Data Types", () => {
		test("should handle different primitive types", () => {
			const TEMPLATE = "String: {{ str }}, Number: {{ num }}, Boolean: {{ bool }}, Null: {{ nullVal }}, Array: {{ arr }}";
			const output = evalTemplate(TEMPLATE, {
				str: "hello",
				num: 42,
				bool: true,
				nullVal: null,
				arr: [1, 2, 3],
			});
			assert.equal(output, "String: hello, Number: 42, Boolean: true, Null: null, Array: 1,2,3");
		});

		test("should handle object expressions", () => {
			const TEMPLATE = "{{ ({ a: 1, b: 2 }) }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "[object Object]");
		});
	});

	describe("Array Operations", () => {
		test("should handle array methods", () => {
			const TEMPLATE = "{{ [1, 2, 3].map(x => x * 2).join(', ') }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "2, 4, 6");
		});

		test("should handle array reduce", () => {
			const TEMPLATE = "The sum of 1, 2, and 3 is {{ [1, 2, 3].reduce((a, b) => a + b, 0) }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "The sum of 1, 2, and 3 is 6");
		});
	});

	describe("Conditional and Logical Operations", () => {
		test("should handle ternary expressions", () => {
			const TEMPLATE = "{{ score >= 60 ? 'Pass' : 'Fail' }}";
			const output1 = evalTemplate(TEMPLATE, { score: 75 });
			const output2 = evalTemplate(TEMPLATE, { score: 45 });
			assert.equal(output1, "Pass");
			assert.equal(output2, "Fail");
		});

		test("should handle logical operations", () => {
			const TEMPLATE = "{{ a && b || c }}";
			const output = evalTemplate(TEMPLATE, { a: true, b: false, c: true });
			assert.equal(output, "true");
		});

		test("should handle optional chaining", () => {
			const TEMPLATE = "{{ obj?.prop?.value ?? 'default' }}";
			const output1 = evalTemplate(TEMPLATE, { obj: { prop: { value: 42 } } });
			const output2 = evalTemplate(TEMPLATE, { obj: null });
			assert.equal(output1, "42");
			assert.equal(output2, "default");
		});
	});

	describe("Built-in Functions", () => {
		test("should handle Math functions", () => {
			const TEMPLATE = "Max: {{ Math.max(10, 20, 30) }}, Min: {{ Math.min(10, 20, 30) }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "Max: 30, Min: 10");
		});

		test("should handle String methods", () => {
			const TEMPLATE = "{{ text.toUpperCase() }}";
			const output = evalTemplate(TEMPLATE, { text: "hello world" });
			assert.equal(output, "HELLO WORLD");
		});

		test("should handle JSON operations", () => {
			const TEMPLATE = "{{ JSON.stringify({ x: 10, y: 20 }) }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, '{"x":10,"y":20}');
		});

		test("should handle Date operations", () => {
			const TEMPLATE = "{{ new Date(0).getTime() }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "0");
		});
	});

	describe("Advanced Syntax", () => {
		test("should handle nested parentheses", () => {
			const TEMPLATE = "{{ ((a + b) * (c - d)) }}";
			const output = evalTemplate(TEMPLATE, { a: 1, b: 2, c: 10, d: 5 });
			assert.equal(output, "15");
		});

		test("should handle arrow functions", () => {
			const TEMPLATE = "{{ ((x) => x * 2)(5) }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "10");
		});

		test("should handle curly braces in string literals", () => {
			const TEMPLATE = "{{ 'This is a curly brace: }}' }}";
			const output = evalTemplate(TEMPLATE);
			assert.equal(output, "This is a curly brace: }}");
		});
	});

	describe("Multi-line and Special Characters", () => {
		test("should handle multi-line templates", () => {
			const TEMPLATE = "Line 1: {{ a }}\nLine 2: {{ b }}\nLine 3: {{ a + b }}";
			const output = evalTemplate(TEMPLATE, { a: 5, b: 10 });
			assert.equal(output, "Line 1: 5\nLine 2: 10\nLine 3: 15");
		});

		test("should handle special characters", () => {
			const TEMPLATE = "Symbol: {{ symbol }}";
			const output = evalTemplate(TEMPLATE, { symbol: "$" });
			assert.equal(output, "Symbol: $");
		});
	});

	describe("Error Handling", () => {
		test("should throw error on syntax errors", () => {
			const TEMPLATE = "{{ 1 + }}";
			assert.throws(() => evalTemplate(TEMPLATE), /Unexpected token/);
		});

		test("should throw error when accessing null properties", () => {
			const TEMPLATE = "{{ obj.prop }}";
			assert.throws(() => evalTemplate(TEMPLATE, { obj: null }), /Cannot read property/);
		});
	});
});

describe("evalExpression", () => {
	describe("Basic Operations", () => {
		test("should evaluate arithmetic expressions", () => {
			const expression = "a + b * c";
			const context = { a: 2, b: 3, c: 4 };
			const result = evalExpression(expression, context);
			assert.equal(result, 14);
		});

		test("should call built-in functions", () => {
			const expression = "Math.max(x, y)";
			const context = { x: 10, y: 20 };
			const result = evalExpression(expression, context);
			assert.equal(result, 20);
		});

		test("should handle string concatenation", () => {
			const expression = "greeting + ', ' + name + '!'";
			const context = { greeting: "Hello", name: "Alice" };
			const result = evalExpression(expression, context);
			assert.equal(result, "Hello, Alice!");
		});

		test("should evaluate logical expressions", () => {
			const expression = "isActive && (score > 50)";
			const context = { isActive: true, score: 75 };
			const result = evalExpression(expression, context);
			assert.equal(result, true);
		});

		test("should handle array methods", () => {
			const expression = "numbers.map(n => n * 2).join(', ')";
			const context = { numbers: [1, 2, 3] };
			const result = evalExpression(expression, context);
			assert.equal(result, "2, 4, 6");
		});
	});

	describe("Error Handling", () => {
		test("should throw error on undefined variables", () => {
			const expression = "a + b";
			const context = { a: 5 };
			assert.throws(() => evalExpression(expression, context), /b is not defined/);
		});

		test("should throw error on syntax errors", () => {
			const expression = "5 + * 2";
			assert.throws(() => evalExpression(expression), /Unexpected token/);
		});
	});
});
