export const asPromise = <T>(val: T): Promise<T> => {
  if (val instanceof Promise) {
    return val;
  } else {
    return Promise.resolve(val);
  }
};
