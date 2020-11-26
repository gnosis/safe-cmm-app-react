export const asPromise = (val: any): Promise<any> => {
  if (val instanceof Promise) {
    return val;
  } else {
    return Promise.resolve(val);
  }
};
