export declare class Evaluator {
	constructor(variables: unknown);

	static evaluate<T = unknown>(expression: string, variables: unknown): T;

	evaluate<T = unknown>(expression: string): T;
}
