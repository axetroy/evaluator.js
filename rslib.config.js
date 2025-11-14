import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@rslib/core";

class RspackDtsCopyPlugin {
	/**
	 *
	 * @param {import('@rspack/core').Compiler} compiler
	 */
	apply(compiler) {
		const projectDir = compiler.context;

		compiler.hooks.emit.tapPromise("RspackDtsCopyPlugin", async (compilation) => {
			const target = path.join(projectDir, "src/index.d.ts");

			compilation.emitAsset("esm/index.d.mts", new compiler.webpack.sources.RawSource(await fs.promises.readFile(target, "utf8")));

			compilation.emitAsset("cjs/index.d.cts", new compiler.webpack.sources.RawSource(await fs.promises.readFile(target, "utf8")));
		});
	}
}

export default defineConfig({
	source: {
		entry: {
			index: "src/index.js",
		},
	},
	lib: [
		{
			format: "esm",
			syntax: "es5",
			output: {
				sourceMap: true,
				filename: {
					js: "[name].mjs",
				},
				distPath: {
					js: "esm",
				},
			},
		},
		{
			format: "cjs",
			syntax: "es5",
			output: {
				sourceMap: true,
				filename: {
					js: "[name].cjs",
				},
				distPath: {
					js: "cjs",
				},
			},
		},
	],
	output: {
		target: "node",
	},
	tools: {
		rspack: {
			plugins: [new RspackDtsCopyPlugin()],
		},
	},
});
