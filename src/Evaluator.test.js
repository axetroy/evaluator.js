import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { Evaluator } from "./Evaluator.js"; // 导入上面的 Evaluator 实现

/**
 * @type {Evaluator}
 */
let evaluator;

beforeEach(() => {
	evaluator = new Evaluator({ a: 5, b: 10, x: 15 });
});

// 测试数学运算
test("Math operations", () => {
	assert.equal(evaluator.evaluate("1 + 2"), 3);
	assert.equal(evaluator.evaluate("10 - 4"), 6);
	assert.equal(evaluator.evaluate("3 * 3"), 9);
	assert.equal(evaluator.evaluate("8 / 2"), 4);
	assert.equal(evaluator.evaluate("2 % 4"), 2);
	assert.equal(evaluator.evaluate("2 ** 3"), 8);
});

// 测试一元表达式
test("Unary expression", () => {
	assert.equal(evaluator.evaluate("-5"), -5);
	assert.equal(evaluator.evaluate("+5"), 5);
	assert.equal(evaluator.evaluate("!false"), true);
	assert.equal(evaluator.evaluate("void 5"), undefined);
	assert.equal(evaluator.evaluate("typeof 5"), "number");
});

// 测试三元表达式
test("Ternary expression", () => {
	assert.equal(evaluator.evaluate("true ? 1 : 2"), 1);
	assert.equal(evaluator.evaluate("false ? 1 : 2"), 2);
});

// 测试括号优先级
test("Parentheses precedence", () => {
	assert.equal(evaluator.evaluate("(1 + 2) * 3"), 9);
	assert.equal(evaluator.evaluate("10 / (2 + 3)"), 2);
});

// 测试变量使用
test("Variable usage", () => {
	assert.equal(evaluator.evaluate("a + b"), 15);
	assert.equal(evaluator.evaluate("a * b"), 50);
});

// 测试错误处理
test("Error handling", () => {
	assert.throws(() => evaluator.evaluate("1 / 0"), { message: "Division by zero" });
	assert.throws(() => evaluator.evaluate("a = (5 + 3"), /Unexpected token/);
	assert.throws(() => evaluator.evaluate("5 +"), /Unexpected token/);

	{
		const evaluator = new Evaluator({ foo: null });
		assert.throws(() => evaluator.evaluate("foo.bar"), /Cannot read property/);
	}

	{
		const evaluator = new Evaluator({ foo: undefined });
		assert.throws(() => evaluator.evaluate("foo.bar"), /Cannot read property/);
	}

	{
		const evaluator = new Evaluator({ foo: {} });
		assert.throws(() => evaluator.evaluate("foo.undefinedProperty()"), /foo\.undefinedProperty is not a function/);
		assert.throws(() => evaluator.evaluate('foo["undefinedProperty"]()'), /foo\["undefinedProperty"\] is not a function/);
		assert.throws(() => evaluator.evaluate("foo[1]()"), /foo\[1\] is not a function/);
		assert.throws(() => evaluator.evaluate("foo[[1,2,3]]()"), /foo\[\(array\)] is not a function/);
		assert.throws(() => evaluator.evaluate("foo[{}]()"), /foo\[\(object\)] is not a function/);
	}
});

// 测试比较运算符
test("Comparison operators", () => {
	assert.equal(evaluator.evaluate("5 == 5"), true);
	assert.equal(evaluator.evaluate("5 === 5"), true);
	assert.equal(evaluator.evaluate("5 != 6"), true);
	assert.equal(evaluator.evaluate("5 !== 6"), true);
	assert.equal(evaluator.evaluate("5 > 3"), true);
	assert.equal(evaluator.evaluate("5 >= 5"), true);
	assert.equal(evaluator.evaluate("3 < 5"), true);
	assert.equal(evaluator.evaluate("3 <= 5"), true);
	assert.equal(evaluator.evaluate('5 == "5"'), true); // 非严格相等
	assert.equal(evaluator.evaluate('5 === "5"'), false); // 严格相等
	assert.equal(evaluator.evaluate('5 != "6"'), true); // 非严格不等
	assert.equal(evaluator.evaluate('5 !== "5"'), true); // 严格不等
});

// 位运算符
test("Bitwise operators", () => {
	assert.equal(evaluator.evaluate("5 & 3"), 1); // 按位与
	assert.equal(evaluator.evaluate("5 | 3"), 7); // 按位或
	assert.equal(evaluator.evaluate("5 ^ 3"), 6); // 按位异或
	assert.equal(evaluator.evaluate("~5"), -6); // 按位非
	assert.equal(evaluator.evaluate("5 << 1"), 10); // 左移
	assert.equal(evaluator.evaluate("5 >> 1"), 2); // 右移
	assert.equal(evaluator.evaluate("5 >>> 1"), 2); // 无符号右移
	assert.equal(evaluator.evaluate("5 >>> 0"), 5); // 无符号右移
});

// 测试逻辑运算符
test("Logical operators", () => {
	assert.equal(evaluator.evaluate("true && false"), false);
	assert.equal(evaluator.evaluate("true || false"), true);
	assert.equal(evaluator.evaluate("!false"), true);
	assert.equal(evaluator.evaluate("true && (false || true)"), true);
	assert.equal(evaluator.evaluate("(true || false) && false"), false);
	assert.equal(evaluator.evaluate("undefined ?? true"), true);
	assert.equal(evaluator.evaluate("null ?? true"), true);

	// 测试短路
	assert.equal(evaluator.evaluate("false && foo.bar"), false);
	assert.equal(evaluator.evaluate("true || foo.bar"), true);
});

// 测试成员表达式
test("Member expression", () => {
	evaluator = new Evaluator({ obj: { a: { b: { c: 42 } } } });
	assert.equal(evaluator.evaluate("obj.a.b.c"), 42);
	assert.equal(evaluator.evaluate("obj.a.b.d"), undefined);
});

// 测试属性访问
test("Property access", () => {
	assert.strict(evaluator.evaluate("Math.PI"), Math.PI);
	assert.strict(evaluator.evaluate("Math.random() >= 0"), true);

	{
		const evaluator = new Evaluator({ foo: { bar: 42 } });
		assert.deepEqual(evaluator.evaluate("foo.bar"), 42);
	}

	{
		const evaluator = new Evaluator({ foo: { bar: 42 } });
		assert.deepEqual(evaluator.evaluate('foo["bar"]'), 42);
	}

	{
		const evaluator = new Evaluator({ foo: { bar: 42 }, key: "bar" });
		assert.deepEqual(evaluator.evaluate("foo[key]"), 42);
	}

	{
		const evaluator = new Evaluator({ foo: { bar: { baz: 42 } } });
		assert.deepEqual(evaluator.evaluate("foo.bar.baz"), 42);
	}

	{
		const evaluator = new Evaluator({ foo: [1, 2, 3] });
		assert.deepEqual(evaluator.evaluate("foo[1]"), 2);
	}
});

// 测试对象表达式
test("Object expression", () => {
	assert.deepEqual(evaluator.evaluate("({ a: 1, b: 2 })"), { a: 1, b: 2 });
	assert.deepEqual(evaluator.evaluate("({ x: 10, y: { z: 20 } })"), { x: 10, y: { z: 20 } });
});

// 测试数组表达式
test("Array expression", () => {
	assert.deepEqual(evaluator.evaluate("[1, 2, 3]"), [1, 2, 3]);
});

// 测试箭头函数
test("Arrow function", () => {
	assert.equal(evaluator.evaluate("((a, b) => a + b)(2, 3)"), 5);
});

// 测试原型链上的函数执行
test("Function call", () => {
	assert.deepEqual(evaluator.evaluate("[1, 2].map(v => v + 1)"), [2, 3]);
	assert.deepEqual(evaluator.evaluate('" Hello world! ".trim()'), "Hello world!");
});

// 测试作用域
test("Scope handling", () => {
	const evaluator = new Evaluator({ item: [1, 2, 3] });
	assert.deepEqual(evaluator.evaluate("item.map(item => item + 1)"), [2, 3, 4]);
});

// 测试不可变的原型方法
test("Immutable prototype methods", () => {
	assert.throws(() => evaluator.evaluate("[1, 2].push(3)"), { message: "Cannot call mutable prototype method: push" });
	assert.throws(() => evaluator.evaluate("[1, 2].pop()"), { message: "Cannot call mutable prototype method: pop" });
});

// 测试全局方法
test("Global methods", () => {
	assert.equal(evaluator.evaluate("Math.sqrt(16)"), 4);
	assert.equal(evaluator.evaluate("Math.max(1, 2, 3)"), 3);
	assert.equal(evaluator.evaluate("Math.min(1, 2, 3)"), 1);
});

// 测试 New 表达式
test("New expression", () => {
	assert.equal(evaluator.evaluate("new Date(0).getTime()"), 0);
	assert.equal(evaluator.evaluate("new Date().getTime() > 0"), true);
	assert.deepEqual(evaluator.evaluate("new Array(1,2,3)"), [1, 2, 3]);

	assert.throws(() => evaluator.evaluate("new Function()"), { message: "Cannot use new with Function constructor" });
});

// 测试 TypeArray
test("TypedArray", () => {
	assert.equal(evaluator.evaluate("new Int8Array([1, 2, 3]).length"), 3);
	assert.equal(evaluator.evaluate("new Int8Array([1, 2, 3])[1]"), 2);
});

// Optional chaining
test("Optional chaining", () => {
	assert.throws(() => evaluator.evaluate("foo?.bar"), { message: "foo is not defined" });
	assert.throws(() => evaluator.evaluate("foo?.bar?.baz"), { message: "foo is not defined" });
	assert.throws(() => evaluator.evaluate("foo?.bar?.baz ?? 42"), { message: "foo is not defined" });

	{
		const evaluator = new Evaluator({ foo: { bar: 42 } });
		assert.equal(evaluator.evaluate("foo?.bar"), 42);
	}

	{
		const evaluator = new Evaluator({ foo: { bar: { baz: 42 } } });
		assert.equal(evaluator.evaluate("foo?.bar.baz"), 42);
	}

	{
		const evaluator = new Evaluator({ foo: null });
		assert.equal(evaluator.evaluate("foo?.bar"), undefined);
	}

	{
		const evaluator = new Evaluator({ foo: undefined });
		assert.equal(evaluator.evaluate("foo?.bar"), undefined);
	}

	// function call
	{
		const evaluator = new Evaluator({ foo: { bar: () => 42 } });
		assert.equal(evaluator.evaluate("foo?.bar()"), 42);
	}

	{
		const evaluator = new Evaluator({ foo: null });
		assert.equal(evaluator.evaluate("foo?.bar()"), undefined);
	}

	{
		const evaluator = new Evaluator({ foo: undefined });
		assert.equal(evaluator.evaluate("foo?.bar()"), undefined);
	}
});

// Disable eval()
test("Disable eval()", () => {
	assert.throws(() => evaluator.evaluate('eval("foo")'), { message: "eval is not defined" });
});

// 测试模板字符串
test("Template strings", () => {
	assert.equal(evaluator.evaluate("`Hello, ${5 + 5}!`"), "Hello, 10!");
	assert.equal(evaluator.evaluate("`Hello, ${5 + 5}!`.length"), 10);
});
