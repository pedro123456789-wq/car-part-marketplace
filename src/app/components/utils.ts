/**
 * Given start value, end value and interval return list of all of the values in the range
 */
export const getRange = (
  startValue: number,
  endValue: number,
  interval: number
) => {
  let output = [];
  for (let i = startValue; i <= endValue; i += interval) {
    output.push(i);
  }
  return output;
};
