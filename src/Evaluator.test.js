import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import { Evaluator, getNodeString } from "./Evaluator.js";

/**
 * @type {Evaluator}
 */
let evaluator;

beforeEach(() => {
	evaluator = new Evaluator({ a: 5, b: 10, x: 15 });
});

describe("Operators", () => {
	describe("Arithmetic Operators", () => {
		test("should perform basic arithmetic operations", () => {
			assert.equal(evaluator.evaluate("1 + 2"), 3);
			assert.equal(evaluator.evaluate("10 - 4"), 6);
			assert.equal(evaluator.evaluate("3 * 3"), 9);
			assert.equal(evaluator.evaluate("8 / 2"), 4);
			assert.equal(evaluator.evaluate("2 % 4"), 2);
			assert.equal(evaluator.evaluate("2 ** 3"), 8);
		});

		test("should handle parentheses precedence", () => {
			assert.equal(evaluator.evaluate("(1 + 2) * 3"), 9);
			assert.equal(evaluator.evaluate("10 / (2 + 3)"), 2);
		});
	});

	describe("Comparison Operators", () => {
		test("should perform equality comparisons", () => {
			assert.equal(evaluator.evaluate("5 == 5"), true);
			assert.equal(evaluator.evaluate("5 === 5"), true);
			assert.equal(evaluator.evaluate("5 != 6"), true);
			assert.equal(evaluator.evaluate("5 !== 6"), true);
		});

		test("should perform relational comparisons", () => {
			assert.equal(evaluator.evaluate("5 > 3"), true);
			assert.equal(evaluator.evaluate("5 >= 5"), true);
			assert.equal(evaluator.evaluate("3 < 5"), true);
			assert.equal(evaluator.evaluate("3 <= 5"), true);
		});

		test("should handle type coercion in comparisons", () => {
			assert.equal(evaluator.evaluate('5 == "5"'), true);
			assert.equal(evaluator.evaluate('5 === "5"'), false);
			assert.equal(evaluator.evaluate('5 != "6"'), true);
			assert.equal(evaluator.evaluate('5 !== "5"'), true);
		});
	});

	describe("Logical Operators", () => {
		test("should perform logical AND, OR, and NOT", () => {
			assert.equal(evaluator.evaluate("true && false"), false);
			assert.equal(evaluator.evaluate("true || false"), true);
			assert.equal(evaluator.evaluate("!false"), true);
		});

		test("should handle complex logical expressions", () => {
			assert.equal(evaluator.evaluate("true && (false || true)"), true);
			assert.equal(evaluator.evaluate("(true || false) && false"), false);
		});

		test("should support nullish coalescing operator", () => {
			assert.equal(evaluator.evaluate("undefined ?? true"), true);
			assert.equal(evaluator.evaluate("null ?? true"), true);
		});

		test("should short-circuit logical operations", () => {
			assert.equal(evaluator.evaluate("false && foo.bar"), false);
			assert.equal(evaluator.evaluate("true || foo.bar"), true);
		});

		test("should handle nullish coalescing with various falsy values", () => {
			assert.equal(evaluator.evaluate("null ?? 42"), 42);
			assert.equal(evaluator.evaluate("undefined ?? 42"), 42);
			assert.equal(evaluator.evaluate("0 ?? 42"), 0);
			assert.equal(evaluator.evaluate('"" ?? 42'), "");
			assert.equal(evaluator.evaluate("false ?? 42"), false);
			assert.equal(evaluator.evaluate("NaN ?? 42"), NaN);
		});
	});

	describe("Bitwise Operators", () => {
		test("should perform bitwise operations", () => {
			assert.equal(evaluator.evaluate("5 & 3"), 1);
			assert.equal(evaluator.evaluate("5 | 3"), 7);
			assert.equal(evaluator.evaluate("5 ^ 3"), 6);
			assert.equal(evaluator.evaluate("~5"), -6);
		});

		test("should perform bitwise shift operations", () => {
			assert.equal(evaluator.evaluate("5 << 1"), 10);
			assert.equal(evaluator.evaluate("5 >> 1"), 2);
			assert.equal(evaluator.evaluate("5 >>> 1"), 2);
			assert.equal(evaluator.evaluate("5 >>> 0"), 5);
		});
	});

	describe("Unary Operators", () => {
		test("should handle unary plus and minus", () => {
			assert.equal(evaluator.evaluate("-5"), -5);
			assert.equal(evaluator.evaluate("+5"), 5);
		});

		test("should handle logical NOT", () => {
			assert.equal(evaluator.evaluate("!false"), true);
		});

		test("should handle void operator", () => {
			assert.equal(evaluator.evaluate("void 5"), undefined);
		});

		test("should handle typeof operator", () => {
			assert.equal(evaluator.evaluate("typeof 5"), "number");
		});
	});

	describe("Ternary Operator", () => {
		test("should evaluate ternary expressions", () => {
			assert.equal(evaluator.evaluate("true ? 1 : 2"), 1);
			assert.equal(evaluator.evaluate("false ? 1 : 2"), 2);
		});

		test("should handle nested ternary expressions", () => {
			assert.equal(evaluator.evaluate("true ? (true ? 1 : 2) : 3"), 1);
			assert.equal(evaluator.evaluate("false ? 1 : (true ? 2 : 3)"), 2);
			assert.equal(evaluator.evaluate("true ? 1 : false ? 2 : 3"), 1);
			assert.equal(evaluator.evaluate('1 > 2 ? "a" : 2 > 1 ? "b" : "c"'), "b");
		});
	});
});

describe("Data Types", () => {
	describe("Numbers", () => {
		test("should handle special numeric values", () => {
			assert.equal(evaluator.evaluate("Infinity"), Infinity);
			assert.equal(evaluator.evaluate("-Infinity"), -Infinity);
			assert.equal(evaluator.evaluate("Infinity + 1"), Infinity);
			assert.equal(evaluator.evaluate("Infinity - Infinity"), NaN);
			assert.equal(evaluator.evaluate("Infinity / Infinity"), NaN);
			assert.equal(evaluator.evaluate("0 / 0"), NaN);
		});

		test("should handle NaN and Infinity checks", () => {
			assert.equal(evaluator.evaluate("isNaN(NaN)"), true);
			assert.equal(evaluator.evaluate("isNaN(0)"), false);
			assert.equal(evaluator.evaluate("isFinite(100)"), true);
			assert.equal(evaluator.evaluate("isFinite(Infinity)"), false);
			assert.equal(evaluator.evaluate("isFinite(NaN)"), false);
		});

		test("should handle negative zero", () => {
			assert.equal(evaluator.evaluate("-0"), -0);
			assert.equal(evaluator.evaluate("-0 === 0"), true);
			assert.equal(evaluator.evaluate("1 / -0"), -Infinity);
			assert.equal(evaluator.evaluate("1 / 0"), Infinity);
		});

		test("should handle very large numbers", () => {
			assert.equal(evaluator.evaluate("1e308"), 1e308);
			assert.equal(evaluator.evaluate("1e309"), Infinity);
			assert.equal(evaluator.evaluate("Number.MAX_VALUE"), Number.MAX_VALUE);
			assert.equal(evaluator.evaluate("Number.MIN_VALUE"), Number.MIN_VALUE);
			assert.equal(evaluator.evaluate("Number.MAX_SAFE_INTEGER"), Number.MAX_SAFE_INTEGER);
			assert.equal(evaluator.evaluate("Number.MIN_SAFE_INTEGER"), Number.MIN_SAFE_INTEGER);
		});

		test("should parse and convert numbers", () => {
			assert.equal(evaluator.evaluate('parseInt("123")'), 123);
			assert.equal(evaluator.evaluate('parseInt("123.45")'), 123);
			assert.equal(evaluator.evaluate('parseInt("0x10")'), 16);
			assert.equal(evaluator.evaluate('parseFloat("123.45")'), 123.45);
			assert.equal(evaluator.evaluate('Number("123")'), 123);
			assert.equal(evaluator.evaluate('Number("123.45")'), 123.45);
			assert.equal(evaluator.evaluate("Number(true)"), 1);
			assert.equal(evaluator.evaluate("Number(false)"), 0);
			assert.equal(evaluator.evaluate("Number(null)"), 0);
			assert.equal(evaluator.evaluate('isNaN(Number("abc"))'), true);
		});
	});

	describe("Strings", () => {
		test("should handle string operations", () => {
			const evaluator = new Evaluator({ str: "Hello World" });
			assert.equal(evaluator.evaluate('"Hello" + " " + "World"'), "Hello World");
			assert.equal(evaluator.evaluate("str.toUpperCase()"), "HELLO WORLD");
			assert.equal(evaluator.evaluate("str.toLowerCase()"), "hello world");
		});

		test("should handle string methods", () => {
			const evaluator = new Evaluator({ str: "Hello World" });
			assert.equal(evaluator.evaluate("str.substring(0, 5)"), "Hello");
			assert.equal(evaluator.evaluate("str.slice(6)"), "World");
			assert.equal(evaluator.evaluate('str.indexOf("World")'), 6);
			assert.equal(evaluator.evaluate('str.includes("World")'), true);
			assert.equal(evaluator.evaluate('str.startsWith("Hello")'), true);
			assert.equal(evaluator.evaluate('str.endsWith("World")'), true);
			assert.equal(evaluator.evaluate('str.replace("World", "JS")'), "Hello JS");
			assert.equal(evaluator.evaluate('str.split(" ").length'), 2);
		});

		test("should handle string manipulation methods", () => {
			assert.equal(evaluator.evaluate('"  spaces  ".trim()'), "spaces");
			assert.equal(evaluator.evaluate('"abc".repeat(3)'), "abcabcabc");
			assert.equal(evaluator.evaluate('"abc".padStart(5, "0")'), "00abc");
			assert.equal(evaluator.evaluate('"abc".padEnd(5, "0")'), "abc00");
		});

		test("should handle string conversion", () => {
			assert.equal(evaluator.evaluate("String(123)"), "123");
			assert.equal(evaluator.evaluate("String(true)"), "true");
			assert.equal(evaluator.evaluate("String(null)"), "null");
			assert.equal(evaluator.evaluate("String(undefined)"), "undefined");
			assert.equal(evaluator.evaluate("String([1, 2, 3])"), "1,2,3");
		});
	});

	describe("Arrays", () => {
		test("should create and access arrays", () => {
			assert.deepEqual(evaluator.evaluate("[1, 2, 3]"), [1, 2, 3]);
		});

		test("should handle array iteration methods", () => {
			const evaluator = new Evaluator({ arr: [1, 2, 3, 4, 5] });
			assert.deepEqual(evaluator.evaluate("[1, 2].map(v => v + 1)"), [2, 3]);
			assert.deepEqual(evaluator.evaluate("arr.filter(x => x > 2)"), [3, 4, 5]);
			assert.equal(evaluator.evaluate("arr.reduce((a, b) => a + b, 0)"), 15);
		});

		test("should handle array search methods", () => {
			const evaluator = new Evaluator({ arr: [1, 2, 3, 4, 5] });
			assert.equal(evaluator.evaluate("arr.find(x => x > 3)"), 4);
			assert.equal(evaluator.evaluate("arr.findIndex(x => x > 3)"), 3);
			assert.equal(evaluator.evaluate("arr.some(x => x > 4)"), true);
			assert.equal(evaluator.evaluate("arr.every(x => x > 0)"), true);
			assert.equal(evaluator.evaluate("arr.includes(3)"), true);
			assert.equal(evaluator.evaluate("arr.indexOf(3)"), 2);
			assert.equal(evaluator.evaluate("arr.lastIndexOf(3)"), 2);
		});

		test("should handle array manipulation methods", () => {
			const evaluator = new Evaluator({ arr: [1, 2, 3, 4, 5] });
			assert.deepEqual(evaluator.evaluate("arr.slice(1, 3)"), [2, 3]);
			assert.deepEqual(evaluator.evaluate("arr.concat([6, 7])"), [1, 2, 3, 4, 5, 6, 7]);
			assert.deepEqual(evaluator.evaluate('arr.join("-")'), "1-2-3-4-5");
			assert.deepEqual(evaluator.evaluate("[1, [2, [3, 4]]].flat()"), [1, 2, [3, 4]]);
			assert.deepEqual(evaluator.evaluate("[1, [2, [3, 4]]].flat(2)"), [1, 2, 3, 4]);
			assert.deepEqual(evaluator.evaluate("[1, 2, 3].flatMap(x => [x, x * 2])"), [1, 2, 2, 4, 3, 6]);
		});

		test("should handle array holes", () => {
			const evaluator = new Evaluator({ sparse: [1, , 3] });
			assert.equal(evaluator.evaluate("sparse.length"), 3);
			assert.equal(evaluator.evaluate("sparse[1]"), undefined);
			assert.equal(evaluator.evaluate("sparse[0]"), 1);
			assert.equal(evaluator.evaluate("sparse[2]"), 3);
		});
	});

	describe("Objects", () => {
		test("should create object literals", () => {
			assert.deepEqual(evaluator.evaluate("({ a: 1, b: 2 })"), { a: 1, b: 2 });
			assert.deepEqual(evaluator.evaluate("({ x: 10, y: { z: 20 } })"), { x: 10, y: { z: 20 } });
		});

		test("should handle Object methods", () => {
			const evaluator = new Evaluator({ obj: { a: 1, b: 2, c: 3 } });
			assert.deepEqual(evaluator.evaluate("Object.keys(obj)"), ["a", "b", "c"]);
			assert.deepEqual(evaluator.evaluate("Object.values(obj)"), [1, 2, 3]);
			assert.deepEqual(evaluator.evaluate("Object.entries(obj)"), [
				["a", 1],
				["b", 2],
				["c", 3],
			]);
			assert.equal(evaluator.evaluate("Object.keys(obj).length"), 3);
			assert.equal(evaluator.evaluate('"a" in obj'), true);
		});

		test("should handle computed property names", () => {
			const evaluator = new Evaluator({ key: "myKey" });
			assert.deepEqual(evaluator.evaluate("({ [key]: 42 })"), { key: 42 });
			assert.deepEqual(evaluator.evaluate('({ ["computed"]: 123 })'), { computed: 123 });
		});
	});

	describe("BigInt", () => {
		test("should handle BigInt operations", () => {
			assert.equal(evaluator.evaluate("BigInt(123)"), 123n);
			assert.equal(evaluator.evaluate('BigInt("999999999999999999")'), 999999999999999999n);
			assert.equal(evaluator.evaluate("BigInt(123) + BigInt(456)"), 579n);
			assert.equal(evaluator.evaluate("BigInt(10) * BigInt(20)"), 200n);
			assert.equal(evaluator.evaluate("BigInt(100) / BigInt(3)"), 33n);
			assert.equal(evaluator.evaluate("BigInt(100) % BigInt(3)"), 1n);
			assert.equal(evaluator.evaluate("BigInt(2) ** BigInt(10)"), 1024n);
		});
	});

	describe("Symbol", () => {
		test("should handle Symbol operations", () => {
			assert.equal(evaluator.evaluate("typeof Symbol()"), "symbol");
			assert.equal(evaluator.evaluate('typeof Symbol("test")'), "symbol");
			assert.equal(evaluator.evaluate('Symbol("test").description'), "test");
		});
	});

	describe("RegExp", () => {
		test("should handle regular expression operations", () => {
			const evaluator = new Evaluator({ str: "Hello World 123" });
			assert.equal(evaluator.evaluate("/hello/i.test(str)"), true);
			assert.equal(evaluator.evaluate("/\\d+/.test(str)"), true);
			assert.equal(evaluator.evaluate("str.match(/\\d+/)[0]"), "123");
			assert.equal(evaluator.evaluate('str.replace(/\\d+/, "456")'), "Hello World 456");
			assert.equal(evaluator.evaluate('/hello/i.test("HELLO")'), true);
			assert.equal(evaluator.evaluate('new RegExp("world", "i").test(str)'), true);
		});
	});

	describe("Boolean", () => {
		test("should handle boolean conversion", () => {
			assert.equal(evaluator.evaluate("Boolean(1)"), true);
			assert.equal(evaluator.evaluate("Boolean(0)"), false);
			assert.equal(evaluator.evaluate('Boolean("hello")'), true);
			assert.equal(evaluator.evaluate('Boolean("")'), false);
			assert.equal(evaluator.evaluate("Boolean(null)"), false);
			assert.equal(evaluator.evaluate("Boolean(undefined)"), false);
			assert.equal(evaluator.evaluate("Boolean([])"), true);
			assert.equal(evaluator.evaluate("Boolean({})"), true);
		});
	});

	describe("Type Coercion", () => {
		test("should handle type coercion edge cases", () => {
			assert.equal(evaluator.evaluate('"5" + 5'), "55");
			assert.equal(evaluator.evaluate('"5" - 5'), 0);
			assert.equal(evaluator.evaluate('"5" * 5'), 25);
			assert.equal(evaluator.evaluate('"5" / 5'), 1);
			assert.equal(evaluator.evaluate("true + true"), 2);
			assert.equal(evaluator.evaluate("true + false"), 1);
			assert.equal(evaluator.evaluate("+true"), 1);
			assert.equal(evaluator.evaluate("+false"), 0);
			assert.equal(evaluator.evaluate('+"123"'), 123);
			assert.equal(evaluator.evaluate("!!1"), true);
			assert.equal(evaluator.evaluate("!!0"), false);
			assert.equal(evaluator.evaluate('!!"hello"'), true);
			assert.equal(evaluator.evaluate('!!""'), false);
		});
	});
});

describe("Expressions", () => {
	describe("Member Expressions", () => {
		test("should access object properties", () => {
			evaluator = new Evaluator({ obj: { a: { b: { c: 42 } } } });
			assert.equal(evaluator.evaluate("obj.a.b.c"), 42);
			assert.equal(evaluator.evaluate("obj.a.b.d"), undefined);
		});

		test("should support different property access syntaxes", () => {
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
	});

	describe("Optional Chaining", () => {
		test("should throw error for undefined root variables", () => {
			assert.throws(() => evaluator.evaluate("foo?.bar"), { message: "foo is not defined" });
			assert.throws(() => evaluator.evaluate("foo?.bar?.baz"), { message: "foo is not defined" });
			assert.throws(() => evaluator.evaluate("foo?.bar?.baz ?? 42"), { message: "foo is not defined" });
		});

		test("should handle optional chaining with defined values", () => {
			{
				const evaluator = new Evaluator({ foo: { bar: 42 } });
				assert.equal(evaluator.evaluate("foo?.bar"), 42);
			}

			{
				const evaluator = new Evaluator({ foo: { bar: { baz: 42 } } });
				assert.equal(evaluator.evaluate("foo?.bar.baz"), 42);
			}
		});

		test("should handle optional chaining with null/undefined", () => {
			{
				const evaluator = new Evaluator({ foo: null });
				assert.equal(evaluator.evaluate("foo?.bar"), undefined);
			}

			{
				const evaluator = new Evaluator({ foo: undefined });
				assert.equal(evaluator.evaluate("foo?.bar"), undefined);
			}
		});

		test("should handle optional chaining with function calls", () => {
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

		test("should handle complex optional chaining scenarios", () => {
			const evaluator = new Evaluator({
				obj: {
					a: {
						b: {
							c: 42,
							fn: () => 100,
						},
					},
				},
			});
			assert.equal(evaluator.evaluate("obj?.a?.b?.c"), 42);
			assert.equal(evaluator.evaluate("obj?.a?.b?.d"), undefined);
			assert.equal(evaluator.evaluate("obj?.a?.x?.c"), undefined);
			assert.equal(evaluator.evaluate("obj?.a?.b?.fn()"), 100);
			assert.equal(evaluator.evaluate("obj?.a?.b?.fn?.()"), 100);
		});
	});

	describe("New Expressions", () => {
		test("should handle constructor calls", () => {
			assert.equal(evaluator.evaluate("new Date(0).getTime()"), 0);
			assert.equal(evaluator.evaluate("new Date().getTime() > 0"), true);
			assert.deepEqual(evaluator.evaluate("new Array(1,2,3)"), [1, 2, 3]);
		});

		test("should block Function constructor", () => {
			assert.throws(() => evaluator.evaluate("new Function()"), { message: "Cannot use new with Function constructor" });
		});
	});

	describe("Spread Operator", () => {
		test("should handle spread in array literals", () => {
			const evaluator = new Evaluator({ arr1: [1, 2], arr2: [3, 4] });
			assert.deepEqual(evaluator.evaluate("[...arr1, ...arr2]"), [1, 2, 3, 4]);
		});

		test("should handle spread in function calls", () => {
			const evaluator = new Evaluator({ args: [1, 2, 3] });
			assert.equal(evaluator.evaluate("Math.max(...args)"), 3);
		});

		test("should handle spread in object literals", () => {
			const evaluator = new Evaluator({ obj1: { a: 1 }, obj2: { b: 2 }, merge: (a, b) => ({ ...a, ...b }) });
			assert.deepEqual(evaluator.evaluate("merge({...obj1, ...obj2})"), { a: 1, b: 2 });
		});
	});

	describe("Template Literals", () => {
		test("should evaluate template strings", () => {
			assert.equal(evaluator.evaluate("`Hello, ${5 + 5}!`"), "Hello, 10!");
			assert.equal(evaluator.evaluate("`Hello, ${5 + 5}!`.length"), 10);
		});

		test("should handle template literals with variables", () => {
			const evaluator = new Evaluator({ name: "World", count: 5 });
			assert.equal(evaluator.evaluate("`Hello ${name}!`"), "Hello World!");
			assert.equal(evaluator.evaluate("`Count: ${count}`"), "Count: 5");
			assert.equal(evaluator.evaluate("`Result: ${count * 2}`"), "Result: 10");
			assert.equal(evaluator.evaluate("`${1}${2}${3}`"), "123");
			assert.equal(evaluator.evaluate("`nested: ${`inner: ${5}`}`"), "nested: inner: 5");
		});
	});
});

describe("Functions", () => {
	describe("Arrow Functions", () => {
		test("should execute arrow functions", () => {
			assert.equal(evaluator.evaluate("((a, b) => a + b)(2, 3)"), 5);
		});

		test("should not support rest parameters", () => {
			assert.throws(() => evaluator.evaluate("((...args) => args.length)(1, 2, 3)"));
			assert.equal(evaluator.evaluate("((a, b, c) => [a, b, c].length)(1, 2, 3)"), 3);
			assert.deepEqual(evaluator.evaluate("((a, b, c) => [a, b, c])(1, 2, 3)"), [1, 2, 3]);
		});
	});

	describe("Method Calls", () => {
		test("should call prototype methods", () => {
			assert.deepEqual(evaluator.evaluate("[1, 2].map(v => v + 1)"), [2, 3]);
			assert.deepEqual(evaluator.evaluate('" Hello world! ".trim()'), "Hello world!");
		});

		test("should handle method chaining", () => {
			const evaluator = new Evaluator({ str: "  Hello World  " });
			assert.equal(evaluator.evaluate("str.trim().toLowerCase()"), "hello world");
			assert.equal(evaluator.evaluate("str.trim().toUpperCase().substring(0, 5)"), "HELLO");
			assert.deepEqual(evaluator.evaluate("[1, 2, 3].map(x => x * 2).filter(x => x > 2)"), [4, 6]);
		});
	});

	describe("Scope Handling", () => {
		test("should handle shadowed variables in arrow functions", () => {
			const evaluator = new Evaluator({ item: [1, 2, 3] });
			assert.deepEqual(evaluator.evaluate("item.map(item => item + 1)"), [2, 3, 4]);
		});
	});

	describe("Built-in Math Functions", () => {
		test("should call basic Math functions", () => {
			assert.equal(evaluator.evaluate("Math.sqrt(16)"), 4);
			assert.equal(evaluator.evaluate("Math.max(1, 2, 3)"), 3);
			assert.equal(evaluator.evaluate("Math.min(1, 2, 3)"), 1);
		});

		test("should call advanced Math functions", () => {
			assert.equal(evaluator.evaluate("Math.abs(-5)"), 5);
			assert.equal(evaluator.evaluate("Math.ceil(4.3)"), 5);
			assert.equal(evaluator.evaluate("Math.floor(4.7)"), 4);
			assert.equal(evaluator.evaluate("Math.round(4.5)"), 5);
			assert.equal(evaluator.evaluate("Math.round(4.4)"), 4);
			assert.equal(evaluator.evaluate("Math.trunc(4.9)"), 4);
			assert.equal(evaluator.evaluate("Math.sign(-5)"), -1);
			assert.equal(evaluator.evaluate("Math.sign(5)"), 1);
			assert.equal(evaluator.evaluate("Math.sign(0)"), 0);
			assert.equal(evaluator.evaluate("Math.pow(2, 3)"), 8);
			assert.equal(evaluator.evaluate("Math.sqrt(16)"), 4);
			assert.equal(evaluator.evaluate("Math.cbrt(27)"), 3);
			assert.equal(evaluator.evaluate("Math.hypot(3, 4)"), 5);
			assert.equal(evaluator.evaluate("Math.exp(0)"), 1);
			assert.equal(evaluator.evaluate("Math.log(Math.E)"), 1);
			assert.equal(evaluator.evaluate("Math.log10(100)"), 2);
			assert.equal(evaluator.evaluate("Math.log2(8)"), 3);
			assert.equal(evaluator.evaluate("Math.sin(0)"), 0);
			assert.equal(evaluator.evaluate("Math.cos(0)"), 1);
		});
	});
});

describe("Built-in Objects", () => {
	describe("Date", () => {
		test("should create and manipulate Date objects", () => {
			const evaluator = new Evaluator({ date: new Date("2024-01-01T00:00:00Z") });
			assert.equal(evaluator.evaluate("date.getFullYear()"), 2024);
			assert.equal(evaluator.evaluate("date.getUTCMonth()"), 0);
			assert.equal(evaluator.evaluate("date.getUTCDate()"), 1);
			assert.equal(evaluator.evaluate('new Date("2024-01-01").getFullYear()'), 2024);
			assert.equal(evaluator.evaluate("Date.now() > 0"), true);
		});
	});

	describe("JSON", () => {
		test("should handle JSON operations", () => {
			const evaluator = new Evaluator({ obj: { a: 1, b: 2 } });
			assert.equal(evaluator.evaluate("JSON.stringify(obj)"), '{"a":1,"b":2}');
			assert.deepEqual(evaluator.evaluate('JSON.parse("{\\"x\\":10}")'), { x: 10 });
			assert.deepEqual(evaluator.evaluate("JSON.parse(JSON.stringify(obj))"), { a: 1, b: 2 });
		});
	});

	describe("Set", () => {
		test("should handle Set operations", () => {
			const evaluator = new Evaluator({ set: new Set([1, 2, 3]) });
			assert.equal(evaluator.evaluate("set.size"), 3);
			assert.equal(evaluator.evaluate("set.has(2)"), true);
			assert.equal(evaluator.evaluate("set.has(4)"), false);
			assert.deepEqual(evaluator.evaluate("Array.from(set)"), [1, 2, 3]);
			assert.deepEqual(evaluator.evaluate("[...set]"), [1, 2, 3]);
		});
	});

	describe("Map", () => {
		test("should handle Map operations", () => {
			const evaluator = new Evaluator({
				map: new Map([
					["a", 1],
					["b", 2],
				]),
			});
			assert.equal(evaluator.evaluate("map.size"), 2);
			assert.equal(evaluator.evaluate('map.get("a")'), 1);
			assert.equal(evaluator.evaluate('map.has("b")'), true);
			assert.equal(evaluator.evaluate('map.has("c")'), false);
			assert.deepEqual(evaluator.evaluate("Array.from(map.keys())"), ["a", "b"]);
			assert.deepEqual(evaluator.evaluate("Array.from(map.values())"), [1, 2]);
		});
	});

	describe("TypedArray", () => {
		test("should handle TypedArray operations", () => {
			assert.equal(evaluator.evaluate("new Int8Array([1, 2, 3]).length"), 3);
			assert.equal(evaluator.evaluate("new Int8Array([1, 2, 3])[1]"), 2);
		});

		test("should handle various TypedArray types", () => {
			assert.equal(evaluator.evaluate("new Int16Array([1, 2, 3]).length"), 3);
			assert.equal(evaluator.evaluate("new Int32Array([1, 2, 3])[1]"), 2);
			assert.equal(evaluator.evaluate("new Float32Array([1.5, 2.5, 3.5])[0]"), 1.5);
			assert.equal(evaluator.evaluate("new Float64Array([1.1, 2.2, 3.3]).length"), 3);
			assert.deepEqual(evaluator.evaluate("Array.from(new Uint8Array([1, 2, 3]).slice(1))"), [2, 3]);
		});
	});

	describe("Promise", () => {
		test("should recognize Promise type", () => {
			assert.equal(evaluator.evaluate("typeof Promise"), "function");
			assert.equal(evaluator.evaluate("new Promise((resolve) => resolve(42))") instanceof Promise, true);
		});
	});

	describe("Error Types", () => {
		test("should create Error objects", () => {
			assert.equal(evaluator.evaluate('new Error("test").message'), "test");
			assert.equal(evaluator.evaluate('new TypeError("test").message'), "test");
			assert.equal(evaluator.evaluate('new RangeError("test").message'), "test");
			assert.equal(evaluator.evaluate('new ReferenceError("test").message'), "test");
			assert.equal(evaluator.evaluate('new SyntaxError("test").message'), "test");
		});
	});

	describe("URI Encoding", () => {
		test("should encode and decode URIs", () => {
			assert.equal(
				evaluator.evaluate('encodeURI("https://example.com/path?query=测试")'),
				"https://example.com/path?query=%E6%B5%8B%E8%AF%95"
			);
			assert.equal(evaluator.evaluate('decodeURI(encodeURI("测试"))'), "测试");
			assert.equal(evaluator.evaluate('encodeURIComponent("测试")'), "%E6%B5%8B%E8%AF%95");
			assert.equal(evaluator.evaluate('decodeURIComponent("%E6%B5%8B%E8%AF%95")'), "测试");
		});
	});
});

describe("Variables and Context", () => {
	test("should access context variables", () => {
		assert.equal(evaluator.evaluate("a + b"), 15);
		assert.equal(evaluator.evaluate("a * b"), 50);
	});

	test("should throw error for undefined variables", () => {
		assert.throws(() => evaluator.evaluate("undefinedVar"), { message: "undefinedVar is not defined" });
		assert.throws(() => evaluator.evaluate("undefinedVar.property"), { message: "undefinedVar is not defined" });
	});
});

describe("Complex Expressions", () => {
	test("should handle complex nested expressions", () => {
		assert.equal(evaluator.evaluate("((1 + 2) * (3 + 4)) / ((5 - 2) + (6 - 4))"), 4.2);
		assert.deepEqual(
			evaluator.evaluate("[1, 2, 3].map(x => x * 2).filter(x => x > 2).reduce((a, b) => a + b, 0)"),
			10
		);
		const arr = [1, 2, 3].map((x) => x * 2);
		const evaluator2 = new Evaluator({ arr });
		assert.equal(evaluator2.evaluate("Math.max(arr[0], arr[1], arr[2])"), 6);
	});
});

describe("Security and Restrictions", () => {
	describe("Blocked Mutable Methods", () => {
		test("should block mutable array methods", () => {
			assert.throws(() => evaluator.evaluate("[1, 2].push(3)"), { message: "Mutable method is not allowed" });
			assert.throws(() => evaluator.evaluate("[1, 2].pop()"), { message: "Mutable method is not allowed" });
			assert.throws(() => evaluator.evaluate("Array.prototype.splice.call([1,2,3], 1, 1)"), { message: "Mutable method is not allowed" });
		});

		test("should block mutable object methods", () => {
			assert.throws(() => evaluator.evaluate("Object.assign({a:1}, {b:2})"), { message: "Mutable method is not allowed" });
		});
	});

	describe("Blocked Constructs", () => {
		test("should block eval", () => {
			assert.throws(() => evaluator.evaluate('eval("foo")'), { message: "eval is not defined" });
		});

		test("should block Function constructor", () => {
			assert.throws(() => evaluator.evaluate('new Function("alert(123)")'), { message: "Cannot use new with Function constructor" });
			assert.throws(() => evaluator.evaluate('Function("alert(123)")'), { message: "Function constructor is not allowed" });
		});

		test("should block this keyword", () => {
			assert.throws(() => evaluator.evaluate("this"), { message: "'this' keyword is not allowed" });
		});

		test("should block delete operator", () => {
			const evaluator = new Evaluator({ obj: { a: 1 } });
			assert.throws(() => evaluator.evaluate("delete obj.a"), { message: "Delete operator is not allow" });
		});

		test("should block unsupported syntax", () => {
			assert.throws(() => evaluator.evaluate("with (obj) { foo }"), { message: "'with (obj) { foo }' is not a valid syntax" });
		});

		test("should block setTimeout with string", () => {
			assert.throws(() => evaluator.evaluate("setTimeout('alert(\"Hi\")', 1000 )"), { message: "setTimeout is not defined" });
		});
	});
});

describe("Error Handling", () => {
	test("should handle division by zero", () => {
		assert.equal(evaluator.evaluate("5 / 0"), Infinity);
	});

	test("should throw on syntax errors", () => {
		assert.throws(() => evaluator.evaluate("a = (5 + 3"), /Unexpected token/);
		assert.throws(() => evaluator.evaluate("5 +"), /Unexpected token/);
	});

	test("should throw on null/undefined property access", () => {
		{
			const evaluator = new Evaluator({ foo: null });
			assert.throws(() => evaluator.evaluate("foo.bar"), { message: "Cannot read property 'bar' of null" });
		}

		{
			const evaluator = new Evaluator({ foo: undefined });
			assert.throws(() => evaluator.evaluate("foo.bar"), { message: "Cannot read property 'bar' of undefined" });
		}
	});

	test("should throw on calling non-function", () => {
		const evaluator = new Evaluator({ foo: {} });
		assert.throws(() => evaluator.evaluate("foo.undefinedProperty()"), { message: "foo.undefinedProperty is not a function" });
		assert.throws(() => evaluator.evaluate('foo["undefinedProperty"]()'), { message: 'foo["undefinedProperty"] is not a function' });
		assert.throws(() => evaluator.evaluate("foo[1]()"), { message: "foo[1] is not a function" });
		assert.throws(() => evaluator.evaluate("foo[[1,2,3]]()"), { message: "foo[[1,2,3]] is not a function" });
		assert.throws(() => evaluator.evaluate("foo[{}]()"), { message: "foo[{}] is not a function" });
	});
});

describe("getNodeString", () => {
	describe("Identifier", () => {
		test("should return correct string for Identifier", () => {
			const node = { type: "Identifier", name: "myVar" };
			assert.equal(getNodeString(node), "myVar");
		});
	});

	describe("Literal", () => {
		test("should return correct string for Literal", () => {
			const node = { type: "Literal", value: 123, raw: "123" };
			assert.equal(getNodeString(node), "123");
		});
	});

	describe("ArrayExpression", () => {
		test("should return correct string for ArrayExpression", () => {
			const node = {
				type: "ArrayExpression",
				elements: [
					{ type: "Literal", value: 1, raw: "1" },
					{ type: "Literal", value: 2, raw: "2" },
					{ type: "Literal", value: 3, raw: "3" },
				],
			};
			assert.equal(getNodeString(node), "[1,2,3]");
		});
	});

	describe("ObjectExpression", () => {
		test("should return string for empty object", () => {
			const node = {
				type: "ObjectExpression",
				properties: [],
			};
			assert.equal(getNodeString(node), "{}");
		});

		test("should return intermediate value string for non-empty object", () => {
			const node = {
				type: "ObjectExpression",
				properties: [
					{
						type: "Property",
						key: { type: "Identifier", name: "a" },
						value: { type: "Literal", value: 1, raw: "1" },
						computed: false,
					},
					{
						type: "Property",
						key: { type: "Identifier", name: "b" },
						value: { type: "Literal", value: 2, raw: "2" },
						computed: false,
					},
				],
			};
			assert.equal(getNodeString(node), "{(intermediate value)}");
		});

		test("should handle computed properties", () => {
			const node = {
				type: "ObjectExpression",
				properties: [
					{
						type: "Property",
						key: { type: "Identifier", name: "key" },
						value: { type: "Literal", value: 42, raw: "42" },
						computed: true,
					},
				],
			};
			assert.equal(getNodeString(node), "{(intermediate value)}");
		});
	});

	describe("MemberExpression", () => {
		test("should handle simple member expression", () => {
			const node = {
				type: "MemberExpression",
				object: { type: "Identifier", name: "obj" },
				property: { type: "Identifier", name: "property" },
				computed: false,
			};
			assert.equal(getNodeString(node), "obj.property");
		});

		test("should handle chained member expressions", () => {
			const node = {
				type: "MemberExpression",
				object: {
					type: "MemberExpression",
					object: {
						type: "MemberExpression",
						object: { type: "Identifier", name: "obj" },
						property: { type: "Identifier", name: "foo" },
						computed: false,
					},
					property: { type: "Identifier", name: "bar" },
					computed: false,
				},
				property: { type: "Identifier", name: "baz" },
				computed: false,
			};
			assert.equal(getNodeString(node), "obj.foo.bar.baz");
		});

		test("should handle computed member expression with literal", () => {
			const node = {
				type: "MemberExpression",
				object: { type: "Identifier", name: "obj" },
				property: { type: "Literal", value: "property", raw: '"property"' },
				computed: true,
			};
			assert.equal(getNodeString(node), 'obj["property"]');
		});

		test("should handle computed member expression with identifier", () => {
			const node = {
				type: "MemberExpression",
				object: { type: "Identifier", name: "obj" },
				property: { type: "Identifier", name: "key" },
				computed: true,
			};
			assert.equal(getNodeString(node), "obj[key]");
		});

		test("should handle array access", () => {
			const node = {
				type: "MemberExpression",
				object: {
					type: "MemberExpression",
					object: { type: "Identifier", name: "obj" },
					property: { type: "Identifier", name: "arr" },
					computed: false,
				},
				property: { type: "Literal", value: 0, raw: "0" },
				computed: true,
			};
			assert.equal(getNodeString(node), "obj.arr[0]");
		});

		test("should handle mixed computed and non-computed properties", () => {
			const node = {
				type: "MemberExpression",
				object: {
					type: "MemberExpression",
					object: {
						type: "MemberExpression",
						object: { type: "Identifier", name: "obj" },
						property: { type: "Identifier", name: "foo" },
						computed: false,
					},
					property: { type: "Literal", value: "bar", raw: '"bar"' },
					computed: true,
				},
				property: { type: "Identifier", name: "baz" },
				computed: false,
			};
			assert.equal(getNodeString(node), 'obj.foo["bar"].baz');
		});
	});
});
