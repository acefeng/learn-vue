import babel from "rollup-plugin-babel";
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from "./package.json";
import path from "path";
import dts from "rollup-plugin-dts";

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}
const resolve = (...args) => path.resolve(...args);
const extensions = [".ts"];
const babelRuntimeVersion = pkg.dependencies["@babel/runtime"].replace(
    /^[^0-9]*/,
    ""
);
const makeExternalPredicate = (externalArr) => {
    if (externalArr.length === 0) {
        return () => false;
    }
    const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
    return (id) => pattern.test(id);
};

const resultConfig = !production ? {
	// 开发环境下配置
	input: 'src/index.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		// 开发环境下就先这样吧。没有import这里一类的引用，直接挂window上执行吧
		name: '__MINI_VUE__',
		file: 'public/build/mini-vue.js'
	},
	plugins: [
		nodeResolve({
			browser: true,
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),
		serve(),
		livereload('public'),
	],
	watch: {
		clearScreen: false
	}
} : [{
	input: "src/index.ts",
	output: {
		file: "es/mini-vue.js",
		format: "es",
		indent: false,
	},
	external: makeExternalPredicate([
		...Object.keys(pkg.dependencies || {}),
	]),
	plugins: [
		nodeResolve({
			extensions,
			browser: true,
		}),
		typescript({ sourceMap: false }),
		babel({
			exclude: "node_modules/**",
			plugins: [
				[
					"@babel/plugin-transform-runtime",
					{ version: babelRuntimeVersion, useESModules: true },
				],
			],
		}),
	],
},
{
	input: "src/index.ts",
	output: {
		file: "lib/mini-vue.js",
		format: "cjs",
		indent: false,
	},
	external: makeExternalPredicate([
		...Object.keys(pkg.dependencies || {}),
	]),
	plugins: [
		nodeResolve({
			extensions,
			browser: true,
		}),
		typescript({
			sourceMap: false,
		}),
		babel({
			exclude: "node_modules/**",
			plugins: [
				[
					"@babel/plugin-transform-runtime",
					{ version: babelRuntimeVersion },
				],
			],
		}),
		terser(),
	],
},
{
	input: "./src/index.ts",
	output: {
		file: resolve("./", pkg.types),
		format: "es",
	},
	plugins: [dts()],
}]

export default resultConfig;
