# ecma-evaluator

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/ecma-evaluator.svg)](https://badge.fury.io/js/ecma-evaluator)

A tiny, fast, and secure JavaScript expression evaluator for safe evaluation of user-provided expressions in a sandboxed environment.

## Features

- 🚀 **Fast**: Built on top of [acorn](https://github.com/acornjs/acorn) parser for optimal performance
- 🔒 **Secure**: Sandboxed execution prevents access to dangerous APIs like `eval()` and blocks mutable methods
- 🎯 **Comprehensive**: Supports most JavaScript expressions including:
  - Arithmetic, logical, and comparison operations
  - Arrow functions and function calls
  - Array and object operations
  - Template literals
  - Optional chaining (`?.`)
  - Nullish coalescing (`??`)
  - Ternary operators
  - Math, String, Array, Object, Date, RegExp, JSON, and more
- 📦 **Small**: Minimal footprint with only one dependency
- 🌐 **Universal**: Works with both CommonJS and ES Modules
- 💪 **Type-safe**: Written with TypeScript declarations

## Installation

```bash
npm install ecma-evaluator
```

## Usage

### ES Module

```js
import { evaluatorExpression, evaluatorTemplate } from "ecma-evaluator";
```

### CommonJS

```js
const { evaluatorExpression, evaluatorTemplate } = require("ecma-evaluator");
```

### TypeScript

```typescript
import { evaluatorExpression, evaluatorTemplate, Evaluator } from "ecma-evaluator";

const result: number = evaluatorExpression<number>("1 + 2");
const text: string = evaluatorTemplate("Hello ${{ name }}!", { name: "World" });
```

## API

### `evaluatorExpression(expression, context?)`

Evaluates a JavaScript expression with an optional context.

**Parameters:**
- `expression` (string): The JavaScript expression to evaluate
- `context` (object, optional): Variables to make available in the expression

**Returns:** The result of evaluating the expression

**Examples:**

```js
import { evaluatorExpression } from "ecma-evaluator";

// Basic arithmetic
evaluatorExpression("1 + 2"); // 3
evaluatorExpression("10 - 3"); // 7
evaluatorExpression("2 * 3"); // 6
evaluatorExpression("8 / 2"); // 4

// With context
const context = { a: 1, b: 2, c: 3 };
evaluatorExpression("a + b * c", context); // 7
evaluatorExpression("a > b", context); // false

// Array operations
evaluatorExpression("array.map(v => v * 2)", { array: [1, 2, 3] }); // [2, 4, 6]
evaluatorExpression("array.filter(v => v > 2)", { array: [1, 2, 3, 4] }); // [3, 4]
evaluatorExpression("array.reduce((a, b) => a + b, 0)", { array: [1, 2, 3] }); // 6

// Math operations
evaluatorExpression("Math.max(1, 2, 3)"); // 3
evaluatorExpression("Math.sqrt(16)"); // 4
evaluatorExpression("Math.PI"); // 3.141592653589793

// String operations
evaluatorExpression("text.toUpperCase()", { text: "hello" }); // "HELLO"
evaluatorExpression("text.substring(0, 5)", { text: "hello world" }); // "hello"

// Ternary operator
evaluatorExpression('score >= 60 ? "Pass" : "Fail"', { score: 75 }); // "Pass"

// Optional chaining and nullish coalescing
evaluatorExpression("obj?.prop?.value ?? 'default'", { obj: { prop: { value: 42 } } }); // 42
evaluatorExpression("obj?.prop?.value ?? 'default'", { obj: null }); // "default"
```

### `evaluatorTemplate(template, context?)`

Evaluates a template string by replacing `${{ expression }}` patterns with their evaluated values.

**Parameters:**
- `template` (string): The template string containing `${{ expression }}` patterns
- `context` (object, optional): Variables to use in expressions

**Returns:** The template with all expressions evaluated and replaced

**Examples:**

```js
import { evaluatorTemplate } from "ecma-evaluator";

// Basic template
evaluatorTemplate("Hello, ${{ name }}!", { name: "World" }); 
// "Hello, World!"

// Multiple expressions
evaluatorTemplate("${{ a }} + ${{ b }} = ${{ a + b }}", { a: 10, b: 20 }); 
// "10 + 20 = 30"

// Complex expressions
evaluatorTemplate("Sum: ${{ [1, 2, 3].reduce((a, b) => a + b, 0) }}"); 
// "Sum: 6"

// Date operations
evaluatorTemplate("Today is ${{ new Date().toLocaleDateString() }}"); 
// "Today is 11/17/2025"

// Template literals inside
evaluatorTemplate("${{ `Hello ${name}!` }}", { name: "World" }); 
// "Hello World!"

// JSON operations
evaluatorTemplate("${{ JSON.stringify({ x: 10, y: 20 }) }}"); 
// '{"x":10,"y":20}'

// Undefined variables are replaced with empty strings
evaluatorTemplate("Hello, ${{ name }}!", {}); 
// "Hello, !"
```

### `Evaluator` Class

For reusing the same context across multiple evaluations, you can use the `Evaluator` class directly.

```js
import { Evaluator } from "ecma-evaluator";

const evaluator = new Evaluator({ x: 10, y: 20 });

evaluator.evaluate("x + y"); // 30
evaluator.evaluate("x * y"); // 200
evaluator.evaluate("Math.sqrt(x * x + y * y)"); // 22.360679774997898
```

## Supported JavaScript Features

### Operators

- **Arithmetic**: `+`, `-`, `*`, `/`, `%`, `**`
- **Comparison**: `==`, `===`, `!=`, `!==`, `>`, `>=`, `<`, `<=`
- **Logical**: `&&`, `||`, `!`, `??` (nullish coalescing)
- **Bitwise**: `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`
- **Unary**: `+`, `-`, `!`, `~`, `typeof`, `void`
- **Ternary**: `condition ? true : false`

### Expressions

- **Literals**: Numbers, strings, booleans, `null`, `undefined`, arrays, objects, regular expressions
- **Template literals**: `` `Hello ${name}` ``
- **Arrow functions**: `(x, y) => x + y`
- **Member access**: `obj.prop`, `obj[prop]`, `obj?.prop` (optional chaining)
- **Function calls**: `Math.max(1, 2, 3)`, `arr.map(x => x * 2)`
- **Constructor calls**: `new Date()`, `new Array(1, 2, 3)`

### Built-in Objects and Functions

**Global Functions**: `parseInt`, `parseFloat`, `isNaN`, `isFinite`, `encodeURI`, `encodeURIComponent`, `decodeURI`, `decodeURIComponent`

**Objects**: `Math`, `JSON`, `Object`, `Array`, `String`, `Number`, `Boolean`, `Date`, `RegExp`, `Set`, `Map`, `WeakSet`, `WeakMap`, `Promise`

**Error Types**: `Error`, `TypeError`, `RangeError`, `ReferenceError`, `SyntaxError`, `URIError`, `EvalError`

**Typed Arrays**: `Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float32Array`, `Float64Array`, `BigInt64Array`, `BigUint64Array`

**Other**: `BigInt`, `Symbol`, `Infinity`, `NaN`

## Security

This library is designed for safe evaluation of user-provided expressions with the following security features:

- ✅ **No `eval()` or `Function()` constructor access**: Prevents arbitrary code execution
- ✅ **Sandboxed scope**: Only whitelisted global objects are accessible
- ✅ **Immutable by default**: Blocks mutable methods like `Array.push()`, `Object.assign()`, etc.
- ✅ **No `delete` operator**: Prevents property deletion
- ⚠️ **Infinite loops**: Long-running expressions are not automatically terminated

**Note**: While this library provides a safer environment than direct `eval()`, it should still be used with caution when evaluating untrusted user input. Consider implementing timeouts and resource limits in your application.

## Limitations

- **No variable assignment**: Expressions like `a = 5` are not supported
- **No statements**: Only expressions are supported (no `if`, `for`, `while`, etc.)
- **No spread operator**: `[...array]` and `{...object}` are not supported (use `.concat()` and `Object.assign()` alternatives)
- **No destructuring**: Array and object destructuring is not supported in arrow function parameters
- **No async/await**: Promises are supported, but `async`/`await` syntax is not

## Examples

### Form Validation

```js
import { evaluatorExpression } from "ecma-evaluator";

const rules = {
  age: "value >= 18 && value <= 100",
  email: "value.includes('@') && value.includes('.')",
  password: "value.length >= 8"
};

function validate(field, value) {
  return evaluatorExpression(rules[field], { value });
}

validate("age", 25); // true
validate("email", "user@example.com"); // true
validate("password", "secret"); // false
```

### Dynamic Filtering

```js
import { evaluatorExpression } from "ecma-evaluator";

const products = [
  { name: "Laptop", price: 1000, category: "Electronics" },
  { name: "Phone", price: 500, category: "Electronics" },
  { name: "Desk", price: 300, category: "Furniture" }
];

const filterExpression = "price < 600 && category === 'Electronics'";

const filtered = products.filter(product =>
  evaluatorExpression(filterExpression, product)
);
// [{ name: "Phone", price: 500, category: "Electronics" }]
```

### Dynamic Text Rendering

```js
import { evaluatorTemplate } from "ecma-evaluator";

const user = {
  name: "Alice",
  points: 1250,
  level: 5
};

const message = evaluatorTemplate(
  "Hello ${{ name }}! You are level ${{ level }} with ${{ points }} points. ${{ points >= 1000 ? 'You are awesome!' : 'Keep going!' }}",
  user
);
// "Hello Alice! You are level 5 with 1250 points. You are awesome!"
```

## License

The [Anti 996 License](LICENSE)
