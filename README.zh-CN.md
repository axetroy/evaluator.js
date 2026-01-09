# ecma-evaluator

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/zh_CN)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/ecma-evaluator.svg)](https://badge.fury.io/js/ecma-evaluator)

一个小巧、快速且**安全**的 JavaScript 表达式求值器，用于在沙箱环境中安全地执行表达式和模板字符串。

[English](./README.md) | 简体中文

## 特性

-   ✨ **安全设计** - 沙箱化；阻止变更/副作用
-   🚀 **快速且轻量** - 最小化依赖，使用高效的 `acorn` 解析器
-   📦 **零配置** - 开箱即用，具有合理的默认设置
-   🎯 **功能丰富** - 支持大多数 JS 表达式/函数
-   🔒 **不使用 eval()** - 不使用 `eval()` 或 `Function()` 构造函数
-   💪 **TypeScript 支持** - 包含 TypeScript 类型定义
-   📝 **模板字符串** - 使用 `{{ }}` 语法在模板字符串中执行表达式

## 安装

```bash
npm install ecma-evaluator
```

## 快速开始

```js
import { evalExpression, evalTemplate } from "ecma-evaluator";

// 执行表达式
const result = evalExpression("a + b * c", { a: 1, b: 2, c: 3 });
console.log(result); // 输出: 7

// 执行模板
const text = evalTemplate("Hello {{ name }}!", { name: "World" });
console.log(text); // 输出: "Hello World!"
```

## API 参考

### `evalExpression(expression, context?)`

使用可选的上下文执行 JavaScript 表达式。

**参数：**

-   `expression` (string): 要执行的 JavaScript 表达式
-   `context` (object, 可选): 包含表达式中使用的变量的对象

**返回值：** 执行表达式的结果

**示例：**

```js
import { evalExpression } from "ecma-evaluator";

// 基础算术
evalExpression("2 + 3 * 4"); // 14

// 使用变量
evalExpression("x + y", { x: 10, y: 20 }); // 30

// 使用内置函数
evalExpression("Math.max(a, b, c)", { a: 5, b: 15, c: 10 }); // 15

// 字符串操作
evalExpression("greeting + ', ' + name", {
	greeting: "Hello",
	name: "Alice",
}); // "Hello, Alice"

// 数组方法
evalExpression("[1, 2, 3].map(x => x * 2)"); // [2, 4, 6]

// 条件表达式
evalExpression("score >= 60 ? 'Pass' : 'Fail'", { score: 75 }); // "Pass"
```

### `evalTemplate(template, context?, templateParserOptions?)`

通过将 `{{ expression }}` 模式替换为其执行后的值来执行模板字符串。

**参数：**

-   `template` (string): 要执行的模板字符串
-   `context` (object, 可选): 包含模板中使用的变量的对象
-   `templateParserOptions` (object, 可选): 模板解析器的选项

**返回值：** 执行后的模板字符串

**示例：**

```js
import { evalTemplate } from "ecma-evaluator";

// 基础变量替换
evalTemplate("Hello, {{ name }}!", { name: "World" });
// 输出: "Hello, World!"

// 多个表达式
evalTemplate("{{ a }} + {{ b }} = {{ a + b }}", { a: 10, b: 20 });
// 输出: "10 + 20 = 30"

// 复杂表达式
evalTemplate("The sum is {{ [1, 2, 3].reduce((a, b) => a + b, 0) }}");
// 输出: "The sum is 6"

// 表达式内的模板字面量
evalTemplate("{{ `Hello ${name}, welcome!` }}", { name: "Alice" });
// 输出: "Hello Alice, welcome!"

// 日期格式化
evalTemplate("Today is {{ new Date().toLocaleDateString() }}");
// 输出: "Today is 11/18/2025" (根据语言环境而异)

// 条件渲染
evalTemplate("Status: {{ isActive ? 'Active' : 'Inactive' }}", { isActive: true });
// 输出: "Status: Active"

// 可选链
evalTemplate("Value: {{ obj?.prop?.value ?? 'N/A' }}", { obj: null });
// 输出: "Value: N/A"
```

### 错误处理

当在模板中引用未定义的变量时，它将被替换为 `"undefined"` 而不是抛出错误：

```js
evalTemplate("Hello {{ name }}!", {}); // "Hello undefined!"
```

对于其他错误（语法错误、类型错误等），将抛出异常：

```js
evalTemplate("{{ 1 + }}", {}); // 抛出 SyntaxError
evalTemplate("{{ obj.prop }}", { obj: null }); // 抛出 TypeError
```

## 支持的 JavaScript 特性

### 运算符

#### 算术运算符

```js
evalExpression("10 + 5"); // 15 (加法)
evalExpression("10 - 5"); // 5 (减法)
evalExpression("10 * 5"); // 50 (乘法)
evalExpression("10 / 5"); // 2 (除法)
evalExpression("10 % 3"); // 1 (取模)
evalExpression("2 ** 3"); // 8 (幂运算)
```

#### 比较运算符

```js
evalExpression("5 > 3"); // true
evalExpression("5 >= 5"); // true
evalExpression("5 < 3"); // false
evalExpression("5 <= 5"); // true
evalExpression("5 == '5'"); // true (宽松相等)
evalExpression("5 === '5'"); // false (严格相等)
evalExpression("5 != '5'"); // false (宽松不等)
evalExpression("5 !== '5'"); // true (严格不等)
```

#### 逻辑运算符

```js
evalExpression("true && false"); // false (AND)
evalExpression("true || false"); // true (OR)
evalExpression("null ?? 'default'"); // "default" (空值合并)
evalExpression("!true"); // false (NOT)
```

#### 位运算符

```js
evalExpression("5 & 3"); // 1 (AND)
evalExpression("5 | 3"); // 7 (OR)
evalExpression("5 ^ 3"); // 6 (XOR)
evalExpression("~5"); // -6 (NOT)
evalExpression("5 << 1"); // 10 (左移)
evalExpression("5 >> 1"); // 2 (右移)
evalExpression("5 >>> 1"); // 2 (无符号右移)
```

#### 一元运算符

```js
evalExpression("-5"); // -5 (取负)
evalExpression("+5"); // 5 (一元加)
evalExpression("typeof 5"); // "number"
evalExpression("void 0"); // undefined
```

### 数据类型

#### 字面量

```js
evalExpression("42"); // Number
evalExpression("'hello'"); // String
evalExpression("true"); // Boolean
evalExpression("null"); // null
evalExpression("undefined"); // undefined
```

#### 数组

```js
evalExpression("[1, 2, 3]"); // [1, 2, 3]
evalExpression("[1, 2, 3][1]"); // 2
evalExpression("[1, 2, 3].length"); // 3
evalExpression("[1, 2, 3].map(x => x * 2)"); // [2, 4, 6]
evalExpression("[1, 2, 3].filter(x => x > 1)"); // [2, 3]
evalExpression("[1, 2, 3].reduce((a, b) => a + b, 0)"); // 6
```

#### 对象

```js
evalExpression("{ a: 1, b: 2 }"); // { a: 1, b: 2 }
evalExpression("({ a: 1, b: 2 }).a"); // 1
evalExpression("({ a: 1, b: 2 })['b']"); // 2
```

#### 模板字面量

```js
evalExpression("`Hello ${'World'}`"); // "Hello World"
evalExpression("`2 + 2 = ${2 + 2}`", {}); // "2 + 2 = 4"
evalExpression("`Hello ${name}`", { name: "Bob" }); // "Hello Bob"
```

### 函数

#### 箭头函数

```js
evalExpression("((x) => x * 2)(5)"); // 10
evalExpression("[1, 2, 3].map(x => x * 2)"); // [2, 4, 6]
evalExpression("((a, b) => a + b)(3, 4)"); // 7
```

#### 内置对象和函数

```js
// Math
evalExpression("Math.max(1, 2, 3)"); // 3
evalExpression("Math.min(1, 2, 3)"); // 1
evalExpression("Math.round(4.7)"); // 5
evalExpression("Math.floor(4.7)"); // 4
evalExpression("Math.ceil(4.3)"); // 5
evalExpression("Math.abs(-5)"); // 5
evalExpression("Math.sqrt(16)"); // 4

// 字符串方法
evalExpression("'hello'.toUpperCase()"); // "HELLO"
evalExpression("'HELLO'.toLowerCase()"); // "hello"
evalExpression("'hello world'.split(' ')"); // ["hello", "world"]

// 数组方法（仅非变更方法）
evalExpression("[1,2,3].join(', ')"); // "1, 2, 3"
evalExpression("[1,2,3].slice(1)"); // [2, 3]
evalExpression("[1,2,3].concat([4,5])"); // [1, 2, 3, 4, 5]

// JSON
evalExpression("JSON.stringify({ a: 1 })"); // '{"a":1}'
evalExpression("JSON.parse('{\"a\":1}')"); // { a: 1 }

// Date
evalExpression("new Date(0).getTime()"); // 0
evalExpression("new Date().getFullYear()"); // 当前年份

// Object 方法
evalExpression("Object.keys({ a: 1, b: 2 })"); // ["a", "b"]
evalExpression("Object.values({ a: 1, b: 2 })"); // [1, 2]

// Number 方法
evalExpression("Number.parseInt('42')"); // 42
evalExpression("Number.parseFloat('3.14')"); // 3.14
evalExpression("Number.isNaN(NaN)"); // true
evalExpression("Number.isFinite(42)"); // true

// 全局函数
evalExpression("isNaN(NaN)"); // true
evalExpression("isFinite(Infinity)"); // false
evalExpression("parseInt('42')"); // 42
evalExpression("parseFloat('3.14')"); // 3.14
evalExpression("encodeURIComponent('hello world')"); // "hello%20world"
evalExpression("decodeURIComponent('hello%20world')"); // "hello world"
```

### 高级特性

#### 条件（三元）运算符

```js
evalExpression("5 > 3 ? 'yes' : 'no'"); // "yes"
evalExpression("age >= 18 ? 'adult' : 'minor'", { age: 20 }); // "adult"
```

#### 可选链

```js
evalExpression("obj?.prop", { obj: null }); // undefined
evalExpression("obj?.prop?.value", { obj: {} }); // undefined
evalExpression("arr?.[0]", { arr: null }); // undefined
evalExpression("func?.()", { func: null }); // undefined
```

#### 成员访问

```js
evalExpression("obj.prop", { obj: { prop: 42 } }); // 42
evalExpression("obj['prop']", { obj: { prop: 42 } }); // 42
evalExpression("arr[0]", { arr: [1, 2, 3] }); // 1
```

#### 构造函数表达式

```js
evalExpression("new Date(2024, 0, 1)"); // Date 对象
evalExpression("new Array(1, 2, 3)"); // [1, 2, 3]
evalExpression("new Set([1, 2, 2, 3])"); // Set {1, 2, 3}
evalExpression("new Map([['a', 1], ['b', 2]])"); // Map {"a" => 1, "b" => 2}
```

## 安全特性

### 沙箱环境

`ecma-evaluator` 在具有多项安全特性的沙箱环境中运行表达式：

1. **无法访问 `eval()` 或 `Function()` 构造函数** - 防止动态代码执行
2. **阻止可变方法** - 阻止变更对象的方法以防止副作用：

    - Array: `push`, `pop`, `shift`, `unshift`, `splice`, `reverse`, `sort`, `fill`, `copyWithin`
    - Object: `freeze`, `defineProperty`, `defineProperties`, `preventExtensions`, `setPrototypeOf`, `assign`
    - Set/Map: `add`, `set`, `delete`, `clear`
    - Date: 所有 setter 方法 (`setDate`, `setFullYear`, 等)
    - TypedArray: `set`, `fill`, `copyWithin`, `reverse`, `sort`

3. **无 `delete` 运算符** - `delete` 运算符被阻止，因为它是一个变更操作
4. **有限的全局作用域** - 只有安全的内置对象可用（Math、JSON、Array、Object 等）
5. **无文件系统或网络访问** - 无法访问 Node.js API 或执行 I/O 操作
6. **无法访问进程或全局变量** - 无法访问 `process`、`global`、`require` 等

### 安全的内置对象

以下内置对象在沙箱环境中可用：

-   **数字与数学**: `Number`, `Math`, `Infinity`, `NaN`, `isNaN`, `isFinite`, `parseInt`, `parseFloat`
-   **字符串**: `String`, `encodeURI`, `encodeURIComponent`, `decodeURI`, `decodeURIComponent`
-   **数据结构**: `Array`, `Object`, `Set`, `WeakSet`, `Map`, `WeakMap`
-   **日期与时间**: `Date`
-   **JSON**: `JSON`
-   **类型**: `Boolean`, `Symbol`, `BigInt`, `RegExp`
-   **类型化数组**: `Int8Array`, `Uint8Array`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float32Array`, `Float64Array`, `BigInt64Array`, `BigUint64Array`
-   **错误**: `Error`, `EvalError`, `RangeError`, `ReferenceError`, `SyntaxError`, `TypeError`, `URIError`
-   **Promise**: `Promise`

### 错误预防

```js
// ❌ 这些将抛出错误：
evalExpression("arr.push(1)", { arr: [1, 2, 3] });
// Error: Cannot call mutable prototype method: push

evalExpression("new Function('return 1')");
// Error: Cannot use new with Function constructor

evalExpression("delete obj.prop", { obj: { prop: 1 } });
// Error: Delete operator is not allow
```

## 使用场景

### 配置与规则引擎

```js
// 执行业务规则
const rule = "age >= 18 && country === 'US'";
const isEligible = evalExpression(rule, { age: 25, country: "US" }); // true

// 动态定价
const priceFormula = "basePrice * (1 - discount / 100)";
const finalPrice = evalExpression(priceFormula, {
	basePrice: 100,
	discount: 20,
}); // 80
```

### 模板渲染

```js
// 邮件模板
const emailTemplate = `
Hello {{ user.name }},

Your order #{{ order.id }} has been {{ order.status }}.
Total: {{ order.total.toFixed(2) }}

Thank you for shopping with us!
`;

const email = evalTemplate(emailTemplate, {
	user: { name: "John Doe" },
	order: { id: 12345, status: "shipped", total: 99.99 },
});

// 动态内容
const greeting = evalTemplate("Good {{ hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening' }}, {{ name }}!", {
	hour: new Date().getHours(),
	name: "Alice",
});
```

### 数据转换

```js
// 转换 API 响应
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

### 表单验证

```js
// 条件验证
const validationRule = "email.includes('@') && password.length >= 8";
const isValid = evalExpression(validationRule, {
	email: "user@example.com",
	password: "secretpassword",
}); // true
```

## 限制

1. **无语句** - 仅支持表达式，不支持语句（无 `if`、`for`、`while` 等）
2. **无变量赋值** - 不能使用赋值运算符（`=`、`+=` 等）
3. **无可变操作** - 阻止可变的数组/对象方法
4. **无异步操作** - Promise 可以工作，但不能使用 `await`
5. **无函数声明** - 仅支持表达式中的箭头函数
6. **有限的错误恢复** - 语法错误将立即抛出
7. **无导入/require** - 无法导入外部模块

## 高级用法

### 自定义求值器实例

```js
import { Evaluator } from "ecma-evaluator";

// 创建具有固定上下文的可重用求值器
const evaluator = new Evaluator({ x: 10, y: 20 });

// 使用相同上下文执行多个表达式
console.log(evaluator.evaluate("x + y")); // 30
console.log(evaluator.evaluate("x * y")); // 200
console.log(evaluator.evaluate("Math.max(x, y)")); // 20
```

### 自定义模板解析器

```js
import { evalTemplate } from "ecma-evaluator";

evalTemplate(
	"Hello ${ name }!",
	{ name: "World" },
	{
		expressionStart: "${",
		expressionEnd: "}",
		preserveWhitespace: false,
	}
);
// 输出: "Hello World!"
```

## 性能提示

1. **重用求值器实例** - 当使用相同上下文执行多个表达式时
2. **避免复杂的嵌套表达式** - 如果可能，将它们分解为更小的部分
3. **缓存解析的模板** - 如果多次渲染同一模板
4. **使用简单的变量访问** - 在可能的情况下，使用简单的变量访问而不是复杂的属性链

## TypeScript 支持

该包包含 TypeScript 类型定义。

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

[Anti 996 License](LICENSE)
