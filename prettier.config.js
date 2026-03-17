/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const prettierConfig = {
	plugins: ["prettier-plugin-tailwindcss"],
	useTabs: true,
	tabWidth: 4,
	printWidth: 250,
	bracketSpacing: false,
	singleAttributePerLine: true,
	embeddedLanguageFormatting: "off",
};
export default prettierConfig;
