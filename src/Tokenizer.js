class Tokenizer {
	constructor(text) {
		this.text = text;
		this.pos = 0;
		this.tokens = [];
	}

	tokenize() {
		while (this.pos < this.text.length) {
			const ch = this.text[this.pos];

			if (this.isWhitespace(ch)) {
				this.readWhitespace();
			} else if (ch === '"') {
				this.readString();
			} else if (this.isNumberStart(ch)) {
				this.readNumber();
			} else if (this.isAlpha(ch)) {
				this.readKeyword();
			} else {
				this.readPunctuationOrComment();
			}
		}

		return this.tokens;
	}

	// ---------- helpers ----------

	isWhitespace(ch) {
		return ch === " " || ch === "\n" || ch === "\r" || ch === "\t";
	}

	isNumberStart(ch) {
		return ch === "-" || (ch >= "0" && ch <= "9");
	}

	isAlpha(ch) {
		return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
	}

	// ---------- readers ----------

	readWhitespace() {
		const start = this.pos;
		while (this.pos < this.text.length && this.isWhitespace(this.text[this.pos])) {
			this.pos++;
		}
		this.tokens.push({
			type: "whitespace",
			start,
			end: this.pos,
		});
	}

	readString() {
		const start = this.pos;
		this.pos++; // skip opening "

		while (this.pos < this.text.length) {
			const ch = this.text[this.pos];

			if (ch === "\\") {
				// skip escaped char
				this.pos += 2;
				continue;
			}

			if (ch === '"') {
				this.pos++; // closing "
				break;
			}

			this.pos++;
		}

		this.tokens.push({
			type: "string",
			start,
			end: this.pos,
		});
	}

	readNumber() {
		const start = this.pos;

		if (this.text[this.pos] === "-") this.pos++;

		while (this.pos < this.text.length && this.isDigit(this.text[this.pos])) {
			this.pos++;
		}

		if (this.text[this.pos] === ".") {
			this.pos++;
			while (this.pos < this.text.length && this.isDigit(this.text[this.pos])) {
				this.pos++;
			}
		}

		if (this.text[this.pos] === "e" || this.text[this.pos] === "E") {
			this.pos++;
			if (this.text[this.pos] === "+" || this.text[this.pos] === "-") {
				this.pos++;
			}
			while (this.pos < this.text.length && this.isDigit(this.text[this.pos])) {
				this.pos++;
			}
		}

		this.tokens.push({
			type: "number",
			start,
			end: this.pos,
		});
	}

	readKeyword() {
		const start = this.pos;

		while (this.pos < this.text.length && this.isAlpha(this.text[this.pos])) {
			this.pos++;
		}

		const word = this.text.slice(start, this.pos);

		let type;
		if (word === "true" || word === "false") {
			type = "boolean";
		} else if (word === "null") {
			type = "null";
		} else {
			throw new Error(`Unexpected identifier: ${word}`);
		}

		this.tokens.push({
			type,
			start,
			end: this.pos,
		});
	}

	readPunctuationOrComment() {
		const start = this.pos;
		const ch = this.text[this.pos];

		// line comment //
		if (ch === "/" && this.text[this.pos + 1] === "/") {
			this.pos += 2;
			while (this.pos < this.text.length && this.text[this.pos] !== "\n") {
				this.pos++;
			}
			this.tokens.push({
				type: "comment",
				start,
				end: this.pos,
			});
			return;
		}

		// block comment /* */
		if (ch === "/" && this.text[this.pos + 1] === "*") {
			this.pos += 2;
			while (this.pos < this.text.length && !(this.text[this.pos] === "*" && this.text[this.pos + 1] === "/")) {
				this.pos++;
			}
			this.pos += 2; // skip */
			this.tokens.push({
				type: "comment",
				start,
				end: this.pos,
			});
			return;
		}

		// punctuation
		this.pos++;

		const map = {
			"{": "braceL",
			"}": "braceR",
			"[": "bracketL",
			"]": "bracketR",
			":": "colon",
			",": "comma",
		};

		const type = map[ch];
		if (!type) {
			throw new Error(`Unexpected character: ${ch} at ${start}`);
		}

		this.tokens.push({
			type,
			start,
			end: this.pos,
		});
	}

	isDigit(ch) {
		return ch >= "0" && ch <= "9";
	}
}

export { Tokenizer };
