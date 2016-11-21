const ServiceWorker = require('../src');
const assert = require('assert');

let sw = new ServiceWorker('http://localhost/sw.js', 'http://localhost', `

    self.addEventListener('fetch', function(ev) {
        ev.respondWith(
            "test"
        )
    })

`)

sw.dispatchFetchEvent('/test')
.then((res) => {
    assert.equal(res, "test")
})
