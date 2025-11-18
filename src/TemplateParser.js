/**
 * 高性能模板解析器 - 只解析不执行
 * 专门用于将模板字符串解析为 token 数组
 * @class TemplateParser
 */
class TemplateParser {
	/**
	 * 模板 token 类型定义
	 * @typedef {Object} TemplateToken
	 * @property {'text'|'expression'} type - token 类型
	 * @property {string} value - token 值
	 * @property {number} start - 在原始模板中的开始位置
	 * @property {number} end - 在原始模板中的结束位置
	 */

	/**
	 * 创建解析器实例
	 * @param {Object} [options] - 配置选项
	 * @param {boolean} [options.preserveWhitespace=true] - 是否保留空白字符
	 * @param {boolean} [options.includePositions=true] - 是否包含位置信息
	 * @param {string} [options.expressionStart='{{'] - 表达式开始标记
	 * @param {string} [options.expressionEnd='}}'] - 表达式结束标记
	 */
	constructor(options = {}) {
		const { preserveWhitespace = true, includePositions = true, expressionStart = "{{", expressionEnd = "}}" } = options;

		/**
		 * 是否保留空白字符
		 * @type {boolean}
		 * @private
		 */
		this.preserveWhitespace = preserveWhitespace;

		/**
		 * 是否包含位置信息
		 * @type {boolean}
		 * @private
		 */
		this.includePositions = includePositions;

		/**
		 * 表达式开始标记
		 * @type {string}
		 * @private
		 */
		this.exprStart = expressionStart;

		/**
		 * 表达式结束标记
		 * @type {string}
		 * @private
		 */
		this.exprEnd = expressionEnd;

		/**
		 * 开始标记长度（缓存）
		 * @type {number}
		 * @private
		 */
		this.startLen = this.exprStart.length;

		/**
		 * 结束标记长度（缓存）
		 * @type {number}
		 * @private
		 */
		this.endLen = this.exprEnd.length;
	}

	/**
	 * 解析模板字符串为 token 数组
	 * @param {string} template - 要解析的模板字符串
	 * @returns {TemplateToken[]} token 数组
	 */
	parse(template) {
		if (typeof template !== "string") {
			throw new TypeError("Template must be a string");
		}

		if (template.length === 0) {
			return [];
		}

		const tokens = [];
		const length = template.length;
		let currentPos = 0;
		let textStart = 0;

		while (currentPos < length) {
			// 查找表达式开始位置
			const exprStartPos = this.findSequence(currentPos, template, this.exprStart);

			if (exprStartPos === -1) {
				// 没有更多表达式，添加剩余文本
				this.addTextToken(tokens, template, textStart, length);
				break;
			}

			// 添加表达式前的文本
			if (exprStartPos > textStart) {
				this.addTextToken(tokens, template, textStart, exprStartPos);
			}

			// 查找表达式结束位置
			const exprEndPos = this.findSequence(exprStartPos + this.startLen, template, this.exprEnd);

			if (exprEndPos === -1) {
				// 没有找到结束标记，将剩余内容作为文本
				this.addTextToken(tokens, template, exprStartPos, length);
				break;
			}

			// 提取表达式内容
			const exprContentStart = exprStartPos + this.startLen;
			const exprContentEnd = exprEndPos;

			// 添加表达式 token
			this.addExpressionToken(tokens, template, exprContentStart, exprContentEnd);

			// 移动到表达式结束之后
			currentPos = exprEndPos + this.endLen;
			textStart = currentPos;
		}

		return tokens;
	}

	/**
	 * 在字符串中查找指定序列
	 * @param {number} startPos - 开始位置
	 * @param {string} str - 要搜索的字符串
	 * @param {string} sequence - 要查找的序列
	 * @returns {number} 序列开始位置，未找到返回 -1
	 * @private
	 */
	findSequence(startPos, str, sequence) {
		const seqLen = sequence.length;
		const strLen = str.length;

		if (startPos + seqLen > strLen) {
			return -1;
		}

		// 使用字节级比较，避免子字符串创建
		for (let i = startPos; i <= strLen - seqLen; i++) {
			let match = true;

			for (let j = 0; j < seqLen; j++) {
				if (str.charCodeAt(i + j) !== sequence.charCodeAt(j)) {
					match = false;
					break;
				}
			}

			if (match) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * 添加文本 token
	 * @param {TemplateToken[]} tokens - token 数组
	 * @param {string} template - 模板字符串
	 * @param {number} start - 开始位置
	 * @param {number} end - 结束位置
	 * @private
	 */
	addTextToken(tokens, template, start, end) {
		if (start >= end) return;

		let value = template.substring(start, end);

		// 处理空白字符
		if (!this.preserveWhitespace) {
			value = value.trim();
			if (value.length === 0) return;
		}

		const token = {
			type: "text",
			value: value,
		};

		if (this.includePositions) {
			token.start = start;
			token.end = end;
		}

		tokens.push(token);
	}

	/**
	 * 添加表达式 token
	 * @param {TemplateToken[]} tokens - token 数组
	 * @param {string} template - 模板字符串
	 * @param {number} start - 开始位置
	 * @param {number} end - 结束位置
	 * @private
	 */
	addExpressionToken(tokens, template, start, end) {
		if (start >= end) return;

		let value = template.substring(start, end);

		// 清理表达式内容的空白字符
		value = value.trim();

		if (value.length === 0) return;

		const token = {
			type: "expression",
			value: value,
		};

		if (this.includePositions) {
			token.start = start - this.startLen; // 包含开始标记位置
			token.end = end + this.endLen; // 包含结束标记位置
			token.contentStart = start; // 表达式内容开始
			token.contentEnd = end; // 表达式内容结束
		}

		tokens.push(token);
	}

	/**
	 * 静态方法：快速解析模板
	 * @param {string} template - 模板字符串
	 * @param {Object} [options] - 配置选项
	 * @returns {TemplateToken[]} token 数组
	 */
	static parse(template, options) {
		const parser = new TemplateParser(options);
		return parser.parse(template);
	}
}

export { TemplateParser };
