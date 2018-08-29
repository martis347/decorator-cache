# Decorator Cache 🐱‍👤

A wrapper for [node-cache](https://github.com/mpneuried/nodecache) which can be used as a decorator (but not only!) to cache the response of a method.
It fully works with promises/async functions. If there is a pending Promise, a new one will **not** be created, thus saving _precious_ resources.

## Use cases
The primary use case for this library was to enable caching of long running and expensive server-side requests without introducing a lot of complexity to the codebase.

## Installing

To install simply run:
```
npm install --save decorator-cache
```

## Examples

It should be pretty obvious that you use `decorator-cache` as a decorator ✨.

(To use decorators you will need [Babel](https://github.com/babel/babel), but you already have that anyway, don't you?)

```javascript
import { cached } from 'decorator-cache';

class ExampleClass {
    @cached({ cacheTTL: 60 })
    expensiveOperation(param1, param2) {
        const result = `${param1} + ${param2}`; // whatever you want to cache
        return result;
    }
    
    @cached({ cacheTTL: 60 })
    async expensiveOperation(param1, param2) {
        const result = await axios.get('https://...'); // whatever you want to cache
        return result;
    }
    
    @cached({ cacheTTL: 60, autoUpdate: true })
    expensiveOperationThatShouldAlwaysBePresent(param1) {
        const result = `This will auto update, so you never have to wait! Isn't that ${param1}`; // whatever you want to cache
        return result;
    }
}
```
### Hold up! That's not it!
In those cases, when you want to decorate a simple method, that is not within a class, you can use the same method!
```javascript
import { cached } from 'decorator-cache';

const myMethod = cached({ cacheTTL: 10, name: 'myMethod' })(() => { // Name parameter is required, when using a non-named function
    const result = await axios.get('https://...'); // whatever you want to cache
    return result;
});

const myNamedMethod = cached({ cacheTTL: 10 })(function namedMethod() { // Name parameter is not required
    const result = await axios.get('https://...'); // whatever you want to cache
    return result;
})
```

### Options
There's not much you need to worry about:

`cacheTTL` _(default: 10)_ - time in **seconds** for how long the result will be cached,

`autoUpdate` _(default: false)_ - should the value be auto updated when the cache expires. Setting this to true will invoke the method every `cacheTTL` seconds and will update the cache.

`name` _(default: undefined)_ - required **only** if using non-decorator approach for a *non-named* method.

**Note**:  Bear in mind, that `autoUpdate` will execute for each different parameters combination, that was invoked after starting up the application. If there can be **lots** of different combinations - I generally do not suggest using this option, as that might lead to self-destruct 😊

### Implementation details

+ `decorator-cache` is using [object-hash](https://github.com/puleos/object-hash) to hash the parameters of the invoked method. So for each different combination of parameters a hash is generated and a cache record is added using this hash as a key.
+ Cache instance is global for all methods. After a record expires it is deleted from the cache.
+ Promises **are** supported 🙌.

## Authors

* **Martynas** - *Initial work* - [LinkedIn](https://www.linkedin.com/in/martynas-kanapinskas/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

