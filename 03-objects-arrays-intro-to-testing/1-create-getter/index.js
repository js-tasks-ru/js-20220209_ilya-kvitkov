/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const array = path.split(".");
  return (props) => { 
    let value = props;
    array.forEach((item, index) => {
      if (value) {
        value = value[array[index]];
      }
    });
    return value;
  };
}
