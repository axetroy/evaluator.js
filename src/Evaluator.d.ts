export declare class Evaluator {
	constructor(variables: unknown);

	evaluate<T = unknown>(expression: string): T;
}
