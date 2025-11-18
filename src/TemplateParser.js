/**
 * 简单状态机模板解析器
 * 能够正确处理表达式中包含字符串、转义字符和结束标记的情况
 * @class SimpleStateTemplateParser
 */
class TemplateParser {
	/**
	 * 创建解析器实例
	 * @param {Object} [options] - 配置选项
	 * @param {string} [options.expressionStart='{{'] - 表达式开始标记
	 * @param {string} [options.expressionEnd='}}'] - 表达式结束标记
	 * @param {boolean} [options.preserveWhitespace=true] - 是否保留表达式周围的空白字符
	 */
	constructor(options = {}) {
		// 表达式标记配置
		this.exprStart = options.expressionStart || "{{";
		this.exprEnd = options.expressionEnd || "}}";

		// 标记长度缓存，避免重复计算
		this.startLen = this.exprStart.length;
		this.endLen = this.exprEnd.length;

		// 其他配置
		this.preserveWhitespace = options.preserveWhitespace === true;
	}

	/**
	 * 解析模板字符串，将其转换为 token 数组
	 * @param {string} template - 要解析的模板字符串
	 * @returns {Array<{type: string, value: string}>} token 数组
	 */
	parse(template) {
		// 输入验证
		if (typeof template !== "string") {
			throw new TypeError("模板必须是字符串");
		}

		const tokens = []; // 存储解析结果的 token 数组
		const length = template.length;

		// 状态机变量
		let state = "TEXT"; // 当前状态：TEXT | EXPR | STRING_SQ | STRING_DQ | TEMPLATE | ESCAPE_*
		let buffer = ""; // 当前状态的字符缓冲区
		let exprStartPos = 0; // 当前表达式的开始位置（用于错误恢复）
		let pos = 0; // 当前扫描位置

		// 主解析循环：逐个字符扫描模板
		while (pos < length) {
			const char = template[pos];
			const nextChar = template[pos + 1];

			// 状态机核心逻辑
			switch (state) {
				// ==================== 文本状态 ====================
				case "TEXT":
					// 检查是否遇到表达式开始标记
					if (this._isMatch(pos, template, this.exprStart)) {
						// 将缓冲区中的文本保存为 token
						if (buffer.length > 0) {
							tokens.push({ type: "text", value: buffer, start: pos - buffer.length, end: pos });
							buffer = "";
						}
						// 切换到表达式状态
						state = "EXPR";
						exprStartPos = pos; // 记录表达式开始位置
						pos += this.startLen; // 跳过开始标记
						continue; // 继续处理下一个字符（跳过本次循环的剩余部分）
					}
					// 普通文本字符，添加到缓冲区
					buffer += char;
					break;

				// ==================== 表达式状态 ====================
				case "EXPR":
					// 在表达式中，需要处理各种字符串和转义字符
					if (char === "'") {
						// 进入单引号字符串状态
						state = "STRING_SQ";
					} else if (char === '"') {
						// 进入双引号字符串状态
						state = "STRING_DQ";
					} else if (char === "`") {
						// 进入模板字符串状态
						state = "TEMPLATE";
					} else if (char === "\\") {
						// 遇到转义字符，根据当前上下文进入相应的转义状态
						if (nextChar === "'") state = "ESCAPE_SQ";
						else if (nextChar === '"') state = "ESCAPE_DQ";
						else if (nextChar === "`") state = "ESCAPE_TEMPLATE";
						else state = "ESCAPE_EXPR";
					} else if (this._isMatch(pos, template, this.exprEnd)) {
						// 找到表达式结束标记，且不在字符串中
						const exprValue = this.preserveWhitespace ? buffer : buffer.trim();
						if (exprValue.length > 0) {
							tokens.push({
								type: "expression",
								value: exprValue,
								start: exprStartPos,
								end: pos + this.endLen,
								contentStart: exprStartPos + this.startLen,
								contentEnd: pos,
							});
						}
						// 重置状态，准备处理后续文本
						buffer = "";
						state = "TEXT";
						pos += this.endLen; // 跳过结束标记
						continue;
					}
					// 将当前字符添加到表达式缓冲区
					buffer += char;
					break;

				// ==================== 字符串状态 ====================
				case "STRING_SQ": // 单引号字符串
					if (char === "\\") {
						state = "ESCAPE_SQ"; // 遇到转义字符
					} else if (char === "'") {
						state = "EXPR"; // 字符串结束，回到表达式状态
					}
					buffer += char;
					break;

				case "STRING_DQ": // 双引号字符串
					if (char === "\\") {
						state = "ESCAPE_DQ";
					} else if (char === '"') {
						state = "EXPR";
					}
					buffer += char;
					break;

				case "TEMPLATE": // 模板字符串
					if (char === "\\") {
						state = "ESCAPE_TEMPLATE";
					} else if (char === "`") {
						state = "EXPR";
					}
					buffer += char;
					break;

				// ==================== 转义状态 ====================
				// 转义状态：处理转义字符，然后返回到之前的状态
				case "ESCAPE_SQ":
					buffer += char; // 添加转义后的字符
					state = "STRING_SQ"; // 回到单引号字符串状态
					break;

				case "ESCAPE_DQ":
					buffer += char;
					state = "STRING_DQ";
					break;

				case "ESCAPE_TEMPLATE":
					buffer += char;
					state = "TEMPLATE";
					break;

				case "ESCAPE_EXPR":
					buffer += char;
					state = "EXPR";
					break;
			}

			// 移动到下一个字符
			pos++;
		}

		// ==================== 后处理 ====================
		// 处理扫描结束后缓冲区中剩余的内容
		if (buffer.length > 0) {
			if (state === "TEXT") {
				// 剩余的文本内容
				tokens.push({ type: "text", value: buffer, start: pos - buffer.length, end: pos });
			} else {
				// 未完成的表达式，将其作为普通文本处理
				// 这里可以根据需要选择不同的错误处理策略：
				// 1. 抛出错误
				// 2. 忽略未完成的表达式
				// 3. 将其作为文本处理（当前实现）
				const incompleteExpr = this.exprStart + buffer;
				tokens.push({ type: "text", value: incompleteExpr, start: exprStartPos, end: pos });

				// 可选：输出警告
				console.warn(`警告：在位置 ${exprStartPos} 开始的表达式未正确结束`);
			}
		}

		return tokens;
	}

	/**
	 * 检查指定位置是否匹配给定的字符序列
	 * @param {number} pos - 开始检查的位置
	 * @param {string} template - 模板字符串
	 * @param {string} sequence - 要匹配的字符序列
	 * @returns {boolean} 是否匹配
	 * @private
	 */
	_isMatch(pos, template, sequence) {
		// 检查剩余长度是否足够
		if (pos + sequence.length > template.length) {
			return false;
		}

		// 逐个字符比较
		for (let i = 0; i < sequence.length; i++) {
			if (template[pos + i] !== sequence[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * 静态方法：快速解析模板
	 * @param {string} template - 模板字符串
	 * @param {Object} [options] - 配置选项
	 * @returns {Array} token 数组
	 */
	static parse(template, options) {
		const parser = new TemplateParser(options);
		return parser.parse(template);
	}
}

export { TemplateParser };
