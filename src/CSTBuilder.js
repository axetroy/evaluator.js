export class CSTBuilder {
	constructor(tokens) {
		this.tokens = tokens;
		this.pos = 0;
	}

	build() {
		this.skipTrivia();
		const node = this.parseValue();
		this.skipTrivia();
		return node;
	}

	current() {
		return this.tokens[this.pos];
	}

	skipTrivia() {
		while (this.pos < this.tokens.length && (this.tokens[this.pos].type === "whitespace" || this.tokens[this.pos].type === "comment")) {
			this.pos++;
		}
	}

	consume(type) {
		const token = this.current();
		if (!token || token.type !== type) {
			throw new Error(`Expected ${type}, got ${token && token.type}`);
		}
		this.pos++;
		return token;
	}

	parseValue() {
		this.skipTrivia();
		const token = this.current();

		if (!token) {
			throw new Error("Unexpected end of input");
		}

		switch (token.type) {
			case "braceL":
				return this.parseObject();
			case "bracketL":
				return this.parseArray();
			case "string":
				return this.parsePrimitive("String");
			case "number":
				return this.parsePrimitive("Number");
			case "boolean":
				return this.parsePrimitive("Boolean");
			case "null":
				return this.parsePrimitive("Null");
			default:
				throw new Error(`Unexpected token: ${token.type}`);
		}
	}

	parsePrimitive(type) {
		const token = this.current();
		this.pos++;
		return {
			type,
			start: token.start,
			end: token.end,
		};
	}

	parseObject() {
		const startToken = this.consume("braceL");
		const properties = [];

		this.skipTrivia();

		while (this.current() && this.current().type !== "braceR") {
			const keyToken = this.consume("string");
			const keyNode = {
				type: "String",
				start: keyToken.start,
				end: keyToken.end,
			};

			this.skipTrivia();
			this.consume("colon");
			this.skipTrivia();

			const valueNode = this.parseValue();

			properties.push({ key: keyNode, value: valueNode });

			this.skipTrivia();
			if (this.current() && this.current().type === "comma") {
				this.pos++;
				this.skipTrivia();
			}
		}

		const endToken = this.consume("braceR");

		return {
			type: "Object",
			start: startToken.start,
			end: endToken.end,
			properties,
		};
	}

	parseArray() {
		const startToken = this.consume("bracketL");
		const elements = [];

		this.skipTrivia();

		while (this.current() && this.current().type !== "bracketR") {
			const valueNode = this.parseValue();
			elements.push(valueNode);

			this.skipTrivia();
			if (this.current() && this.current().type === "comma") {
				this.pos++;
				this.skipTrivia();
			}
		}

		const endToken = this.consume("bracketR");

		return {
			type: "Array",
			start: startToken.start,
			end: endToken.end,
			elements,
		};
	}
}
