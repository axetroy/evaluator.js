import { Evaluator } from "./Evaluator.js";

// Regular expression to match ${{ expression }} template patterns
const TEMPLATE_EXPRESSION_REGEX = /\$\{\{((?:[^{}]|{[^{}]*})+)\}\}/g;

/**
 * Evaluates a JavaScript expression with an optional context.
 * @param {string} expression - The JavaScript expression to evaluate
 * @param {Object} [context] - Optional context object with variables to use in the expression
 * @returns {*} The result of evaluating the expression
 */
export function evaluatorExpression(expression, context) {
	const evaluator = new Evaluator(context);

	return evaluator.evaluate(expression);
}

/**
 * Evaluates a template string by replacing ${{ expression }} patterns with their evaluated values.
 * @param {string} template - The template string containing ${{ expression }} patterns
 * @param {Object} [context] - Optional context object with variables to use in expressions
 * @returns {string} The template with all expressions evaluated and replaced
 */
export function evaluatorTemplate(template, context) {
	const evaluator = new Evaluator(context);
	
	return template.replace(TEMPLATE_EXPRESSION_REGEX, (match, expression) => {
		try {
			const value = evaluator.evaluate(expression.trim());
			return String(value);
		} catch (error) {
			if (error instanceof ReferenceError && error.message.endsWith("is not defined")) {
				return "";
			}
			throw error;
		}
	});
}
