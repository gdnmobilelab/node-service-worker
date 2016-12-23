
module.exports = function(event) {
    if (!event.promiseResponse) {
        return Promise.resolve();
    }
    return event.promiseResponse;
}