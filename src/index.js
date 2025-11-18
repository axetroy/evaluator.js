import { Evaluator } from "./Evaluator.js";
import { TemplateParser } from "./TemplateParser.js";

/**
 * Evaluates a JavaScript expression with an optional context.
 * @param {string} expression - The JavaScript expression to evaluate
 * @param {unknown} [context] - Optional context object with variables to use in the expression
 * @returns {*} The result of evaluating the expression
 * @example
 * evaluatorExpression('a + b', { a: 1, b: 2 }) // returns 3
 */
export function evaluatorExpression(expression, context) {
	return Evaluator.evaluate(expression, context);
}

/**
 * Evaluates a template string by replacing ${{ expression }} patterns with their evaluated values.
 * Undefined variables in expressions are replaced with empty strings instead of throwing errors.
 * @param {string} template - The template string containing ${{ expression }} patterns
 * @param {Object} [context] - Optional context object with variables to use in expressions
 * @returns {string} The template with all expressions evaluated and replaced
 * @example
 * evaluatorTemplate('Hello {{ name }}!', { name: 'World' }) // returns 'Hello World!'
 */
export function evaluatorTemplate(template, context) {
	let result = "";

	for (const token of TemplateParser.parse(template)) {
		if (token.type === "text") {
			result += token.value;
		} else if (token.type === "expression") {
			try {
				result += Evaluator.evaluate(token.value, context);
			} catch (error) {
				// Replace undefined variables with empty string for graceful degradation
				if (error instanceof ReferenceError && error.message.endsWith("is not defined")) {
					result += "undefined";
				} else {
					throw error;
				}
			}
		}
	}

	return result;
}
