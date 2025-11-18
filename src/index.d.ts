import { Evaluator } from "./Evaluator.js";
import type { TemplateParserOptions } from "./TemplateParser.js";

export { Evaluator };

/**
 * 解析表达式
 * @param expr
 * @example
 * ```js
 * evalExpression('1 + 1'); // 2
 * evalExpression('a > b', { a: 1, b: 2 }); // false
 * evalExpression('a > 10 && b < 10', { a: 11, b: 8 }); // true
 * evalExpression('array.map(v => v + 1)', { array: [1, 2, 3] }) // [2, 3, 4]
 * ```
 */
export declare function evalExpression<T = unknown>(expr: string, context?: unknown): T;

/**
 * 解析模板
 * @param template
 * @example
 * ```js
 * const context = { name: "world" };
 * evalTemplate("Hello ${{ name }}!", context); // Hello world!
 * ```
 */
export declare function evalTemplate(template: string, context?: unknown, templateParserOptions?: TemplateParserOptions): string;
