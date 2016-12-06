module.exports = function(target) {
    target.indexedDB = require('fake-indexeddb');
    target.IDBCursor = require('fake-indexeddb/lib/FDBCursor');
    target.IDBCursorWithValue = require('fake-indexeddb/lib/FDBCursorWithValue');
    target.IDBDatabase = require('fake-indexeddb/lib/FDBDatabase');
    target.IDBFactory = require('fake-indexeddb/lib/FDBFactory');
    target.IDBIndex = require('fake-indexeddb/lib/FDBIndex');
    target.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
    target.IDBObjectStore = require('fake-indexeddb/lib/FDBObjectStore');
    target.IDBOpenDBRequest = require('fake-indexeddb/lib/FDBOpenDBRequest');
    target.IDBRequest = require('fake-indexeddb/lib/FDBRequest');
    target.IDBTransaction = require('fake-indexeddb/lib/FDBTransaction');
    target.IDBVersionChangeEvent = require('fake-indexeddb/lib/FDBVersionChangeEvent');
}