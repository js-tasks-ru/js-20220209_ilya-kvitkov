/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return "";
  }
  if (!size) {
    return string;
  }
  const splitedArray = string.split("");
  let counter = 0;
  const newArray = splitedArray.map((item, index) => {
    const nextIsEqual = splitedArray[index + 1] !== splitedArray[index];
    if (counter < size) {
      ++counter;
      if (nextIsEqual) {
        counter = 0;
      }
      return item;
    }
    if (nextIsEqual) {
      counter = 0;
    }
  });
  return newArray.join("");
}