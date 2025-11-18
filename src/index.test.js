import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { evalTemplate, evalExpression } from "./index.js";

describe("evalTemplate 函数测试", () => {
	// 示例用法
	test("evalTemplate - 基本变量替换", () => {
		const TEMPLATE = "Hello, {{ name }}!";
		const variables = { name: "World" };
		const output = evalTemplate(TEMPLATE, variables);
		assert.equal(output, "Hello, World!");
	});

	test("evalTemplate - 表达式求值", () => {
		const TEMPLATE = "2 + 2 = {{ 2 + 2 }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "2 + 2 = 4");
	});

	test("evalTemplate - 嵌套表达式", () => {
		const TEMPLATE = "The result of (2 + 3) * 4 is {{ (2 + 3) * 4 }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "The result of (2 + 3) * 4 is 20");
	});

	test("evalTemplate - 变量和表达式混合", () => {
		const TEMPLATE = "Hello, {{ name }}! Today is {{ new Date().toLocaleDateString() }}.";
		const variables = { name: "World" };
		const output = evalTemplate(TEMPLATE, variables);
		const expectedOutput = `Hello, World! Today is ${new Date().toLocaleDateString()}.`;
		assert.equal(output, expectedOutput);
	});

	test("evalTemplate - 未定义变量", () => {
		const TEMPLATE = "Hello, {{ name }}!";
		const variables = {};
		const output = evalTemplate(TEMPLATE, variables);
		assert.equal(output, "Hello, undefined!");
	});

	test("evalTemplate - 复杂表达式", () => {
		const TEMPLATE = "The sum of 1, 2, and 3 is {{ [1, 2, 3].reduce((a, b) => a + b, 0) }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "The sum of 1, 2, and 3 is 6");
	});

	test("evalTemplate - 带有错误的表达式", () => {
		const TEMPLATE = "This will cause an error: {{ nonExistentFunction() }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "This will cause an error: undefined");
	});

	describe("evalTemplate - 模版字面量", () => {
		test("basic", () => {
			const TEMPLATE = "{{ `hello ${ name }, I am robot!` }}";
			const output = evalTemplate(TEMPLATE, { name: "world" });
			assert.equal(output, "hello world, I am robot!");
		});

		test("prefix", () => {
			const TEMPLATE = "{{ `${action}, How are you?` }}";
			const output = evalTemplate(TEMPLATE, { action: "Hi" });
			assert.equal(output, "Hi, How are you?");
		});

		test("nest", () => {
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

	// 测试多个表达式
	test("evalTemplate - 多个表达式", () => {
		const TEMPLATE = "{{ a }} + {{ b }} = {{ a + b }}";
		const output = evalTemplate(TEMPLATE, { a: 10, b: 20 });
		assert.equal(output, "10 + 20 = 30");
	});

	// 测试空表达式
	test("evalTemplate - 空模板", () => {
		const TEMPLATE = "Hello World";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "Hello World");
	});

	// 测试多种类型的值
	test("evalTemplate - 不同类型的值", () => {
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

	// 测试对象表达式
	test("evalTemplate - 对象表达式", () => {
		const TEMPLATE = "{{ ({ a: 1, b: 2 }) }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "[object Object]");
	});

	// 测试数组方法
	test("evalTemplate - 数组方法", () => {
		const TEMPLATE = "{{ [1, 2, 3].map(x => x * 2).join(', ') }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "2, 4, 6");
	});

	// 测试三元表达式
	test("evalTemplate - 三元表达式", () => {
		const TEMPLATE = "{{ score >= 60 ? 'Pass' : 'Fail' }}";
		const output1 = evalTemplate(TEMPLATE, { score: 75 });
		const output2 = evalTemplate(TEMPLATE, { score: 45 });
		assert.equal(output1, "Pass");
		assert.equal(output2, "Fail");
	});

	// 测试Math函数
	test("evalTemplate - Math函数", () => {
		const TEMPLATE = "Max: {{ Math.max(10, 20, 30) }}, Min: {{ Math.min(10, 20, 30) }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "Max: 30, Min: 10");
	});

	// 测试字符串方法
	test("evalTemplate - 字符串方法", () => {
		const TEMPLATE = "{{ text.toUpperCase() }}";
		const output = evalTemplate(TEMPLATE, { text: "hello world" });
		assert.equal(output, "HELLO WORLD");
	});

	// 测试可选链
	test("evalTemplate - 可选链", () => {
		const TEMPLATE = "{{ obj?.prop?.value ?? 'default' }}";
		const output1 = evalTemplate(TEMPLATE, { obj: { prop: { value: 42 } } });
		const output2 = evalTemplate(TEMPLATE, { obj: null });
		assert.equal(output1, "42");
		assert.equal(output2, "default");
	});

	// 测试逻辑运算
	test("evalTemplate - 逻辑运算", () => {
		const TEMPLATE = "{{ a && b || c }}";
		const output = evalTemplate(TEMPLATE, { a: true, b: false, c: true });
		assert.equal(output, "true");
	});

	// 测试JSON操作
	test("evalTemplate - JSON操作", () => {
		const TEMPLATE = "{{ JSON.stringify({ x: 10, y: 20 }) }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, '{"x":10,"y":20}');
	});

	// 测试Date
	test("evalTemplate - Date", () => {
		const TEMPLATE = "{{ new Date(0).getTime() }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "0");
	});

	// 测试错误处理 - 语法错误
	test("evalTemplate - 语法错误", () => {
		const TEMPLATE = "{{ 1 + }}";
		assert.throws(() => evalTemplate(TEMPLATE), /Unexpected token/);
	});

	// 测试错误处理 - 访问null属性
	test("evalTemplate - 访问null属性错误", () => {
		const TEMPLATE = "{{ obj.prop }}";
		assert.throws(() => evalTemplate(TEMPLATE, { obj: null }), /Cannot read property/);
	});

	// 测试多行模板
	test("evalTemplate - 多行模板", () => {
		const TEMPLATE = "Line 1: {{ a }}\nLine 2: {{ b }}\nLine 3: {{ a + b }}";
		const output = evalTemplate(TEMPLATE, { a: 5, b: 10 });
		assert.equal(output, "Line 1: 5\nLine 2: 10\nLine 3: 15");
	});

	// 测试特殊字符
	test("evalTemplate - 特殊字符", () => {
		const TEMPLATE = "Symbol: {{ symbol }}";
		const output = evalTemplate(TEMPLATE, { symbol: "$" });
		assert.equal(output, "Symbol: $");
	});

	// 测试嵌套括号
	test("evalTemplate - 嵌套括号", () => {
		const TEMPLATE = "{{ ((a + b) * (c - d)) }}";
		const output = evalTemplate(TEMPLATE, { a: 1, b: 2, c: 10, d: 5 });
		assert.equal(output, "15");
	});

	// 测试箭头函数
	test("evalTemplate - 箭头函数", () => {
		const TEMPLATE = "{{ ((x) => x * 2)(5) }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "10");
	});

	// 测试表达式中带有 }} 结束符号
	test("evalTemplate - 表达式中带有 }} 符号", () => {
		const TEMPLATE = "{{ 'This is a curly brace: }}' }}";
		const output = evalTemplate(TEMPLATE);
		assert.equal(output, "This is a curly brace: }}");
	});
});

describe("evalExpression 函数测试", () => {
	test("evalExpression - 基本表达式", () => {
		const expression = "a + b * c";
		const context = { a: 2, b: 3, c: 4 };
		const result = evalExpression(expression, context);
		assert.equal(result, 14);
	});

	test("evalExpression - 函数调用", () => {
		const expression = "Math.max(x, y)";
		const context = { x: 10, y: 20 };
		const result = evalExpression(expression, context);
		assert.equal(result, 20);
	});

	test("evalExpression - 字符串操作", () => {
		const expression = "greeting + ', ' + name + '!'";
		const context = { greeting: "Hello", name: "Alice" };
		const result = evalExpression(expression, context);
		assert.equal(result, "Hello, Alice!");
	});

	test("evalExpression - 逻辑运算", () => {
		const expression = "isActive && (score > 50)";
		const context = { isActive: true, score: 75 };
		const result = evalExpression(expression, context);
		assert.equal(result, true);
	});

	test("evalExpression - 数组方法", () => {
		const expression = "numbers.map(n => n * 2).join(', ')";
		const context = { numbers: [1, 2, 3] };
		const result = evalExpression(expression, context);
		assert.equal(result, "2, 4, 6");
	});
});

describe("evalExpression - 错误处理", () => {
	test("引用未定义变量", () => {
		const expression = "a + b";
		const context = { a: 5 };
		assert.throws(() => evalExpression(expression, context), /b is not defined/);
	});

	test("语法错误", () => {
		const expression = "5 + * 2";
		assert.throws(() => evalExpression(expression), /Unexpected token/);
	});
});
