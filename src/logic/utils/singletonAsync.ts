/**
 * Decoorator to ensure async function is only executed once at a time.
 * Subsequent calls to the same method, return the previous promise.
 *
 * **Does not care about arguments - If the method is called with different arguments
 * the promise will still return the previously executing one**
 *
 * @returns decorator function
 */
export function singletonAsync(): (
  target: any,
  propertKey: string,
  descriptor: PropertyDescriptor
) => PropertyDescriptor {
  let promiseInstance;
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const methodCall = descriptor.value;

    descriptor.value = function (...params): Promise<any> {
      if (promiseInstance) return promiseInstance;

      promiseInstance = methodCall.apply(this, params);

      promiseInstance.then(() => {
        promiseInstance = null;
      });

      return promiseInstance;
    };

    return descriptor;
  };
}
