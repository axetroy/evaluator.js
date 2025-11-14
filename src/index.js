import { Evaluator } from "./Evaluator.js";

export function evaluatorExpression(expression, context) {
	const evaluator = new Evaluator(context);

	return evaluator.evaluate(expression);
}

export function evaluatorTemplate(template, context) {
	const evaluator = new Evaluator(context);
	const REGEX = /\$\{\{((?:[^{}]|{[^{}]*})+)\}\}/g;
	/**
	 * @type {RegExpExecArray | null}
	 */
	let match = null;
	let result = template;

	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((match = REGEX.exec(template)) !== null) {
		const expression = match[1].trim();
		try {
			const value = evaluator.evaluate(expression);
			result = result.replace(match[0], String(value));
		} catch (error) {
			if (error instanceof ReferenceError && error.message.endsWith("is not defined")) {
				result = result.replace(match[0], "");
			} else {
				throw error;
			}
		}
	}

	return result;
}
