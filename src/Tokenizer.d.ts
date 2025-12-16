interface Token {
	type: string;
	start: number;
	end: number;
}

declare class Tokenizer {
	constructor(sourceText: string);

	tokenize(): Array<Token>;
}

export { Tokenizer, Token };
