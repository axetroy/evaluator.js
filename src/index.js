import { Evaluator } from "./Evaluator.js";

// Re-export Evaluator class for direct use
export { Evaluator };

/**
 * Regular expression to match ${{ expression }} template patterns.
 * Matches: ${{ ... }} where ... can contain nested braces like { }
 * Pattern explanation:
 * - \$\{\{ - matches literal ${{
 * - ((?:[^{}]|{[^{}]*})+) - captures expression content, allowing single level of braces
 * - \}\} - matches literal }}
 */
const TEMPLATE_EXPRESSION_REGEX = /\$\{\{((?:[^{}]|{[^{}]*})+)\}\}/g;

/**
 * Evaluates a JavaScript expression with an optional context.
 * @param {string} expression - The JavaScript expression to evaluate
 * @param {Object} [context] - Optional context object with variables to use in the expression
 * @returns {*} The result of evaluating the expression
 * @example
 * evaluatorExpression('a + b', { a: 1, b: 2 }) // returns 3
 */
export function evaluatorExpression(expression, context) {
	const evaluator = new Evaluator(context);
	return evaluator.evaluate(expression);
}

/**
 * Evaluates a template string by replacing ${{ expression }} patterns with their evaluated values.
 * Undefined variables in expressions are replaced with empty strings instead of throwing errors.
 * @param {string} template - The template string containing ${{ expression }} patterns
 * @param {Object} [context] - Optional context object with variables to use in expressions
 * @returns {string} The template with all expressions evaluated and replaced
 * @example
 * evaluatorTemplate('Hello ${{ name }}!', { name: 'World' }) // returns 'Hello World!'
 */
export function evaluatorTemplate(template, context) {
	const evaluator = new Evaluator(context);
	
	return template.replace(TEMPLATE_EXPRESSION_REGEX, (match, expression) => {
		try {
			const value = evaluator.evaluate(expression.trim());
			return String(value);
		} catch (error) {
			// Replace undefined variables with empty string for graceful degradation
			if (error instanceof ReferenceError && error.message.endsWith("is not defined")) {
				return "";
			}
			throw error;
		}
	});
}
