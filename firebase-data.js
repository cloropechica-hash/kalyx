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
  function fallback() {
    window.__fbCache = {};
    window.__fbLoaded = true;
    if (callback) callback();
  }

  if (!uid || !fbDb) { fallback(); return; }

  fbDb.collection('users').doc(uid).get().then(function(doc) {
    var data = doc.exists ? (doc.data().data || {}) : {};
    window.__fbCache = data;
    window.__fbLoaded = true;
    if (callback) callback();
  }).catch(function(err) {
    console.error('Firestore load error:', err);
    fallback();
  });
}

function fbSubscribe(uid, onUpdate) {
  if (window.__fbUnsubscribe) {
    window.__fbUnsubscribe();
    window.__fbUnsubscribe = null;
  }

  if (!uid || !fbDb) return;

  window.__fbUnsubscribe = fbDb.collection('users').doc(uid)
    .onSnapshot(function(doc) {
      window.__fbCache = doc.exists ? (doc.data().data || {}) : {};
      window.__fbLoaded = true;
      if (onUpdate) onUpdate(window.__fbCache);
      if (window.__fbOnUpdate) window.__fbOnUpdate(window.__fbCache);
    }, function(err) {
      console.error('Firestore snapshot error:', err);
    });
}

function waitForFB() {
  return new Promise(function(resolve) {
    if (window.__fbLoaded) { resolve(window.__fbCache); return; }
    var check = setInterval(function() {
      if (window.__fbLoaded) { clearInterval(check); resolve(window.__fbCache); }
    }, 50);
    setTimeout(function() { clearInterval(check); resolve(window.__fbCache || {}); }, 10000);
  });
}



function saveFB(key, data, callback) {
  window.__fbCache[key] = data;
  saveFBFull(callback);
}

function saveFBFull(callback) {
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

        var username = profile.username || user.email.split('@')[0];
        var name = profile.name || username;
        var role = profile.role || 'executive_path';
        var isAdmin = profile.isAdmin || false;
        if (user.email === 'admin@kalyx.com') { role = 'admin'; isAdmin = true; }

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
        var fbRole = 'executive_path';
        var fbIsAdmin = false;
        if (user.email === 'admin@kalyx.com') { fbRole = 'admin'; fbIsAdmin = true; }
        var session = {
          username: user.email.split('@')[0],
          name: user.email.split('@')[0],
          email: user.email,
          isAdmin: fbIsAdmin,
          role: fbRole,
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
