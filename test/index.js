(function () {
  'use strict';

  var display = document.getElementById('display');

  function log(str) {
    display.innerHTML = (display.innerHTML || '') + '\n' + str;
  }

  if (typeof indexedDB === 'undefined') {
    log('This browser doesn\'t have IndexedDB.');
  } else if (window.indexedDB === null) {
    log('This browser has the Apple UIWebView bug where indexedDB is null instead of undefined.');
  } else if (typeof IDBKeyRange === 'undefined') {
    log('This browser has Samsung/HTC\'s broken version of IndexedDB (indexedDB is defined but not IDBKeyRange).')
  } else {
    testAppleBrokenIndexedDB();
  }
  
  function testAppleBrokenIndexedDB() {
    var req = indexedDB.open('test', 1);

    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      db.createObjectStore('one', {
        keyPath: 'key'
      });
      db.createObjectStore('two', {
        keyPath: 'key'
      });
    };

    req.onerror = function () {
      
    };

    req.onsuccess = function (e) {
      var db = e.target.result;
      var tx;
      try {
        tx = db.transaction(['one', 'two'], 'readwrite');
      } catch (err) {
        log('This browser has Apple\'s broken implementation of IndexedDB (can\'t open two DBs at once).');
        return;
      }

      tx.oncomplete = function (e) {
        db.close();
        log('This browser has a working implementation of IndexedDB.')
      };

      var req = tx.objectStore('two').put({
        'key': new Date().valueOf()
      });
      req.onsuccess = function (e) {
      };
      req.onerror = function () {
        
      };
    };
  }
  
})();
