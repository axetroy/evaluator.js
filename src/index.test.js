import test from "node:test";
import assert from "node:assert/strict";

import { replace } from "./index.js";

test("replace simple value", () => {
	const source = '{"a":1,"b":true}';

	const replaced = replace(source, [{ path: "a", value: "42" }]);

	assert.equal(replaced, '{"a":42,"b":true}');
});

test("replace array element", () => {
	const source = '{"arr":[1,2,3]}';

	const replaced = replace(source, [{ path: "arr[1]", value: "99" }]);

	assert.equal(replaced, '{"arr":[1,99,3]}');
});

test("replace nested object value", () => {
	const source = '{"a":{"b":{"c":1}}}';

	const replaced = replace(source, [{ path: "a.b.c", value: "123" }]);

	assert.equal(replaced, '{"a":{"b":{"c":123}}}');
});

test("replace multiple paths", () => {
	const source = '{"x":1,"y":2,"arr":[3,4]}';

	const replaced = replace(source, [
		{ path: "x", value: "10" },
		{ path: "arr[0]", value: "30" },
	]);

	assert.equal(replaced, '{"x":10,"y":2,"arr":[30,4]}');
});

test("replace using JSON pointer", () => {
	const source = '{"a":{"b":[1,2,3]}}';

	const replaced = replace(source, [{ path: "/a/b/2", value: "99" }]);

	assert.equal(replaced, '{"a":{"b":[1,2,99]}}');
});

test("replace using escaped JSON pointer", () => {
	const source = '{"a/b":{"c~d":5}}';

	const replaced = replace(source, [{ path: "/a~1b/c~0d", value: "42" }]);

	assert.equal(replaced, '{"a/b":{"c~d":42}}');
});

test("replace with string value", () => {
	const source = '{"greeting":"hello"}';

	const replaced = replace(source, [{ path: "greeting", value: '"hi"' }]);

	assert.equal(replaced, '{"greeting":"hi"}');
});

test("replace boolean value", () => {
	const source = '{"flag":false}';

	const replaced = replace(source, [{ path: "flag", value: "true" }]);

	assert.equal(replaced, '{"flag":true}');
});

test("replace null value", () => {
	const source = '{"data":null}';

	const replaced = replace(source, [{ path: "data", value: '"not null"' }]);

	assert.equal(replaced, '{"data":"not null"}');
});

test("replace entire object", () => {
	const source = '{"obj":{"a":1,"b":2}}';

	const replaced = replace(source, [{ path: "obj", value: '{"x":10,"y":20}' }]);

	assert.equal(replaced, '{"obj":{"x":10,"y":20}}');
});

test("replace entire array", () => {
	const source = '{"arr":[1,2,3]}';

	const replaced = replace(source, [{ path: "arr", value: "[10,20,30]" }]);

	assert.equal(replaced, '{"arr":[10,20,30]}');
});

test("replace with whitespace preservation", () => {
	const source = '{  "key"  :  1  }';

	const replaced = replace(source, [{ path: "key", value: "42" }]);

	assert.equal(replaced, '{  "key"  :  42  }');
});

test("replace with special characters in strings", () => {
	const source = '{"text":"Line1\\nLine2"}';

	const replaced = replace(source, [{ path: "text", value: '"NewLine1\\nNewLine2"' }]);

	assert.equal(replaced, '{"text":"NewLine1\\nNewLine2"}');
});

test("replace numeric keys in object", () => {
	const source = '{"1":"one","2":"two"}';

	const replaced = replace(source, [{ path: "2", value: '"TWO"' }]);

	assert.equal(replaced, '{"1":"one","2":"TWO"}');
});
test("replace with empty string", () => {
	const source = '{"message":"Hello, World!"}';

	const replaced = replace(source, [{ path: "message", value: '""' }]);

	assert.equal(replaced, '{"message":""}');
});

test("replace array with different length", () => {
	const source = '{"numbers":[1,2,3,4,5]}';

	const replaced = replace(source, [{ path: "numbers", value: "[10,20]" }]);

	assert.equal(replaced, '{"numbers":[10,20]}');
});

test("replace and keep formatting", () => {
	const source = `{
	"name": "Alice",
	"age": 		30,
	"isStudent": false
}`;

	const replaced = replace(source, [{ path: "age", value: "31" }]);

	const expected = `{
	"name": "Alice",
	"age": 		31,
	"isStudent": false
}`;

	assert.equal(replaced, expected);
});

test("replace non-existing path", () => {
	const source = '{"a":1,"b":2}';

	const replaced = replace(source, [{ path: "c", value: "3" }]);

	// Should remain unchanged
	assert.equal(replaced, '{"a":1,"b":2}');
});

test("replace with multiple patches", () => {
	const source = '{"a":1,"b":{"c":2,"d":[3,4,5]}}';

	const replaced = replace(source, [
		{
			path: "b.c",
			value: "20",
		},
		{ path: "b.d[1]", value: "40" },
	]);

	assert.equal(replaced, '{"a":1,"b":{"c":20,"d":[3,40,5]}}');
});

test("replace with comments preserved", () => {
	const source = `{
	// This is a comment
	"key": "value" /* inline comment */
}`;

	const replaced = replace(source, [{ path: "key", value: '"newValue"' }]);

	const expected = `{
	// This is a comment
	"key": "newValue" /* inline comment */
}`;

	assert.equal(replaced, expected);
});
