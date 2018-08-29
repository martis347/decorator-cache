import ObjectHash from 'object-hash';
import NodeCache from 'node-cache';

const cache = new NodeCache();
const autoUpdatedValues = [];

export const cached = ({ cacheTTL = 10, autoUpdate = false } = {}) => (_, propertyKey, descriptor) => {
  var originalFunction = descriptor.value;
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
}

export default {
  cached,
}