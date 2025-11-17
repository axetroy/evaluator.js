/**
 * 解析表达式
 * @param expr
 * @example
 * ```js
 * evaluatorExpression('1 + 1'); // 2
 * evaluatorExpression('a > b', { a: 1, b: 2 }); // false
 * evaluatorExpression('a > 10 && b < 10', { a: 11, b: 8 }); // true
 * evaluatorExpression('array.map(v => v + 1)', { array: [1, 2, 3] }) // [2, 3, 4]
 * ```
 */
export declare function evaluatorExpression<T = unknown>(expr: string, context?: unknown): T;

/**
 * 解析模板
 * @param template
 * @example
 * ```js
 * const context = { name: "world" };
 * evaluatorTemplate("Hello ${{ name }}!", context); // Hello world!
 * ```
 */
export declare function evaluatorTemplate(template: string, context?: unknown): string;

/**
 * Evaluator class for reusing the same context across multiple evaluations
 */
export { Evaluator } from "./Evaluator.js";
