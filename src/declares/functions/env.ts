global.env = (key: keyof typeof process.env): string | undefined => {
  const value = process.env[key];
  // if (!value) throw new Error(`The env ${key} is not defined`);
  return value;
};
