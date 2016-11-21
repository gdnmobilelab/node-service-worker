const ServiceWorker = require('../src');
const assert = require('assert');

let sw = new ServiceWorker({
    scriptURL: 'http://localhost/sw.js',
    scope: 'http://localhost',
    contents: `
        self.addEventListener('fetch', function(ev) {
            console.log(ev);
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
