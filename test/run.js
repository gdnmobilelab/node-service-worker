const {ServiceWorker, FetchEvent, installAndActivate} = require('../index');
const assert = require('assert');

let sw = new ServiceWorker({
    scriptURL: 'http://localhost/sw.js',
    scope: 'http://localhost',
    contents: `
        console.log('idb',indexedDB)
        self.addEventListener('fetch', function(ev) {
            ev.respondWith(
                "test"
            )
        })

        self.addEventListener('install', (e) => {
            console.log('dsfsdf')
            e.waitUntil(undefined)
        })
    `
});

installAndActivate(sw)
.then(() => {
    let fetchEvent = new FetchEvent('/test');

    sw.dispatchEvent(fetchEvent)

    fetchEvent.resolve()
    .then((res) => {
        sw.globalScope.console.dump();
        assert.equal(res, "test")
    })
})


