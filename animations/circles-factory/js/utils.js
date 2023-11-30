const polyEaseIn = (t, n = 5) => t ** n;
const polyEaseOut = (t, n = 5) => 1 - (1 - t) ** n;
const polyEaseInOut = (t, n = 5) => {
  if (t < 0.5) return 2 ** (n - 1) * t ** n;
  return 1 - 2 ** (n - 1) * (1 - t) ** n;
};
const trigEaseInOut = (t, n = 5) => Math.sin(t * Math.PI) ** n;

export { polyEaseIn, polyEaseOut, polyEaseInOut, trigEaseInOut };
