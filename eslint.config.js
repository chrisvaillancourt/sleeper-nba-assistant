import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactCompiler from 'eslint-plugin-react-compiler';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	reactPlugin.configs.flat.recommended,
	reactPlugin.configs.flat['jsx-runtime'],
	{
		settings: {
			// had to be in a separate object to fix cli warning
			react: {
				version: 'detect',
			},
		},
	},
	{
		ignores: ['dist'],
		files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
		...jsxA11yPlugin.flatConfigs.recommended,
		languageOptions: {
			...jsxA11yPlugin.flatConfigs.recommended.languageOptions,
			...reactPlugin.configs.flat.recommended.languageOptions,
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			'react-refresh': reactRefresh,
			'react-compiler': reactCompiler,
		},
		rules: {
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'react-compiler/react-compiler': 'error',
		},
	},
	// hack, can remove after https://github.com/facebook/react/issues/28313 is resolved
	// https://github.com/facebook/react/pull/30774#issuecomment-2599121764
	{
		plugins: {
			// @ts-expect-error see above comment about related issue
			'react-hooks': reactHooksPlugin,
		},
		// @ts-expect-error see above comment about related issue
		rules: { ...reactHooksPlugin.configs.recommended.rules },
	},
	eslintConfigPrettier,
);
