### 一个类似 javascript 的求值器，支持表达式和模板字符串

使用 AST 解析表达式，支持部分 javascript 语法，支持自定义函数和变量

#### Usage

```js
import { evaluatorExpression, evaluatorTemplate } from "evaluator";

evaluatorExpression("1 + 1"); // 2
evaluatorExpression("a > b", { a: 1, b: 2 }); // false
evaluatorExpression("a > 10 && b < 10", { a: 11, b: 8 }); // true
evaluatorExpression("array.map(v => v + 1)", { array: [1, 2, 3] }); // [2, 3, 4]

const context = { name: "world" };
evaluatorTemplate("Hello ${{ name }}!", context); // Hello world!
```
