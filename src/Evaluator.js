import * as acorn from "acorn";

// List of TypedArray constructors available in the environment
const typeArrayConstructors = [
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array,
	globalThis.BigInt64Array,
	globalThis.BigUint64Array,
].filter(Boolean);

// Set of methods that mutate their objects and should be blocked for safety
const mutableMethods = new Set([
	Array.prototype.push,
	Array.prototype.pop,
	Array.prototype.shift,
	Array.prototype.unshift,
	Array.prototype.splice,
	Array.prototype.reverse,
	Array.prototype.sort,
	Array.prototype.fill,
	Array.prototype.copyWithin,
	ArrayBuffer.prototype.slice,
	DataView.prototype.setInt8,
	DataView.prototype.setUint8,
	DataView.prototype.setInt16,
	DataView.prototype.setUint16,
	DataView.prototype.setInt32,
	DataView.prototype.setUint32,
	DataView.prototype.setFloat32,
	DataView.prototype.setFloat64,
	// TypedArray methods
	...typeArrayConstructors.flatMap((TypedArray) => [
		TypedArray.prototype.set,
		TypedArray.prototype.fill,
		TypedArray.prototype.copyWithin,
		TypedArray.prototype.reverse,
		TypedArray.prototype.sort,
	]),

	Object.freeze,
	Object.defineProperty,
	Object.defineProperties,
	Object.preventExtensions,
	Object.setPrototypeOf,
	Object.assign,
	Set.prototype.add,
	Set.prototype.delete,
	Set.prototype.clear,
	WeakSet.prototype.add,
	WeakSet.prototype.delete,
	Map.prototype.set,
	Map.prototype.delete,
	Map.prototype.clear,
	WeakMap.prototype.set,
	WeakMap.prototype.delete,
	Date.prototype.setMilliseconds,
	Date.prototype.setMinutes,
	Date.prototype.setHours,
	Date.prototype.setDate,
	Date.prototype.setFullYear,
	Date.prototype.setUTCMinutes,
	Date.prototype.setUTCHours,
	Date.prototype.setUTCDate,
	Date.prototype.setUTCFullYear,
	Date.prototype.setTime,
]);

/**
 * A JavaScript expression evaluator that safely evaluates expressions within a sandboxed environment.
 * Supports various JavaScript features including arithmetic, logical operations, functions, and more.
 */
export class Evaluator {
	/**
	 * Creates a new Evaluator instance.
	 * @param {Object} [variables={}] - An optional object containing variables to make available in the evaluation context
	 */
	constructor(variables = {}) {
		const globalScope = Object.assign(Object.create(null), {
			Infinity,
			null: null,
			undefined,
			NaN: Number.NaN,
			isNaN: Number.isNaN,
			isFinite: Number.isFinite,
			parseFloat: Number.parseFloat,
			parseInt: Number.parseInt,
			encodeURI: globalThis.encodeURI,
			encodeURIComponent: globalThis.encodeURIComponent,
			decodeURI: globalThis.decodeURI,
			decodeURIComponent: globalThis.decodeURIComponent,
			Number,
			String,
			Boolean,
			BigInt: globalThis.BigInt,
			Symbol: globalThis.Symbol,
			Object,
			Array,
			Set,
			WeakSet,
			Map,
			WeakMap,
			Math,
			JSON,
			Date,
			RegExp,
			Error,
			EvalError,
			RangeError,
			ReferenceError,
			SyntaxError,
			TypeError,
			URIError,
			Promise,
			...typeArrayConstructors.reduce((acc, obj) => {
				acc[obj.name] = obj;
				return acc;
			}, {}),
		});
		this.scopes = [variables, globalScope]; // Scope stack: [user variables, global scope]
	}

	/**
	 * Parses and evaluates a JavaScript expression.
	 * @param {string} expression - The JavaScript expression to evaluate
	 * @returns {*} The result of the evaluation
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
					throw new Error("Cannot use new with Function constructor");
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
				if (right === 0) throw new Error("Division by zero");
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
				return this.visit(node.left) % this.visit(node.right);
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
	 * @private
	 */
	handleLogicalExpression(node) {
		switch (node.operator) {
			case "&&": {
				return this.visit(node.left) && this.visit(node.right);
			}
			case "||": {
				return this.visit(node.left) || this.visit(node.right);
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
				// eslint-disable-next-line sonarjs/void-use
				return void this.visit(node.argument);
			}
			case "delete": {
				throw new Error("Delete operator is mutable and not supported");
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

		throw new ReferenceError(`${name} is not defined`);
	}

	/**
	 * Handles member expressions (property access like obj.prop or obj[prop]).
	 * @private
	 */
	handleMemberExpression(node) {
		const object = this.visit(node.object);
		const property = node.property.type === "Identifier" && !node.computed ? node.property.name : this.visit(node.property);

		if (object === null || object === undefined) {
			// optional chaining
			if (node.optional) {
				return void 0;
			}
			throw new TypeError(`Cannot read property '${property}' of ${object}`);
		}

		// Check for own properties first (instance properties take precedence)
		if (Object.hasOwn(object, property)) {
			return object[property];
		}

		const prototypeValue = object[property];

		if (mutableMethods.has(prototypeValue)) {
			throw new Error(`Cannot call mutable prototype method: ${property}`);
		}

		if (typeof prototypeValue === "function") {
			// Bind prototype methods to the instance
			return prototypeValue.bind(object);
		}

		return prototypeValue;
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
	 * @private
	 */
	handleArrowFunctionExpression(node) {
		return (...args) => {
			const newScope = {};
			for (const [index, param] of node.params.entries()) {
				newScope[param.name] = args[index];
			}
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
		const calledString = this.getNodeString(node.callee);

		const func = this.visit(node.callee);

		if (typeof func !== "function") {
			const isOptional = node.optional || node.callee.optional;
			if ((func === undefined || func === null) && isOptional) {
				return void 0;
			}
			throw new TypeError(`${calledString} is not a function`);
		}

		const args = node.arguments.map((arg) => this.visit(arg));

		return func(...args);
	}

	/**
	 * Handles template literal expressions.
	 * @private
	 */
	handleTemplateLiteral(node) {
		return node.quasis
			.concat(node.expressions)
			.filter(Boolean)
			.sort((a, b) => {
				return a.start - b.start;
			})
			.map((node) => {
				if (node.type === "TemplateElement") {
					return node.value.raw;
				}

				return this.visit(node);
			})
			.join("");
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
				let accessor = this.getNodeString(node.object);

				if (node.computed) {
					accessor += `[${this.getNodeString(node.property)}]`;
				} else {
					accessor += `.${this.getNodeString(node.property)}`;
				}

				return accessor;
			}
			default: {
				return null;
			}
		}
	}
}
