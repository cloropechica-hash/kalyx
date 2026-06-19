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

// ==================== ENHANCEMENT: NOTIFICATIONS ====================
var _notifySound = null;
function initNotifySound() {
  try {
    _notifySound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f39/f3+AgH9/f3+AgH+Af3+AgH+Af3+AgH9/f39/f39/gH9/f39/gH9/f3+AgH9/f39/f3+AgH9/f3+AgH+Af3+AgH+Af39/gH9/f39/f3+AgH9/f39/gH9/f3+AgH+Af3+AgH+Af3+AgH9/f39/f3+Af39/f3+AgH9/f39/gH9/f3+AgH+Af39/gH9/f3+AgH+Af3+AgH+Af39/gH9/f39/f3+Af39/f3+AgH9/f39/gH9/f3+AgH9/f39/f3+AgH9/f39/gH9/f3+AgH+Af3+AgH9/f3+AgH9/f39/f3+AgH9/f3+AgH9/f3+AgH9/f39/f3+Af39/f3+AgH9/f39/gH9/f3+AgH9/f39/f3+AgH+Af3+AgH9/f39/f3+Af39/f39/gH9/f39/gH9/f3+AgH+Af39/gH9/f39/f3+Af39/f3+AgH9/f39/gH9/f39/gH9/f39/f3+AgH9/f39/gH9/f3+AgH+Af3+AgH9/f39/gH9/f39/f3+AgH9/f39/gH9/f39/gH9/f39/f39/gH9/f39/gH9/f39/gH9/f39/f39/f39/f39/f39/f39/f39/gH9/f39/f39/f39/f39/f39/gH9/f39/f39/f39/f39/gH9/f39/f39/f39/f39/f39/gH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/gH9/f39/f39/f39/f39/f39/gH9/f39/f39/f39/f39/gH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/gH9/f39/f39/f39/f39/f39/f39/gH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/g');
  } catch(e) {}
}
function playNotify() {
  try {
    if (!_notifySound) initNotifySound();
    _notifySound.currentTime = 0;
    _notifySound.play().catch(function(){});
  } catch(e) {}
}
function showToast(msg, type, duration) {
  type = type || 'info'; duration = duration || 4000;
  var colors = { info: 'bg-blue-600', success: 'bg-emerald-600', warning: 'bg-amber-600', error: 'bg-red-600' };
  var icons = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' };
  var c = document.getElementById('kalyx-toast');
  if (!c) { c = document.createElement('div'); c.id = 'kalyx-toast'; c.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm'; document.body.appendChild(c); }
  var t = document.createElement('div');
  t.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ' + (colors[type]||colors.info) + ' translate-x-full opacity-0 transition-all duration-300';
  t.innerHTML = '<span class="material-symbols-outlined text-lg">' + (icons[type]||icons.info) + '</span><span>' + msg + '</span>';
  c.appendChild(t);
  requestAnimationFrame(function(){ t.classList.remove('translate-x-full','opacity-0'); });
  setTimeout(function(){ t.classList.add('translate-x-full','opacity-0'); setTimeout(function(){ t.remove(); },300); }, duration);
}

// ==================== ENHANCEMENT: AUDIT TRAIL ====================
var _auditQ = [];
var _auditT = null;
function audit(action, details) {
  var s = JSON.parse(localStorage.getItem('session')||'{}');
  if (!s.loggedIn) return;
  _auditQ.push({ action: action, details: typeof details==='object'?JSON.stringify(details):String(details||''), username: s.username||'?', role: s.role||'?', timestamp: new Date().toISOString() });
  if (_auditQ.length >= 10) flushAudit();
  else if (!_auditT) _auditT = setTimeout(flushAudit, 5000);
}
function flushAudit() {
  _auditT = null; if (!_auditQ.length||typeof fbDb==='undefined') { _auditQ=[]; return; }
  var b = fbDb.batch(), q = _auditQ.slice(); _auditQ = [];
  q.forEach(function(e){ b.set(fbDb.collection('audit_log').doc(), e); });
  b.commit().catch(function(){ _auditQ = q.concat(_auditQ); });
}

// ==================== ENHANCEMENT: EXPORT HELPERS ====================
function downloadBlob(b, n) {
  var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = n;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 100);
}
function exportCSV(data, fn) {
  if (!data||!data.length) { showToast('No data to export','warning'); return; }
  var h = Object.keys(data[0]), r = [h.join(',')];
  data.forEach(function(row){ r.push(h.map(function(k){ var v=String(row[k]||'').replace(/"/g,'""'); return v.indexOf(',')>=0?'"'+v+'"':v; }).join(',')); });
  downloadBlob(new Blob(['\uFEFF'+r.join('\n')],{type:'text/csv;charset=utf-8;'}), fn||'export.csv');
  audit('export_csv', fn);
}
function exportJSON(d, fn) {
  downloadBlob(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}), fn||'export.json');
  audit('export_json',fn);
}

// ==================== ENHANCEMENT: CHART HELPERS (Chart.js friendly) ====================
function prepareChartData(collection, field, filterFn) {
  var data = window.__fbCache[collection];
  if (!data) return [];
  if (filterFn) data = data.filter(filterFn);
  return data;
}
function monthlyCounts(items, dateField) {
  var m = Array(12).fill(0);
  (items||[]).forEach(function(i){
    var d = i[dateField||'date']; if (!d) return;
    var idx = parseInt(d.split('-')[1],10)-1;
    if (idx>=0&&idx<12) m[idx]++;
  });
  return m;
}
function statusCounts(items, statusField) {
  var s = {}; (items||[]).forEach(function(i){ var v=i[statusField||'status']||'unknown'; s[v]=(s[v]||0)+1; });
  return s;
}

// ==================== ENHANCEMENT: IT TRAINING NAV LINK ====================
function addTrainingNavLink() {
  var nav = document.querySelector('.sidebar-nav, .nav-container, nav');
  if (!nav) return;
  var exists = nav.querySelector('[href*="training"]');
  if (exists) return;
  var a = document.createElement('a');
  a.href = '../executive_it/training/';
  a.className = 'flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-3 rounded-xl hover:bg-surface-container-high transition-all';
  a.innerHTML = '<span class="material-symbols-outlined">school</span><span>IT Training</span>';
  nav.appendChild(a);
}

// ==================== ENHANCEMENT: KANBAN ENGINE ====================
function initKanban(containerId, tasks, statuses, callbacks) {
  var c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  var cols = {};
  statuses.forEach(function(s){
    var col = document.createElement('div');
    col.className = 'kanban-col flex-1 min-w-[250px] bg-surface-container-low rounded-xl p-3';
    col.dataset.status = s.key;
    col.innerHTML = '<div class="flex items-center justify-between mb-3 px-1"><h4 class="font-label-md font-semibold text-on-surface">'+s.label+'</h4><span class="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full" id="cnt-'+s.key+'">0</span></div><div class="kanban-items min-h-[120px] space-y-2" data-status="'+s.key+'"></div>';
    c.appendChild(col);
    cols[s.key] = col.querySelector('.kanban-items');
  });
  (tasks||[]).forEach(function(t){
    var sk = t.status||statuses[0].key;
    var item = document.createElement('div');
    item.className = 'kanban-item bg-surface-container-lowest border border-outline-variant rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow draggable';
    item.draggable = true;
    item.dataset.id = t.id||'';
    item.innerHTML = '<div class="flex items-start justify-between gap-2"><p class="text-sm font-medium text-on-surface">'+(t.title||t.name||'Untitled')+'</p></div><div class="flex items-center gap-2 mt-2">'+(t.priority?'<span class="text-[10px] px-1.5 py-0.5 rounded-full '+(t.priority==='high'?'bg-red-100 text-red-700':t.priority==='medium'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700')+'">'+t.priority+'</span>':'')+'</div>';
    item.addEventListener('dragstart', function(e){ e.dataTransfer.setData('text/plain', this.dataset.id); this.classList.add('opacity-50'); });
    item.addEventListener('dragend', function(e){ this.classList.remove('opacity-50'); });
    if (cols[sk]) cols[sk].appendChild(item);
    else cols[statuses[0].key].appendChild(item);
  });
  Object.keys(cols).forEach(function(k){
    var items = cols[k].querySelectorAll('.kanban-item');
    document.getElementById('cnt-'+k).textContent = items.length;
    cols[k].addEventListener('dragover', function(e){ e.preventDefault(); });
    cols[k].addEventListener('drop', function(e){
      e.preventDefault();
      var id = e.dataTransfer.getData('text/plain');
      var el = document.querySelector('.kanban-item[data-id="'+id+'"]');
      if (!el) return;
      var oldStatus = el.closest('.kanban-items').dataset.status;
      if (oldStatus !== k) {
        this.appendChild(el);
        document.getElementById('cnt-'+oldStatus).textContent = parseInt(document.getElementById('cnt-'+oldStatus).textContent)-1;
        document.getElementById('cnt-'+k).textContent = parseInt(document.getElementById('cnt-'+k).textContent)+1;
        if (callbacks && callbacks.onMove) callbacks.onMove(id, k, oldStatus);
      }
    });
  });
}

// ==================== ENHANCEMENT: LANGUAGE HELPERS ====================
var __lang = { en:{}, tl:{} };
var __currLang = localStorage.getItem('kalyx_lang')||'tl';
function __t(key){ return (__lang[__currLang]&&__lang[__currLang][key])||key; }
function setLang(l){ __currLang=l; localStorage.setItem('kalyx_lang',l); applyLang(); }
function toggleLang(){ setLang(__currLang==='en'?'tl':'en'); }
function applyLang(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){ var k=el.getAttribute('data-i18n'); if(__lang[__currLang]&&__lang[__currLang][k]) el.textContent=__lang[__currLang][k]; });
  var tb=document.getElementById('langToggle'); if(tb) tb.textContent=__currLang==='en'?'TL':'EN';
}
function registerLang(key, enVal, tlVal){
  __lang.en[key]=enVal; __lang.tl[key]=tlVal;
}
registerLang('lang_notifications','Notifications','Abiso');
registerLang('lang_dashboard','Dashboard','Dashboard');
registerLang('lang_tasks','Tasks','Gawain');
registerLang('lang_trips','Trips','Biyahe');
registerLang('lang_expenses','Expenses','Gastos');
registerLang('lang_reports','Reports','Ulat');
registerLang('lang_settings','Settings','Settings');
registerLang('lang_logout','Sign Out','Lumabas');
registerLang('lang_save','Save','I-save');
registerLang('lang_cancel','Cancel','Kanselahin');
registerLang('lang_delete','Delete','Burahin');
registerLang('lang_edit','Edit','Baguhin');
registerLang('lang_create','Create','Gumawa');
registerLang('lang_search','Search','Maghanap');
registerLang('lang_export','Export','I-export');
registerLang('lang_import','Import','I-import');
registerLang('lang_loading','Loading...','Naglo-load...');
registerLang('lang_confirm','Are you sure?','Sigurado ka ba?');
registerLang('lang_success','Success!','Matagumpay!');
registerLang('lang_no_data','No data available','Walang datos');
registerLang('lang_welcome','Welcome','Maligayang pagdating');
registerLang('lang_pending','Pending','Nakabinbin');
registerLang('lang_in_progress','In Progress','Ginagawa');
registerLang('lang_completed','Completed','Tapos na');
registerLang('lang_cancelled','Cancelled','Kanselado');
registerLang('lang_overdue','Overdue','Lampas na');
registerLang('lang_today','Today','Ngayon');
registerLang('lang_this_week','This Week','Ngayong Linggo');
registerLang('lang_this_month','This Month','Ngayong Buwan');
