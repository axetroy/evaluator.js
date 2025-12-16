# jsoncst

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/jsoncst.svg)](https://badge.fury.io/js/jsoncst)

A utility to patch the JSON string and preserve the original formatting, including comments and whitespace.

## Features

-   ✨ **Secure by design** - Sandboxed execution environment that blocks mutable operations and prevents side effects
-   🚀 **Fast & lightweight** - Minimal dependencies, uses the efficient `acorn` parser
-   📦 **Zero configuration** - Works out of the box with sensible defaults
-   🎯 **Rich feature set** - Supports most JavaScript expressions including arithmetic, logical operations, functions, and more
-   🔒 **No eval()** - Does not use `eval()` or `Function()` constructor
-   💪 **TypeScript support** - Includes TypeScript type definitions
-   📝 **Template strings** - Evaluate expressions within template strings using `{{ }}` syntax

## Installation

```bash
npm install jsoncst
```

## Quick Start

```js
import { replace } from "jsoncst";

const json = '{"name": "Alice", "age": 30}';
const result = replace(json, [
  { path: "age", value: "31" }
]);
console.log(result); // {"name": "Alice", "age": 31}
```

## Usage Examples

### Basic Value Replacement

Replace a simple value in a JSON object:

```js
const source = '{"a": 1, "b": true}';
const result = replace(source, [{ path: "a", value: "42" }]);
// Result: {"a": 42, "b": true}
```

### Array Element Replacement

Replace elements in arrays using bracket notation:

```js
const source = '{"arr": [1, 2, 3]}';
const result = replace(source, [{ path: "arr[1]", value: "99" }]);
// Result: {"arr": [1, 99, 3]}
```

### Nested Object Updates

Replace values in deeply nested objects using dot notation:

```js
const source = '{"a": {"b": {"c": 1}}}';
const result = replace(source, [{ path: "a.b.c", value: "123" }]);
// Result: {"a": {"b": {"c": 123}}}
```

### Multiple Patches

Apply multiple patches in a single operation:

```js
const source = '{"x": 1, "y": 2, "arr": [3, 4]}';
const result = replace(source, [
  { path: "x", value: "10" },
  { path: "arr[0]", value: "30" }
]);
// Result: {"x": 10, "y": 2, "arr": [30, 4]}
```

### JSON Pointer Format

Use JSON Pointer (RFC 6901) format for path specification:

```js
const source = '{"a": {"b": [1, 2, 3]}}';
const result = replace(source, [{ path: "/a/b/2", value: "99" }]);
// Result: {"a": {"b": [1, 2, 99]}}
```

### Preserving Formatting

The library preserves the original formatting, including whitespace and comments:

```js
const source = `{
  // This is a comment
  "key": "value" /* inline comment */
}`;
const result = replace(source, [{ path: "key", value: '"newValue"' }]);
// Result:
// {
//   // This is a comment
//   "key": "newValue" /* inline comment */
// }
```

### String Values

When replacing with string values, make sure to include quotes:

```js
const source = '{"greeting": "hello"}';
const result = replace(source, [{ path: "greeting", value: '"hi"' }]);
// Result: {"greeting": "hi"}
```

## TypeScript Support

The package includes TypeScript type definitions:

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

The [Anti 996 License](LICENSE)
