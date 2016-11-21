const ServiceWorkerGlobalScope = require('./serviceworker-global-scope');
const getAllKeys = require('./util/get-all-keys');
const FetchEvent = require('./fetchevent');

module.exports = class ServiceWorker {
    
    constructor({scriptURL, scope, contents}) {
        this.globalScope = new ServiceWorkerGlobalScope();
        this.globalScope.registration.scope = scope;

        let keysToApplyToGlobal = getAllKeys(this.globalScope);
        let objectsToApplyToGlobal = keysToApplyToGlobal.map((key) => this.globalScope[key]);

        // We need to manually add self to this list
        keysToApplyToGlobal.unshift("self");
        objectsToApplyToGlobal.unshift(this.globalScope);

        let swCreatorFunction = Function.apply(null, keysToApplyToGlobal.concat(contents));
        
        swCreatorFunction.apply(null, objectsToApplyToGlobal);
    }

    dispatchFetchEvent(url) {
        let fetchEvent = new FetchEvent(url);

        this.globalScope.dispatchEvent(fetchEvent);

        return fetchEvent.resolve()
    }

}