# ecma-evaluator

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/ecma-evaluator.svg)](https://badge.fury.io/js/ecma-evaluator)

A tiny, fast, and **secure** JavaScript expression evaluator for safely evaluating expressions and template strings in a sandboxed environment.

## Features

✨ **Secure by design** - Sandboxed execution environment that blocks mutable operations and prevents side effects
🚀 **Fast & lightweight** - Minimal dependencies, uses the efficient `acorn` parser
📦 **Zero configuration** - Works out of the box with sensible defaults
🎯 **Rich feature set** - Supports most JavaScript expressions including arithmetic, logical operations, functions, and more
🔒 **No eval()** - Does not use `eval()` or `Function()` constructor
💪 **TypeScript support** - Includes TypeScript type definitions
📝 **Template strings** - Evaluate expressions within template strings using `{{ }}` syntax

## Installation

```bash
npm install ecma-evaluator
```

## Quick Start

```js
import { evalExpression, evalTemplate } from "ecma-evaluator";

// Evaluate expression
const result = evalExpression("a + b * c", { a: 1, b: 2, c: 3 });
console.log(result); // Output: 7

// Evaluate template
const text = evalTemplate("Hello {{ name }}!", { name: "World" });
console.log(text); // Output: "Hello World!"
```

## API Reference

### `evalExpression(expression, context?)`

Evaluates a JavaScript expression with an optional context.

**Parameters:**

-   `expression` (string): The JavaScript expression to evaluate
-   `context` (object, optional): An object containing variables to use in the expression

**Returns:** The result of evaluating the expression

**Example:**

```js
import { evalExpression } from "ecma-evaluator";

// Basic arithmetic
evalExpression("2 + 3 * 4"); // 14

// With variables
evalExpression("x + y", { x: 10, y: 20 }); // 30

// Using built-in functions
evalExpression("Math.max(a, b, c)", { a: 5, b: 15, c: 10 }); // 15

// String operations
evalExpression("greeting + ', ' + name", {
	greeting: "Hello",
	name: "Alice",
}); // "Hello, Alice"

// Array methods
evalExpression("[1, 2, 3].map(x => x * 2)"); // [2, 4, 6]

// Conditional expressions
evalExpression("score >= 60 ? 'Pass' : 'Fail'", { score: 75 }); // "Pass"
```

### `evalTemplate(template, context?, templateParserOptions?)`

Evaluates a template string by replacing `{{ expression }}` patterns with their evaluated values.

**Parameters:**

-   `template` (string): The template string to evaluate
-   `context` (object, optional): An object containing variables to use in the template
-   `templateParserOptions` (object, optional): Options for the template parser

**Returns:** The evaluated template string

**Example:**

````js
import { evalTemplate } from "ecma-evaluator";

-   `template` (string): The template string containing `{{ expression }}` patterns
-   `context` (object, optional): An object containing variables to use in expressions

**Returns:** The template with all expressions evaluated and replaced (string)

**Example:**

```js
import { evalTemplate } from "ecma-evaluator";

// Basic variable replacement
evalTemplate("Hello, {{ name }}!", { name: "World" });
// Output: "Hello, World!"

// Multiple expressions
evalTemplate("{{ a }} + {{ b }} = {{ a + b }}", { a: 10, b: 20 });
// Output: "10 + 20 = 30"

// Complex expressions
evalTemplate("The sum is {{ [1, 2, 3].reduce((a, b) => a + b, 0) }}");
// Output: "The sum is 6"

// Template literals within expressions
evalTemplate("{{ `Hello ${name}, welcome!` }}", { name: "Alice" });
// Output: "Hello Alice, welcome!"

// Date formatting
evalTemplate("Today is {{ new Date().toLocaleDateString() }}");
// Output: "Today is 11/18/2025" (varies by locale)

// Conditional rendering
evalTemplate("Status: {{ isActive ? 'Active' : 'Inactive' }}", { isActive: true });
// Output: "Status: Active"

// Optional chaining
evalTemplate("Value: {{ obj?.prop?.value ?? 'N/A' }}", { obj: null });
// Output: "Value: N/A"
````

### Error Handling

When an undefined variable is referenced in a template, it's replaced with `"undefined"` instead of throwing an error:

```js
evalTemplate("Hello {{ name }}!", {}); // "Hello undefined!"
```

For other errors (syntax errors, type errors, etc.), an exception will be thrown:

```js
evalTemplate("{{ 1 + }}", {}); // Throws SyntaxError
evalTemplate("{{ obj.prop }}", { obj: null }); // Throws TypeError
```

## Supported JavaScript Features

### Operators

#### Arithmetic Operators

```js
evalExpression("10 + 5"); // 15 (addition)
evalExpression("10 - 5"); // 5 (subtraction)
evalExpression("10 * 5"); // 50 (multiplication)
evalExpression("10 / 5"); // 2 (division)
evalExpression("10 % 3"); // 1 (modulo)
evalExpression("2 ** 3"); // 8 (exponentiation)
```

#### Comparison Operators

```js
evalExpression("5 > 3"); // true
evalExpression("5 >= 5"); // true
evalExpression("5 < 3"); // false
evalExpression("5 <= 5"); // true
evalExpression("5 == '5'"); // true (loose equality)
evalExpression("5 === '5'"); // false (strict equality)
evalExpression("5 != '5'"); // false (loose inequality)
evalExpression("5 !== '5'"); // true (strict inequality)
```

#### Logical Operators

```js
evalExpression("true && false"); // false (AND)
evalExpression("true || false"); // true (OR)
evalExpression("null ?? 'default'"); // "default" (nullish coalescing)
evalExpression("!true"); // false (NOT)
```

#### Bitwise Operators

```js
evalExpression("5 & 3"); // 1 (AND)
evalExpression("5 | 3"); // 7 (OR)
evalExpression("5 ^ 3"); // 6 (XOR)
evalExpression("~5"); // -6 (NOT)
evalExpression("5 << 1"); // 10 (left shift)
evalExpression("5 >> 1"); // 2 (right shift)
evalExpression("5 >>> 1"); // 2 (unsigned right shift)
```

#### Unary Operators

```js
evalExpression("-5"); // -5 (negation)
evalExpression("+5"); // 5 (unary plus)
evalExpression("typeof 5"); // "number"
evalExpression("void 0"); // undefined
```

### Data Types

#### Literals

```js
evalExpression("42"); // Number
evalExpression("'hello'"); // String
evalExpression("true"); // Boolean
evalExpression("null"); // null
evalExpression("undefined"); // undefined
```

#### Arrays

```js
evalExpression("[1, 2, 3]"); // [1, 2, 3]
evalExpression("[1, 2, 3][1]"); // 2
evalExpression("[1, 2, 3].length"); // 3
evalExpression("[1, 2, 3].map(x => x * 2)"); // [2, 4, 6]
evalExpression("[1, 2, 3].filter(x => x > 1)"); // [2, 3]
evalExpression("[1, 2, 3].reduce((a, b) => a + b, 0)"); // 6
```

#### Objects

```js
evalExpression("{ a: 1, b: 2 }"); // { a: 1, b: 2 }
evalExpression("{ a: 1, b: 2 }.a"); // 1
evalExpression("{ a: 1, b: 2 }['b']"); // 2
```

#### Template Literals

```js
evalExpression("`Hello ${'World'}`"); // "Hello World"
evalExpression("`2 + 2 = ${2 + 2}`", {}); // "2 + 2 = 4"
evalExpression("`Hello ${name}`", { name: "Bob" }); // "Hello Bob"
```

### Functions

#### Arrow Functions

```js
evalExpression("((x) => x * 2)(5)"); // 10
evalExpression("[1, 2, 3].map(x => x * 2)"); // [2, 4, 6]
evalExpression("((a, b) => a + b)(3, 4)"); // 7
```

#### Built-in Objects and Functions

```js
// Math
evalExpression("Math.max(1, 2, 3)"); // 3
evalExpression("Math.min(1, 2, 3)"); // 1
evalExpression("Math.round(4.7)"); // 5
evalExpression("Math.floor(4.7)"); // 4
evalExpression("Math.ceil(4.3)"); // 5
evalExpression("Math.abs(-5)"); // 5
evalExpression("Math.sqrt(16)"); // 4

// String methods
evalExpression("'hello'.toUpperCase()"); // "HELLO"
evalExpression("'HELLO'.toLowerCase()"); // "hello"
evalExpression("'hello world'.split(' ')"); // ["hello", "world"]

// Array methods (non-mutating only)
evalExpression("[1,2,3].join(', ')"); // "1, 2, 3"
evalExpression("[1,2,3].slice(1)"); // [2, 3]
evalExpression("[1,2,3].concat([4,5])"); // [1, 2, 3, 4, 5]

// JSON
evalExpression("JSON.stringify({ a: 1 })"); // '{"a":1}'
evalExpression("JSON.parse('{\"a\":1}')"); // { a: 1 }

// Date
evalExpression("new Date(0).getTime()"); // 0
evalExpression("new Date().getFullYear()"); // current year

// Object methods
evalExpression("Object.keys({ a: 1, b: 2 })"); // ["a", "b"]
evalExpression("Object.values({ a: 1, b: 2 })"); // [1, 2]

// Number methods
evalExpression("Number.parseInt('42')"); // 42
evalExpression("Number.parseFloat('3.14')"); // 3.14
evalExpression("Number.isNaN(NaN)"); // true
evalExpression("Number.isFinite(42)"); // true

// Global functions
evalExpression("isNaN(NaN)"); // true
evalExpression("isFinite(Infinity)"); // false
evalExpression("parseInt('42')"); // 42
evalExpression("parseFloat('3.14')"); // 3.14
evalExpression("encodeURIComponent('hello world')"); // "hello%20world"
evalExpression("decodeURIComponent('hello%20world')"); // "hello world"
```

### Advanced Features

#### Conditional (Ternary) Operator

```js
evalExpression("5 > 3 ? 'yes' : 'no'"); // "yes"
evalExpression("age >= 18 ? 'adult' : 'minor'", { age: 20 }); // "adult"
```

#### Optional Chaining

```js
evalExpression("obj?.prop", { obj: null }); // undefined
evalExpression("obj?.prop?.value", { obj: {} }); // undefined
evalExpression("arr?.[0]", { arr: null }); // undefined
evalExpression("func?.()", { func: null }); // undefined
```

#### Member Access

```js
evalExpression("obj.prop", { obj: { prop: 42 } }); // 42
evalExpression("obj['prop']", { obj: { prop: 42 } }); // 42
evalExpression("arr[0]", { arr: [1, 2, 3] }); // 1
```

#### Constructor Expressions

```js
evalExpression("new Date(2024, 0, 1)"); // Date object
evalExpression("new Array(1, 2, 3)"); // [1, 2, 3]
evalExpression("new Set([1, 2, 2, 3])"); // Set {1, 2, 3}
evalExpression("new Map([['a', 1], ['b', 2]])"); // Map {"a" => 1, "b" => 2}
```

## Security Features

### Sandboxed Environment

`ecma-evaluator` runs expressions in a sandboxed environment with several security features:

1. **No access to `eval()` or `Function()` constructor** - Prevents dynamic code execution
2. **Blocked mutable methods** - Methods that mutate objects are blocked to prevent side effects:

    - Array: `push`, `pop`, `shift`, `unshift`, `splice`, `reverse`, `sort`, `fill`, `copyWithin`
    - Object: `freeze`, `defineProperty`, `defineProperties`, `preventExtensions`, `setPrototypeOf`, `assign`
    - Set/Map: `add`, `set`, `delete`, `clear`
    - Date: All setter methods (`setDate`, `setFullYear`, etc.)
    - TypedArray: `set`, `fill`, `copyWithin`, `reverse`, `sort`

3. **No `delete` operator** - The `delete` operator is blocked as it's a mutating operation
4. **Limited global scope** - Only safe built-in objects are available (Math, JSON, Array, Object, etc.)
5. **No file system or network access** - Cannot access Node.js APIs or perform I/O operations
6. **No access to process or global variables** - Cannot access `process`, `global`, `require`, etc.

### Safe Built-in Objects

The following built-in objects are available in the sandboxed environment:

-   **Numbers & Math**: `Number`, `Math`, `Infinity`, `NaN`, `isNaN`, `isFinite`, `parseInt`, `parseFloat`
-   **Strings**: `String`, `encodeURI`, `encodeURIComponent`, `decodeURI`, `decodeURIComponent`
-   **Data Structures**: `Array`, `Object`, `Set`, `WeakSet`, `Map`, `WeakMap`
-   **Date & Time**: `Date`
-   **JSON**: `JSON`
-   **Types**: `Boolean`, `Symbol`, `BigInt`, `RegExp`
-   **TypedArrays**: `Int8Array`, `Uint8Array`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float32Array`, `Float64Array`, `BigInt64Array`, `BigUint64Array`
-   **Errors**: `Error`, `EvalError`, `RangeError`, `ReferenceError`, `SyntaxError`, `TypeError`, `URIError`
-   **Promises**: `Promise`

### Error Prevention

```js
// ❌ These will throw errors:
evalExpression("arr.push(1)", { arr: [1, 2, 3] });
// Error: Cannot call mutable prototype method: push

evalExpression("new Function('return 1')");
// Error: Cannot use new with Function constructor

evalExpression("delete obj.prop", { obj: { prop: 1 } });
// Error: Delete operator is not allow
```

## Use Cases

### Configuration & Rules Engine

```js
// Evaluate business rules
const rule = "age >= 18 && country === 'US'";
const isEligible = evalExpression(rule, { age: 25, country: "US" }); // true

// Dynamic pricing
const priceFormula = "basePrice * (1 - discount / 100)";
const finalPrice = evalExpression(priceFormula, {
	basePrice: 100,
	discount: 20,
}); // 80
```

### Template Rendering

```js
// Email templates
const emailTemplate = `
Hello {{ user.name }},

Your order #{{ order.id }} has been {{ order.status }}.
Total: ${{ order.total.toFixed(2) }}

Thank you for shopping with us!
`;

const email = evalTemplate(emailTemplate, {
  user: { name: "John Doe" },
  order: { id: 12345, status: "shipped", total: 99.99 }
});

// Dynamic content
const greeting = evalTemplate(
  "Good {{ hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening' }}, {{ name }}!",
  { hour: new Date().getHours(), name: "Alice" }
);
```

### Data Transformation

```js
// Transform API responses
const transform = "data.items.filter(x => x.active).map(x => x.name)";
const result = evalExpression(transform, {
	data: {
		items: [
			{ name: "Item 1", active: true },
			{ name: "Item 2", active: false },
			{ name: "Item 3", active: true },
		],
	},
}); // ["Item 1", "Item 3"]
```

### Form Validation

```js
// Conditional validation
const validationRule = "email.includes('@') && password.length >= 8";
const isValid = evalExpression(validationRule, {
	email: "user@example.com",
	password: "secretpassword",
}); // true
```

## Limitations

1. **No statements** - Only expressions are supported, not statements (no `if`, `for`, `while`, etc.)
2. **No variable assignment** - Cannot use assignment operators (`=`, `+=`, etc.)
3. **No mutable operations** - Mutable array/object methods are blocked
4. **No async operations** - Promises work but cannot use `await`
5. **No function declarations** - Only arrow functions in expressions are supported
6. **Limited error recovery** - Syntax errors will throw immediately
7. **No imports/requires** - Cannot import external modules

## Advanced Usage

### Custom Evaluator Instance

```js
import { Evaluator } from "ecma-evaluator";

// Create a reusable evaluator with fixed context
const evaluator = new Evaluator({ x: 10, y: 20 });

// Evaluate multiple expressions with the same context
console.log(evaluator.evaluate("x + y")); // 30
console.log(evaluator.evaluate("x * y")); // 200
console.log(evaluator.evaluate("Math.max(x, y)")); // 20
```

### Custom Template Parser

```js
import { TemplateParser } from "ecma-evaluator";

// Create a parser with custom delimiters
const parser = new TemplateParser({
	expressionStart: "${",
	expressionEnd: "}",
	preserveWhitespace: false,
});

const tokens = parser.parse("Hello ${ name }!");
// [
//   { type: "text", value: "Hello " },
//   { type: "expression", value: "name" },
//   { type: "text", value: "!" }
// ]
```

## Performance Tips

1. **Reuse evaluator instances** when evaluating multiple expressions with the same context
2. **Avoid complex nested expressions** - Break them into smaller parts if possible
3. **Cache parsed templates** if you're rendering the same template multiple times
4. **Use simple variable access** instead of complex property chains when possible

## TypeScript Support

The package includes TypeScript type definitions:

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

The [Anti 996 License](LICENSE)
