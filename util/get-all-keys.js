const getAllKeys = function(obj, nextLevelUp = []) {
    let keysOfThisObject = Reflect.ownKeys(obj);
    let withExisting = keysOfThisObject.concat(nextLevelUp);

    let prototype = Object.getPrototypeOf(obj);

    // We stop at Object.prototype because we don't want to define Object generic stuff
    if (prototype && prototype !== Object.prototype) {
        return getAllKeys(prototype, withExisting);
    }
    
    return withExisting.filter((w) => w !== "constructor" && w.substr(0,1) !== "_");
}

module.exports = getAllKeys;