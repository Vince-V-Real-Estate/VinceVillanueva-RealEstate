/**
 * Counts the number of non-empty words in a string.
 * @param {string} value - The string to evaluate.
 * @returns {number} The total number of words found in the string.
 */
export function countWords(value: string): number {
	return value.trim().split(/\s+/).filter(Boolean).length;
}
