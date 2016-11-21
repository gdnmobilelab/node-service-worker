const ServiceWorkerGlobalScope = require('./worker/serviceworker-global-scope');
const getAllKeys = require('./util/get-all-keys');
const FetchEvent = require('./worker/fetchevent');
const url = require('url');

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

    dispatchFetchEvent(urlToLoad) {

        urlToLoad = url.resolve(this.globalScope.registration.scope, urlToLoad)
        let request = new this.globalScope.Request(urlToLoad)
        let fetchEvent = new FetchEvent(request);
        
        this.globalScope.dispatchEvent(fetchEvent);
        return fetchEvent.resolve()
    }

}