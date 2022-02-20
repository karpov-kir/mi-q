export function getRandomInteger(minimum: number, maximum: number) {
  if (minimum > maximum) {
    throw new Error('Minimum must be less or equal to maximum');
  }

  const difference = maximum - minimum;
  return Math.floor(Math.random() * difference + minimum);
}
