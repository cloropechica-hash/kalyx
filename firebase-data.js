// ==================== FIREBASE DATA LAYER ====================

var fbAuth = firebase.auth();
var fbDb = firebase.firestore();
fbDb.settings({ merge: true });

window.__fbCache = {};
window.__fbLoaded = false;
window.__fbUser = null;
window.__fbUnsubscribe = null;
window.__fbAuthListener = null;

function getUid() {
  var user = fbAuth.currentUser;
  return user ? user.uid : null;
}

function initFirebase(callback) {
  if (window.__fbAuthListener) {
    window.__fbAuthListener();
    window.__fbAuthListener = null;
  }

  window.__fbAuthListener = fbAuth.onAuthStateChanged(function(user) {
    if (user && !window.__fbRegistering) {
      window.__fbUser = { uid: user.uid, email: user.email };
      loadFBData(user.uid, function(err) {
        fbSubscribe(user.uid);
        if (!window.__fbInitialized && callback) {
          window.__fbInitialized = true;
          callback(err, window.__fbUser);
        }
      });
    } else if (!user) {
      window.__fbUser = null;
      window.__fbCache = {};
      window.__fbLoaded = false;
      if (window.__fbUnsubscribe) {
        window.__fbUnsubscribe();
        window.__fbUnsubscribe = null;
      }
      if (!window.__fbInitialized && callback) {
        window.__fbInitialized = true;
        callback(null, null);
      }
    }
  });

  // Check existing user immediately
  var currentUser = fbAuth.currentUser;
  if (currentUser) {
    window.__fbUser = { uid: currentUser.uid, email: currentUser.email };
    loadFBData(currentUser.uid, function(err) {
      fbSubscribe(currentUser.uid);
      if (callback) {
        window.__fbInitialized = true;
        callback(err, window.__fbUser);
      }
    });
  } else if (callback) {
    window.__fbInitialized = true;
    callback(null, null);
  }
}

function loadFBData(uid, callback) {
  function getUsernameFromSession() {
    var session = JSON.parse(localStorage.getItem('session') || 'null');
    return session ? session.username : null;
  }

  function fallbackToLocalStorage() {
    var username = getUsernameFromSession();
    if (!username) {
      window.__fbCache = {};
      window.__fbLoaded = true;
      if (callback) callback();
      return;
    }
    var cache = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k) continue;
      var suffix = '_' + username;
      if (k.endsWith(suffix)) {
        try {
          var val = JSON.parse(localStorage.getItem(k));
          var key = k.slice(0, -suffix.length);
          cache[key] = val;
        } catch(e) {}
      }
    }
    window.__fbCache = cache;
    window.__fbLoaded = true;
    if (callback) callback();
  }

  if (!uid || !fbDb) {
    fallbackToLocalStorage();
    return;
  }

  fbDb.collection('users').doc(uid).get().then(function(doc) {
    if (doc.exists) {
      var data = doc.data().data || {};
      window.__fbCache = data;
      window.__fbLoaded = true;
      var username = data.profile ? data.profile.username : null;
      if (username) {
        mergeLocalToCache(username);
        syncCacheToLocalStorage(username);
      }
      if (callback) callback();
    } else {
      window.__fbCache = {};
      window.__fbLoaded = true;
      var username = getUsernameFromSession();
      if (username) migrateLocalStorageNoReload(uid, username);
      if (callback) callback();
    }
  }).catch(function(err) {
    console.error('Firestore load error:', err);
    fallbackToLocalStorage();
  });
}

function mergeLocalToCache(username) {
  if (!username) return;
  var cache = window.__fbCache || {};
  var suffix = '_' + username;
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (!k) continue;
    if (k.endsWith(suffix)) {
      try {
        var val = JSON.parse(localStorage.getItem(k));
        var key = k.slice(0, -suffix.length);
        if (!cache[key] || (Array.isArray(cache[key]) && cache[key].length === 0)) {
          cache[key] = val;
        }
      } catch(e) {}
    }
  }
  window.__fbCache = cache;
}

function fbSubscribe(uid, onUpdate) {
  if (window.__fbUnsubscribe) {
    window.__fbUnsubscribe();
    window.__fbUnsubscribe = null;
  }

  if (!uid || !fbDb) return;

  window.__fbUnsubscribe = fbDb.collection('users').doc(uid)
    .onSnapshot(function(doc) {
      if (doc.exists) {
        var incoming = doc.data().data || {};
        var merged = {};
        if (window.__fbCache && Object.keys(window.__fbCache).length > 0) {
          for (var k in window.__fbCache) {
            if (window.__fbCache.hasOwnProperty(k)) merged[k] = window.__fbCache[k];
          }
        }
        for (var k in incoming) {
          if (incoming.hasOwnProperty(k)) merged[k] = incoming[k];
        }
        window.__fbCache = merged;
        window.__fbLoaded = true;
        var username = incoming.profile ? incoming.profile.username : null;
        if (!username && merged.profile) username = merged.profile.username;
        if (username) syncCacheToLocalStorage(username);
        if (onUpdate) onUpdate(merged);
        if (window.__fbOnUpdate) window.__fbOnUpdate(merged);
      }
    }, function(err) {
      console.error('Firestore snapshot error:', err);
    });
}

function syncCacheToLocalStorage(username) {
  if (!username) return;
  var cache = window.__fbCache || {};
  if (cache.tasks) localStorage.setItem('tasks_' + username, JSON.stringify(cache.tasks));
  if (cache.shared_tasks) localStorage.setItem('shared_tasks_' + username, JSON.stringify(cache.shared_tasks));
  if (cache.plans) localStorage.setItem('plans_' + username, JSON.stringify(cache.plans));
  if (cache.dailylog) localStorage.setItem('dailylog_' + username, JSON.stringify(cache.dailylog));
  if (cache.trips) localStorage.setItem('trips_' + username, JSON.stringify(cache.trips));
  if (cache.milestones) localStorage.setItem('milestones_' + username, JSON.stringify(cache.milestones));
  Object.keys(cache).forEach(function(k) {
    if (k.indexOf('it_') === 0) {
      localStorage.setItem(k + '_' + username, JSON.stringify(cache[k]));
    }
  });
}

function saveFB(key, data, callback) {
  window.__fbCache[key] = data;
  saveFBFull(callback);
}

function saveFBFull(callback) {
  var username = window.__fbCache && window.__fbCache.profile ? window.__fbCache.profile.username : null;
  if (username) syncCacheToLocalStorage(username);

  var user = fbAuth.currentUser;
  if (!user) {
    if (callback) callback('Not authenticated');
    return;
  }

  fbDb.collection('users').doc(user.uid).set({
    data: window.__fbCache,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).then(function() {
    if (callback) callback();
  }).catch(function(err) {
    console.error('Firestore save error:', err);
    if (callback) callback(err);
  });
}

function fbOnUpdate(callback) {
  window.__fbOnUpdate = callback;
}

function getFB(key) {
  if (!window.__fbLoaded) return null;
  return window.__fbCache[key];
}

// ==================== SESSION HELPERS ====================

function fbGetSession() {
  return JSON.parse(localStorage.getItem('session') || 'null');
}

function fbSaveSession(data) {
  localStorage.setItem('session', JSON.stringify(data));
}

function fbClearSession() {
  localStorage.removeItem('session');
}

// ==================== MIGRATION ====================

function migrateLocalStorageNoReload(uid, username) {
  if (!username) return;
  var migrated = {};
  var count = 0;
  var keys = [];
  for (var i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }
  var userKeys = keys.filter(function(k) {
    return k.indexOf('tasks_' + username) === 0 ||
           k.indexOf('plans_' + username) === 0 ||
           k.indexOf('shared_tasks_' + username) === 0 ||
           k.indexOf('milestones_' + username) === 0 ||
           k.indexOf('dailylog_' + username) === 0 ||
           k.indexOf('trips_' + username) === 0 ||
           (k.indexOf('it_') === 0 && k.indexOf('_' + username) > 0);
  });
  var flags = keys.filter(function(k) {
    return k === 'welcome_' + username || k === 'tutorial_' + username;
  });
  userKeys.forEach(function(k) {
    try {
      var val = JSON.parse(localStorage.getItem(k));
      if (Array.isArray(val) && val.length > 0) {
        var suffix = '_' + username;
        var fbKey = k.endsWith(suffix) ? k.slice(0, -suffix.length) : k;
        migrated[fbKey] = val;
        count++;
      }
    } catch(e) {}
  });
  flags.forEach(function(k) {
    migrated[k] = localStorage.getItem(k);
    count++;
  });
  if (count > 0) {
    if (!uid) return;
    fbDb.collection('users').doc(uid).set({
      data: migrated,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(function() {
      console.log('Migrated ' + count + ' localStorage keys to Firestore.');
    }).catch(function(err) {
      console.error('Background migration error:', err);
    });
  }
}

function migrateLocalStorage(uid, callback) {
  var migrated = {};
  var count = 0;
  var keys = [];
  for (var i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }
  var session = JSON.parse(localStorage.getItem('session') || 'null');
  var username = session ? session.username : null;
  if (!username) {
    if (callback) callback();
    return;
  }
  var userKeys = keys.filter(function(k) {
    return k.indexOf('tasks_' + username) === 0 ||
           k.indexOf('plans_' + username) === 0 ||
           k.indexOf('milestones_' + username) === 0 ||
           k.indexOf('dailylog_' + username) === 0 ||
           k.indexOf('trips_' + username) === 0 ||
           k.indexOf('it_') === 0 && k.indexOf('_' + username) > 0;
  });
  var flags = keys.filter(function(k) {
    return k === 'welcome_' + username || k === 'tutorial_' + username;
  });
  userKeys.forEach(function(k) {
    try {
      var val = JSON.parse(localStorage.getItem(k));
      if (Array.isArray(val) && val.length > 0) {
        var suffix = '_' + username;
        var fbKey = k.endsWith(suffix) ? k.slice(0, -suffix.length) : k;
        migrated[fbKey] = val;
        count++;
      }
    } catch(e) {}
  });
  flags.forEach(function(k) {
    migrated[k] = localStorage.getItem(k);
    count++;
  });
  if (count > 0) {
    if (!uid) {
      if (callback) callback('No UID');
      return;
    }
    fbDb.collection('users').doc(uid).set({
      data: migrated,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(function() {
      console.log('Migrated ' + count + ' localStorage keys to Firestore.');
      loadFBData(uid, callback);
    }).catch(function(err) {
      console.error('Migration error:', err);
      if (callback) callback(err);
    });
  } else {
    if (callback) callback();
  }
}

// ==================== FIREBASE AUTH WRAPPERS ====================

function fbLogin(email, password, callback) {
  fbAuth.signInWithEmailAndPassword(email, password)
    .then(function(result) {
      var user = result.user;
      window.__fbUser = { uid: user.uid, email: user.email };

      // Get display name from user profile
      fbDb.collection('users').doc(user.uid).get().then(function(doc) {
        var profile = {};
        if (doc.exists) {
          var data = doc.data().data || {};
          profile = data.profile || {};
        }

        var localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        var localUser = localUsers.find(function(u) { return u.email === user.email; });

        var username = profile.username || (localUser ? localUser.username : null) || user.email.split('@')[0];
        var name = profile.name || (localUser ? localUser.name : null) || username;
        var role = profile.role || (localUser ? localUser.role : null) || 'executive_path';
        var isAdmin = profile.isAdmin || (localUser ? localUser.isAdmin : false) || false;

        var session = {
          username: username,
          name: name,
          email: user.email,
          isAdmin: isAdmin,
          role: role,
          firebaseUid: user.uid,
          loggedIn: true,
          timestamp: Date.now()
        };
        fbSaveSession(session);

        // Sync profile to Firestore
        fbDb.collection('users').doc(user.uid).set({
          data: { profile: { username: username, name: name, email: user.email, role: role, isAdmin: isAdmin } }
        }, { merge: true }).catch(function(e) { console.error('Profile sync error:', e); });

        loadFBData(user.uid, function() {
          if (callback) callback(null, session);
        });
      }).catch(function() {
        // Fallback - continue kahit walang Firestore data
        var session = {
          username: user.email.split('@')[0],
          name: user.email.split('@')[0],
          email: user.email,
          isAdmin: false,
          role: 'executive_path',
          firebaseUid: user.uid,
          loggedIn: true,
          timestamp: Date.now()
        };
        fbSaveSession(session);
        if (callback) callback(null, session);
      });
    })
    .catch(function(err) {
      if (callback) callback(err);
    });
}

function fbRegister(email, password, profile, callback) {
  window.__fbRegistering = true;

  fbAuth.createUserWithEmailAndPassword(email, password)
    .then(function(result) {
      var uid = result.user.uid;

      var userProfile = {
        username: profile.username,
        name: profile.name,
        email: email,
        role: profile.role || 'executive_task',
        isAdmin: profile.isAdmin || false
      };

      var userData = { profile: userProfile };

      fbDb.collection('users').doc(uid).set({
        data: userData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        localStorage.setItem('welcome_' + profile.username, 'true');
        window.__fbRegistering = false;
        if (callback) callback(null, { username: profile.username, name: profile.name, role: profile.role });
      }).catch(function(err) {
        console.error('Firestore userdata write error:', err);
        window.__fbRegistering = false;
        if (callback) callback(err);
      });
    })
    .catch(function(err) {
      window.__fbRegistering = false;
      if (callback) callback(err);
    });
}

function fbLogout(callback) {
  window.__fbLoggingOut = true;
  fbClearSession();
  window.__fbCache = {};
  window.__fbLoaded = false;
  window.__fbUser = null;

  if (window.__fbUnsubscribe) {
    window.__fbUnsubscribe();
    window.__fbUnsubscribe = null;
  }

  fbAuth.signOut()
    .then(function() {
      if (window.__fbAuthListener) {
        window.__fbAuthListener();
        window.__fbAuthListener = null;
      }
      window.__fbLoggingOut = false;
      if (callback) callback();
    })
    .catch(function(err) {
      window.__fbLoggingOut = false;
      if (callback) callback(err);
    });
}
