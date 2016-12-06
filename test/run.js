const ServiceWorker = require('../index');
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
    `
});

sw.dispatchFetchEvent('/test')
.then((res) => {
    assert.equal(res, "test")
})
