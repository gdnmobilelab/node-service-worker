const ExtendableEvent = require('../worker/extendable-event');

module.exports = function(sw) {
    let installEvent = new ExtendableEvent("install");
    sw.dispatchEvent(installEvent);

    return installEvent.resolve()
    .then(() => {
        let activateEvent = new ExtendableEvent("activate");
        sw.dispatchEvent(activateEvent);
        return activateEvent.resolve();
    })
}