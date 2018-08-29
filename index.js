import ObjectHash from 'object-hash';
import NodeCache from 'node-cache';

const cache = new NodeCache();
const autoUpdatedValues = [];

const handleDecorator = (cacheTTL, autoUpdate, propertyKey, descriptor) => {
  const originalFunction = descriptor.value;
  descriptor.value = function() {
    const getValueAndAddToCache = () => {
      const result = originalFunction.apply(null, arguments);
      cache.set(hash, result, cacheTTL);
      return result;
    };

    const hash = ObjectHash({ method: propertyKey, args: [...arguments]});
    let data = cache.get(hash);

    if (autoUpdate && !autoUpdatedValues.includes(hash)) {
      setInterval(getValueAndAddToCache, 1000 * cacheTTL);
      autoUpdatedValues.push(hash);
    }
    if (data === undefined) {
      data = getValueAndAddToCache();
    }

    return data;
  };

  return descriptor;
};

const handleNonDecorator = (cacheTTL, autoUpdate, methodName, target) => {
  if (!methodName) {
    throw new Error('Name option is required, when using a non-named function with decorator-cache');
  }
  const originalFunction = target;

  const result = function() {
    const getValueAndAddToCache = () => {
      const result = originalFunction(...arguments);
      cache.set(hash, result, cacheTTL);
      return result;
    };
    const hash = ObjectHash({ method: originalFunction.name, args: [...arguments]});
    let data = cache.get(hash);
    if (autoUpdate && !autoUpdatedValues.includes(hash)) {
      setInterval(getValueAndAddToCache, 1000 * cacheTTL);
      autoUpdatedValues.push(hash);
    }
    if (data === undefined) {
      data = getValueAndAddToCache();
    }

    return data;
  }

  return result;
};

export const cached = ({ cacheTTL = 10, autoUpdate = false, name } = {}) => (target, propertyKey, descriptor) => {
  let result;
  if (typeof(target) === 'function') {
    result = handleNonDecorator(cacheTTL, autoUpdate, name || target.name, target);
  } else {
    result = handleDecorator(cacheTTL, autoUpdate, propertyKey, descriptor);
  }

  return result;
}

export default {
  cached,
}