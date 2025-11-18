import * as acorn from "acorn";
import globals from "globals";

const { builtin } = globals;

// Error message constants for better maintainability
const ERROR_MESSAGES = {
	DELETE_NOT_SUPPORTED: "Delete operator is mutable and not supported",
	MUTABLE_METHOD: "Mutable method is not allowed",
	NEW_FUNCTION_NOT_ALLOWED: "Cannot use new with Function constructor",
	NOT_A_FUNCTION: "is not a function",
	PROPERTY_READ_ERROR: "Cannot read property",
	VARIABLE_NOT_DEFINED: "is not defined",
};

const GLOBAL_SCOPE = Object.create(null);

// Shared global scope object to avoid recreation on each Evaluator instantiation
Object.keys(builtin).forEach((key) => {
	if (key in globalThis && key !== "eval" && key !== "globalThis") {
		Object.defineProperty(GLOBAL_SCOPE, key, {
			value: globalThis[key],
			writable: false,
			enumerable: false,
			configurable: false,
		});
	}
});

Object.defineProperty(GLOBAL_SCOPE, "globalThis", {
	value: GLOBAL_SCOPE,
	writable: false,
	enumerable: false,
	configurable: false,
});

// Set of methods that mutate their objects and should be blocked for safety
const mutableMethods = new Set(
	[
		"Array.prototype.push",
		"Array.prototype.pop",
		"Array.prototype.shift",
		"Array.prototype.unshift",
		"Array.prototype.splice",
		"Array.prototype.reverse",
		"Array.prototype.sort",
		"Array.prototype.fill",
		"Array.prototype.copyWithin",
		"Object.freeze",
		"Object.defineProperty",
		"Object.defineProperties",
		"Object.preventExtensions",
		"Object.setPrototypeOf",
		"Object.assign",
		"Object.seal",
		"Reflect.set",
		"Reflect.defineProperty",
		"Reflect.deleteProperty",
		"Set.prototype.add",
		"Set.prototype.delete",
		"Set.prototype.clear",
		"WeakSet.prototype.add",
		"WeakSet.prototype.delete",
		"Map.prototype.set",
		"Map.prototype.delete",
		"Map.prototype.clear",
		"WeakMap.prototype.set",
		"WeakMap.prototype.delete",
		"Date.prototype.setMilliseconds",
		"Date.prototype.setSeconds",
		"Date.prototype.setUTCSeconds",
		"Date.prototype.setMinutes",
		"Date.prototype.setHours",
		"Date.prototype.setMonth",
		"Date.prototype.setDate",
		"Date.prototype.setFullYear",
		"Date.prototype.setUTCMinutes",
		"Date.prototype.setUTCHours",
		"Date.prototype.setUTCDate",
		"Date.prototype.setUTCMonth",
		"Date.prototype.setUTCFullYear",
		"Date.prototype.setTime",
		"Date.prototype.setYear",
		"RegExp.prototype.compile",
	]
		.map((path) => {
			const [object, ...properties] = path.split(".");

			let current = globalThis[object];
			for (const prop of properties) {
				if (current && Object.hasOwn(current, prop)) {
					current = current[prop];
				} else {
					return null;
				}
			}

			return typeof current === "function" ? current : null;
		})
		.filter(Boolean)
);

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
		this.scopes = [variables, GLOBAL_SCOPE]; // Scope stack: [user variables, global scope]
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
		const ast = acorn.parse(expression, { ecmaVersion: "latest" });

		// Start recursive evaluation from the root node
		return this.execute(ast.body);
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

				const args = node.arguments.map((arg) => this.visit(arg));

				return new Constructor(...args);
			}
			case "ChainExpression": {
				return this.visit(node.expression);
			}
			case "TemplateLiteral": {
				return this.handleTemplateLiteral(node);
			}
			default: {
				throw new Error(`Unsupported node type: ${node.type}`);
			}
		}
	}

	/**
	 * Handles binary expressions (arithmetic and comparison operations).
	 * @private
	 */
	handleBinaryExpression(node) {
		switch (node.operator) {
			case "+": {
				return this.visit(node.left) + this.visit(node.right);
			}
			case "-": {
				return this.visit(node.left) - this.visit(node.right);
			}
			case "*": {
				return this.visit(node.left) * this.visit(node.right);
			}
			case "**": {
				return this.visit(node.left) ** this.visit(node.right);
			}
			case "/": {
				const left = this.visit(node.left);
				const right = this.visit(node.right);
				if (right === 0) {
					return 1 / right;
				}
				return left / right;
			}
			case "==": {
				// Intentionally using loose equality as per JavaScript semantics
				// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
				return this.visit(node.left) == this.visit(node.right);
			}
			case "===": {
				return this.visit(node.left) === this.visit(node.right);
			}
			case "!=": {
				// Intentionally using loose inequality as per JavaScript semantics
				// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
				return this.visit(node.left) != this.visit(node.right);
			}
			case "!==": {
				return this.visit(node.left) !== this.visit(node.right);
			}
			case ">": {
				return this.visit(node.left) > this.visit(node.right);
			}
			case ">=": {
				return this.visit(node.left) >= this.visit(node.right);
			}
			case "<": {
				return this.visit(node.left) < this.visit(node.right);
			}
			case "<=": {
				return this.visit(node.left) <= this.visit(node.right);
			}
			case "%": {
				const left = this.visit(node.left);
				const right = this.visit(node.right);
				if (right === 0) return Number.NaN;
				return left % right;
			}
			// Bitwise operators
			case "&": {
				return this.visit(node.left) & this.visit(node.right);
			}
			case "|": {
				return this.visit(node.left) | this.visit(node.right);
			}
			case "^": {
				return this.visit(node.left) ^ this.visit(node.right);
			}
			case "<<": {
				return this.visit(node.left) << this.visit(node.right);
			}
			case ">>": {
				return this.visit(node.left) >> this.visit(node.right);
			}
			case ">>>": {
				return this.visit(node.left) >>> this.visit(node.right);
			}
			default: {
				throw new Error(`Unsupported operator: ${node.operator}`);
			}
		}
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
		return node.elements.map((element) => this.visit(element));
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
		if (node.callee.type === "MemberExpression") {
			const object = this.visit(node.callee.object);

			if (mutableMethods.has(object)) {
				throw new Error(ERROR_MESSAGES.MUTABLE_METHOD);
			}
		}

		const calledString = this.getNodeString(node.callee);

		const func = this.visit(node.callee);

		if (typeof func !== "function") {
			const isOptional = node.optional || node.callee.optional;
			if ((func === undefined || func === null) && isOptional) {
				return void 0;
			}
			throw new TypeError(`${calledString} ${ERROR_MESSAGES.NOT_A_FUNCTION}`);
		}

		const args = node.arguments.map((arg) => this.visit(arg));

		if (mutableMethods.has(func)) {
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

	/**
	 * Converts an AST node to a human-readable string representation for error messages.
	 * @private
	 * @param {Object} node - The AST node to convert
	 * @returns {string|null} A string representation of the node, or null if not supported
	 */
	getNodeString(node) {
		switch (node.type) {
			case "Identifier": {
				return node.name;
			}
			case "Literal": {
				return node.raw;
			}
			case "ArrayExpression": {
				return "(array)";
			}
			case "ObjectExpression": {
				return "(object)";
			}
			case "MemberExpression": {
				const objectStr = this.getNodeString(node.object);
				const propertyStr = this.getNodeString(node.property);

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
}
