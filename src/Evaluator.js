import * as acorn from "acorn";
import globals from "globals";
import { mutableMethods } from "./mutableMethods.js";

// Error message constants for better maintainability
const ERROR_MESSAGES = {
	DELETE_NOT_SUPPORTED: "Delete operator is not allow",
	MUTABLE_METHOD: "Mutable method is not allowed",
	NEW_FUNCTION_NOT_ALLOWED: "Cannot use new with Function constructor",
	NOT_A_FUNCTION: "is not a function",
	PROPERTY_READ_ERROR: "Cannot read property",
	VARIABLE_NOT_DEFINED: "is not defined",
	FUNCTION_CONSTRUCTOR_NOT_ALLOWED: "Function constructor is not allowed",
	THIS_NOT_ALLOWED: "'this' keyword is not allowed",
	NOT_A_VALID_SYNTAX: "is not a valid syntax",
};

const BINARY_OPERATION_MAP = {
	"+": (a, b) => a + b,
	"-": (a, b) => a - b,
	"*": (a, b) => a * b,
	"**": (a, b) => a ** b,
	"==": (a, b) => a == b,
	"===": (a, b) => a === b,
	"!=": (a, b) => a != b,
	"!==": (a, b) => a !== b,
	">": (a, b) => a > b,
	">=": (a, b) => a >= b,
	"<": (a, b) => a < b,
	"<=": (a, b) => a <= b,
	"%": (a, b) => a % b,
	"/": (a, b) => a / b,
	"|": (a, b) => a | b,
	"&": (a, b) => a & b,
	"^": (a, b) => a ^ b,
	"<<": (a, b) => a << b,
	">>": (a, b) => a >> b,
	">>>": (a, b) => a >>> b,
	in: (a, b) => a in b,
	instanceof: (a, b) => a instanceof b,
};

function createGlobalScope() {
	const scope = Object.create(null);
	const { builtin } = globals;

	Object.keys(builtin).forEach((key) => {
		if (key in globalThis && key !== "eval" && key !== "globalThis") {
			const isWritable = builtin[key];

			Object.defineProperty(scope, key, {
				value: globalThis[key],
				writable: isWritable,
				enumerable: false,
				configurable: false,
			});
		}
	});

	Object.defineProperty(scope, "globalThis", {
		value: scope,
		writable: false,
		enumerable: false,
		configurable: false,
	});

	return scope;
}

/** @type {() => Set<Function>} */
const getMutableMethods = (() => {
	let MUTABLE_METHODS = null;

	return () => {
		if (MUTABLE_METHODS) return MUTABLE_METHODS;

		const set = new Set();
		for (const path of mutableMethods) {
			const [object, ...properties] = path.split(".");
			let current = globalThis[object];
			for (const prop of properties) {
				if (current && Object.hasOwn(current, prop)) {
					current = current[prop];
				} else {
					current = null;
					break;
				}
			}
			if (typeof current === "function") set.add(current);
		}
		MUTABLE_METHODS = set;
		return MUTABLE_METHODS;
	};
})();

/**
 * A JavaScript expression evaluator that safely evaluates expressions within a sandboxed environment.
 * Supports various JavaScript features including arithmetic, logical operations, functions, and more.
 *
 * Security features:
 * - Blocks mutable methods to prevent side effects
 * - No access to eval() or Function() constructor
 * - Sandboxed scope with limited global objects
 *
 * @example
 * const evaluator = new Evaluator({ x: 10, y: 20 });
 * evaluator.evaluate('x + y') // returns 30
 */
export class Evaluator {
	/**
	 * Creates a new Evaluator instance with a custom variable context.
	 * The scope hierarchy is: user variables -> global scope
	 * @param {Object} [variables={}] - An optional object containing variables to make available in the evaluation context
	 */
	constructor(variables = {}) {
		this.scopes = [variables, createGlobalScope()];
		this.source = undefined;
	}

	/**
	 * Evaluates a JavaScript expression with an optional context.
	 * @param {string} expression
	 * @param {unknown} [context]
	 * @returns
	 */
	static evaluate(expression, context) {
		const evaluator = new Evaluator(context);
		return evaluator.evaluate(expression);
	}

	/**
	 * Parses and evaluates a JavaScript expression using acorn parser.
	 * @param {string} expression - The JavaScript expression to evaluate
	 * @returns {*} The result of the evaluation
	 * @throws {SyntaxError} If the expression has invalid syntax
	 * @throws {ReferenceError} If referencing undefined variables
	 * @throws {TypeError} If performing invalid operations
	 */
	evaluate(expression) {
		this.source = expression;

		const ast = acorn.parse(expression, { ecmaVersion: "latest" });

		// Start recursive evaluation from the root node
		try {
			return this.execute(ast.body);
		} finally {
			this.source = undefined;
		}
	}

	/**
	 * Executes an array of AST body nodes sequentially.
	 * @private
	 * @param {Array} body - Array of AST nodes to execute
	 * @returns {*} The result of the last executed node
	 */
	execute(body) {
		let result;
		for (const node of body) {
			result = this.visit(node);
		}
		return result;
	}

	/**
	 * Visits an AST node and delegates to the appropriate handler based on node type.
	 * @private
	 * @param {Object} node - The AST node to visit
	 * @returns {*} The result of visiting the node
	 */
	visit(node) {
		switch (node.type) {
			case "ExpressionStatement": {
				return this.visit(node.expression);
			}
			case "BinaryExpression": {
				return this.handleBinaryExpression(node);
			}
			case "LogicalExpression": {
				return this.handleLogicalExpression(node);
			}
			case "UnaryExpression": {
				return this.handleUnaryExpression(node);
			}
			case "Identifier": {
				return this.handleIdentifier(node);
			}
			case "Literal": {
				return node.value;
			}
			case "MemberExpression": {
				return this.handleMemberExpression(node);
			}
			case "ObjectExpression": {
				return this.handleObjectExpression(node);
			}
			case "ArrayExpression": {
				return this.handleArrayExpression(node);
			}
			case "SpreadElement": {
				return this.handleSpreadElement(node);
			}
			case "ObjectExpression": {
				return this.handleObjectExpression(node);
			}
			case "ArrowFunctionExpression": {
				return this.handleArrowFunctionExpression(node);
			}
			case "CallExpression": {
				return this.handleCallExpression(node);
			}
			case "ConditionalExpression": {
				return this.visit(node.test) ? this.visit(node.consequent) : this.visit(node.alternate);
			}
			case "NewExpression": {
				if (node.callee.type !== "Identifier") {
					throw new Error(`Unsupported callee type '${node.callee.type}' in new expression`);
				}

				if (node.callee.name === "Function") {
					throw new Error(ERROR_MESSAGES.NEW_FUNCTION_NOT_ALLOWED);
				}

				const Constructor = this.visit(node.callee);

				// 仅在存在参数时构建数组
				const args = node.arguments.length ? node.arguments.map((arg) => this.visit(arg)) : [];

				return new Constructor(...args);
			}
			case "ChainExpression": {
				return this.visit(node.expression);
			}
			case "TemplateLiteral": {
				return this.handleTemplateLiteral(node);
			}
			case "ThisExpression": {
				throw new Error(ERROR_MESSAGES.THIS_NOT_ALLOWED);
			}
			default: {
				let content = this.source.slice(node.start, node.end);

				if (content.length > 20) {
					content = content.slice(0, 17) + "...";
				}

				throw new Error(`'${content}'` + " " + ERROR_MESSAGES.NOT_A_VALID_SYNTAX);
			}
		}
	}

	/**
	 * Handles binary expressions (arithmetic and comparison operations).
	 * @param {import('acorn').BinaryExpression} node
	 * @private
	 */
	handleBinaryExpression(node) {
		const op = node.operator;
		const left = this.visit(node.left);
		const right = this.visit(node.right);

		if (BINARY_OPERATION_MAP.hasOwnProperty(op)) {
			return BINARY_OPERATION_MAP[op](left, right);
		}

		throw new Error(`Unsupported operator: ${node.operator}`);
	}

	/**
	 * Handles logical expressions (&&, ||, ??).
	 * Implements proper short-circuit evaluation for performance.
	 * @private
	 */
	handleLogicalExpression(node) {
		switch (node.operator) {
			case "&&": {
				const left = this.visit(node.left);
				return left ? this.visit(node.right) : left;
			}
			case "||": {
				const left = this.visit(node.left);
				return left ? left : this.visit(node.right);
			}
			case "??": {
				const left = this.visit(node.left);
				return left !== null && left !== undefined ? left : this.visit(node.right);
			}
			default: {
				throw new Error(`Unsupported logical operator: ${node.operator}`);
			}
		}
	}

	/**
	 * Handles unary expressions (-, +, !, ~, typeof, void).
	 * @private
	 */
	handleUnaryExpression(node) {
		switch (node.operator) {
			case "-": {
				return -this.visit(node.argument);
			}
			case "+": {
				return +this.visit(node.argument);
			}
			case "!": {
				return !this.visit(node.argument);
			}
			case "~": {
				return ~this.visit(node.argument);
			}
			case "typeof": {
				return typeof this.visit(node.argument);
			}
			case "void": {
				return void this.visit(node.argument);
			}
			case "delete": {
				throw new Error(ERROR_MESSAGES.DELETE_NOT_SUPPORTED);
			}
			default: {
				throw new Error(`Unsupported unary operator: ${node.operator}`);
			}
		}
	}

	/**
	 * Handles identifier (variable) lookups in the scope chain.
	 * @private
	 */
	handleIdentifier(node) {
		const name = node.name;
		for (const scope of this.scopes) {
			if (Object.hasOwn(scope, name)) {
				return scope[name];
			}
		}

		throw new ReferenceError(`${name} ${ERROR_MESSAGES.VARIABLE_NOT_DEFINED}`);
	}

	/**
	 * Handles member expressions (property access like obj.prop or obj[prop]).
	 * @private
	 */
	handleMemberExpression(node) {
		const object = this.visit(node.object);

		// Determine property name: either identifier name or computed value
		const isStaticProperty = node.property.type === "Identifier" && !node.computed;
		const property = isStaticProperty ? node.property.name : this.visit(node.property);

		if (object === null || object === undefined) {
			// optional chaining
			if (node.optional) {
				return void 0;
			}
			throw new TypeError(`${ERROR_MESSAGES.PROPERTY_READ_ERROR} '${property}' of ${object}`);
		}

		return object[property];
	}

	/**
	 * Handles object literal expressions.
	 * @private
	 */
	handleObjectExpression(node) {
		const obj = {};
		for (const prop of node.properties) {
			const key = prop.key.name || prop.key.value;
			const value = this.visit(prop.value);
			obj[key] = value;
		}
		return obj;
	}

	/**
	 * Handles array literal expressions.
	 * @private
	 */
	handleArrayExpression(node) {
		const result = [];

		for (let i = 0; i < node.elements.length; i++) {
			const element = node.elements.at(i);
			const value = this.visit(element);

			if (element.type === "SpreadElement") {
				result.push(...value);
			} else {
				result.push(value);
			}
		}

		return result;
	}

	/**
	 * Handles object literal expressions.
	 * @returns
	 */
	handleObjectExpression(node) {
		const obj = {};
		for (const prop of node.properties) {
			if (prop.type === "SpreadElement") {
				Object.assign(obj, this.visit(prop.argument));
				continue;
			}
			const key = prop.key.name || prop.key.value;
			const value = this.visit(prop.value);
			obj[key] = value;
		}
		return obj;
	}

	handleSpreadElement(node) {
		return this.visit(node.argument);
	}

	/**
	 * Handles arrow function expressions.
	 * Creates a closure that captures the current scope and executes the function body
	 * with parameters bound to a new scope.
	 * @private
	 */
	handleArrowFunctionExpression(node) {
		return (...args) => {
			// Create new scope with parameters bound to arguments
			const newScope = {};
			const paramCount = node.params.length;
			for (let i = 0; i < paramCount; i++) {
				newScope[node.params[i].name] = args[i];
			}

			// Push new scope, evaluate body, then pop scope
			this.scopes.unshift(newScope);
			const result = this.visit(node.body);
			this.scopes.shift();
			return result;
		};
	}

	/**
	 * Handles function call expressions, including optional chaining.
	 * @private
	 */
	handleCallExpression(node) {
		// 移除对 callee.object 的冗余检查，避免重复求值与错误集合匹配
		if (node.callee.type === "MemberExpression") {
			const object = this.visit(node.callee.object);
			if (getMutableMethods().has(object)) {
				throw new Error(ERROR_MESSAGES.MUTABLE_METHOD);
			}
		}

		const calledString = getNodeString(node.callee);

		const func = this.visit(node.callee);

		if (typeof func !== "function") {
			const isOptional = node.optional || node.callee.optional;
			if ((func === undefined || func === null) && isOptional) {
				return void 0;
			}
			throw new TypeError(`${calledString} ${ERROR_MESSAGES.NOT_A_FUNCTION}`);
		}

		if (func === Function) {
			throw new Error(ERROR_MESSAGES.FUNCTION_CONSTRUCTOR_NOT_ALLOWED);
		}

		// 仅在存在参数时构建数组
		const args = (() => {
			if (node.arguments.length === 0) {
				return [];
			}

			let result = [];

			for (let i = 0; i < node.arguments.length; i++) {
				const element = node.arguments.at(i);
				const value = this.visit(element);

				if (element.type === "SpreadElement") {
					result.push(...value);
				} else {
					result.push(value);
				}
			}

			return result;
		})();

		if (getMutableMethods().has(func)) {
			throw new Error(ERROR_MESSAGES.MUTABLE_METHOD);
		}

		const target = node.callee.type === "MemberExpression" ? this.visit(node.callee.object) : null;
		return func.apply(target, args);
	}

	/**
	 * Handles template literal expressions.
	 * More efficient implementation that interleaves quasis and expressions without sorting.
	 * @private
	 */
	handleTemplateLiteral(node) {
		let result = "";
		const expressionCount = node.expressions.length;

		for (let i = 0; i < node.quasis.length; i++) {
			result += node.quasis[i].value.raw;
			if (i < expressionCount) {
				result += this.visit(node.expressions[i]);
			}
		}

		return result;
	}
}

/**
 *
 * @param {import('acorn').Node} node
 * @returns
 */
export function getNodeString(node) {
	switch (node.type) {
		case "Identifier": {
			return node.name;
		}
		case "Literal": {
			return node.raw;
		}
		case "ArrayExpression": {
			return `[${node.elements.map((child) => getNodeString(child)).join(",")}]`;
		}
		case "ObjectExpression": {
			// if keys is empty
			if (node.properties.length === 0) {
				return "{}";
			}

			return "{(intermediate value)}";
		}
		case "MemberExpression": {
			const objectStr = getNodeString(node.object);
			const propertyStr = getNodeString(node.property);

			if (node.computed) {
				return `${objectStr}[${propertyStr}]`;
			}
			return `${objectStr}.${propertyStr}`;
		}
		default: {
			return null;
		}
	}
}
