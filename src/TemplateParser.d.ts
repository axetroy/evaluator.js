export type TemplateToken = {
	type: "text" | "expression";
	value: string;
	// 仅在 includePositions 为 true 时存在
	start?: number;
	end?: number;
	contentStart?: number;
	contentEnd?: number;
};

export interface TemplateParserOptions {
	preserveWhitespace?: boolean;
	includePositions?: boolean;
	expressionStart?: string;
	expressionEnd?: string;
}

export class TemplateParser {
	constructor(options?: TemplateParserOptions);

	/**
	 * 解析模板字符串为 token 数组
	 */
	parse(template: string): TemplateToken[];

	/**
	 * 静态方法：快速解析模板
	 */
	static parse(template: string, options?: TemplateParserOptions): TemplateToken[];
}
