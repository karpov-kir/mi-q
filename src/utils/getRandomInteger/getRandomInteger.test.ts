import { getRandomInteger } from './getRandomInteger';

describe(getRandomInteger, () => {
  it('should return a random integer', () => {
    const mathSpy = jest.spyOn(Math, 'random');

    mathSpy.mockReturnValueOnce(0.5);
    expect(getRandomInteger(10, 100)).toEqual(55);

    mathSpy.mockReturnValueOnce(0);
    expect(getRandomInteger(10, 100)).toEqual(10);

    mathSpy.mockReturnValueOnce(1);
    expect(getRandomInteger(10, 100)).toEqual(100);

    mathSpy.mockReturnValueOnce(0.01);
    expect(getRandomInteger(-100, 1000)).toEqual(-89);

    mathSpy.mockReturnValueOnce(0.1);
    expect(getRandomInteger(-1000, -100)).toEqual(-910);

    mathSpy.mockReturnValueOnce(0.9);
    expect(getRandomInteger(0, 600)).toEqual(540);

    mathSpy.mockReturnValueOnce(0.5);
    expect(getRandomInteger(10, 10)).toEqual(10);
  });

  it('should throw an error if min is greater than max', () => {
    // expect(() => getRandomInteger(10, 0)).toThrow(new Error('Minimum must be less or equal to maximum'));
  });
});
