const fetch = require('node-fetch');

module.exports = class FetchEvent {

    constructor(request) {
        this.type = "fetch";

        if (typeof request === "string") {
            this.request = new fetch.Request(request);
        } else {
            this.request = request;
        }
        
    }

    respondWith(val) {
        this.promiseResponse = Promise.resolve(val);
    }

    resolve() {
        if (!this.promiseResponse) {
            return Promise.resolve();
        }
        return this.promiseResponse;
    }

}