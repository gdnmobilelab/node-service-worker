const getAllKeys = require('./get-all-keys');

module.exports = function(obj, functionContents) {
    // We need to grab items from our globalScope object and apply them to the 
    // actual global scope the worker will run in.
    let keysToApplyToGlobal = getAllKeys(obj);
    let objectsToApplyToGlobal = keysToApplyToGlobal.map((key) => {

        if (typeof obj[key] === "function") {
            // If it's a function we want to ensure that it stays bound
            // to the global scope object.
            return obj[key].bind(obj);
        } else {
            return obj[key];
        }
        
    });
    
    // global shouldn't matter, but
    // if we don't redefine it, the worker can access the Node global scope?
    keysToApplyToGlobal.unshift("global");
    objectsToApplyToGlobal.unshift(undefined);

    // The last argument of the Function constructor is the content of the function itself
    // so we append it
    
    let swCreatorFunction = Function.apply(null, keysToApplyToGlobal.concat(functionContents));
    swCreatorFunction.apply(obj, objectsToApplyToGlobal);
}