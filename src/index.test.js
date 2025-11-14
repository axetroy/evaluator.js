import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { evaluatorTemplate } from "./index.js";

// 示例用法
test("evaluatorTemplate - 基本变量替换", () => {
	const TEMPLATE = "Hello, ${{ name }}!";
	const variables = { name: "World" };
	const output = evaluatorTemplate(TEMPLATE, variables);
	assert.equal(output, "Hello, World!");
});

test("evaluatorTemplate - 表达式求值", () => {
	const TEMPLATE = "2 + 2 = ${{ 2 + 2 }}";
	const output = evaluatorTemplate(TEMPLATE);
	assert.equal(output, "2 + 2 = 4");
});

test("evaluatorTemplate - 嵌套表达式", () => {
	const TEMPLATE = "The result of (2 + 3) * 4 is ${{ (2 + 3) * 4 }}";
	const output = evaluatorTemplate(TEMPLATE);
	assert.equal(output, "The result of (2 + 3) * 4 is 20");
});

test("evaluatorTemplate - 变量和表达式混合", () => {
	const TEMPLATE = "Hello, ${{ name }}! Today is ${{ new Date().toLocaleDateString() }}.";
	const variables = { name: "World" };
	const output = evaluatorTemplate(TEMPLATE, variables);
	const expectedOutput = `Hello, World! Today is ${new Date().toLocaleDateString()}.`;
	assert.equal(output, expectedOutput);
});

test("evaluatorTemplate - 未定义变量", () => {
	const TEMPLATE = "Hello, ${{ name }}!";
	const variables = {};
	const output = evaluatorTemplate(TEMPLATE, variables);
	assert.equal(output, "Hello, !");
});

test("evaluatorTemplate - 复杂表达式", () => {
	const TEMPLATE = "The sum of 1, 2, and 3 is ${{ [1, 2, 3].reduce((a, b) => a + b, 0) }}";
	const output = evaluatorTemplate(TEMPLATE);
	assert.equal(output, "The sum of 1, 2, and 3 is 6");
});

test("evaluatorTemplate - 带有错误的表达式", () => {
	const TEMPLATE = "This will cause an error: ${{ nonExistentFunction() }}";
	const output = evaluatorTemplate(TEMPLATE);
	assert.equal(output, "This will cause an error: ");
});

describe("evaluatorTemplate - 模版字面量", () => {
	test("basic", () => {
		const TEMPLATE = "${{ `hello ${ name }, I am robot!` }}";
		const output = evaluatorTemplate(TEMPLATE, { name: "world" });
		assert.equal(output, "hello world, I am robot!");
	});

	test("prefix", () => {
		const TEMPLATE = "${{ `${action}, How are you?` }}";
		const output = evaluatorTemplate(TEMPLATE, { action: "Hi" });
		assert.equal(output, "Hi, How are you?");
	});

	test("nest", () => {
		const TEMPLATE2 =
			"https://example.com?redirect=${{ encodeURIComponent(`https://example.com?folderName=${ encodeURIComponent(folderName) }`) }}";
		const output2 = evaluatorTemplate(TEMPLATE2, { folderName: "目录名" });
		assert.equal(
			output2,
			"https://example.com?redirect=https%3A%2F%2Fexample.com%3FfolderName%3D%25E7%259B%25AE%25E5%25BD%2595%25E5%2590%258D"
		);

		const outputURL = new URL(output2);

		assert.equal(outputURL.searchParams.get("redirect"), "https://example.com?folderName=%E7%9B%AE%E5%BD%95%E5%90%8D");
		assert.equal(decodeURIComponent(outputURL.searchParams.get("redirect")), "https://example.com?folderName=目录名");
	});
});
