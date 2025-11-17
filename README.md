# ecma-evaluator

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/ecma-evaluator.svg)](https://badge.fury.io/js/ecma-evaluator)

A tiny and fast JavaScript expression evaluator.

## Installation

```bash
npm install ecma-evaluator --save
```

## Usage

```js
import { evaluatorExpression, evaluatorTemplate } from "ecma-evaluator";

// Evaluate expression
const expr = "a + b * c";
const context = { a: 1, b: 2, c: 3 };
const result = evaluatorExpression(expr, context);
console.log(result); // Output: 7

// Evaluate template
const template = "The result of {{ a }} + {{ b }} * {{ c }} is {{ a + b * c }}.";
const templateResult = evaluatorTemplate(template, context);
console.log(templateResult); // Output: "The result of 1 + 2 * 3 is 7."
```

## License

The [Anti 996 License](LICENSE)
