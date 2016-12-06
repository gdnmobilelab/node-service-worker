module.exports = class ExtendableEvent {

    constructor(type, data) {
        this.type = type;
        Object.assign(this, data);
    }

    waitUntil(val) {
        this.promiseResponse = Promise.resolve(val);
    }

    resolve() {
        if (!this.promiseResponse) {
            return Promise.resolve();
        }
        return this.promiseResponse;
    }

}