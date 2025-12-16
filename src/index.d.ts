declare function replace(sourceText: string, patches: Array<{ path: string; value: string }>): string;

export { replace };

interface JSONCTS {
	replace: typeof replace;
}

declare const jsoncts: JSONCTS;

export default jsoncts;
