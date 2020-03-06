/** Will remove char from the start of searchString
 * @param {string} aString - the string literal to remove character from
 * @param {string} char - character to remove from aString
*/
export const trimStart = (aString: string, char: string): string => {
  return aString.replace(new RegExp('^[' + char + ']+'), '');
};
