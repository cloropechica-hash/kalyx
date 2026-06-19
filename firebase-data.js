// ==================== FIREBASE DATA LAYER (Auth + Firestore) ====================
// localStorage is used as cache; Firestore is the source of truth for cross-device sync.

window.__fbCache = {};
window.__fbLoaded = false;
window.__fbOnUpdate = null;
window.__fbUnsubscribe = null;

// Initialize Firebase (called once per page load)
function initFirebase(callback) {
  try {
    if (!window.__fbApp) {
      window.__fbApp = firebase.initializeApp(firebaseConfig);
      window.__fbAuth = firebase.auth(window.__fbApp);
      window.__fbDb = firebase.firestore(window.__fbApp);
      window.__fbDb.enablePersistence().catch(function(err) {
        if (err.code !== 'failed-precondition') console.warn('Firestore persistence:', err);
      });
    }
    var auth = window.__fbAuth;
    var db = window.__fbDb;
    if (!auth || !db) { if (callback) callback({ message: 'Firebase not initialized' }, null); return; }

    // Wait for auth state to resolve (handles persisted session restore)
    if (window.__fbInitDone) {
      // Already initialized — just check current user
      finalizeInit(callback);
      return;
    }
    window.__fbInitDone = true;
    var unsub = auth.onAuthStateChanged(function(user) {
      unsub();
      if (user) {
        loadFBData(user.uid, user, function() {
          window.__fbLoaded = true;
          startFBListener(user.uid);
          fbRefreshSessionFromCache();
          if (callback) callback(null, user);
        });
      } else {
        localStorage.removeItem('session');
        window.__fbCache = {};
        window.__fbLoaded = true;
        if (callback) callback(null, null);
      }
    });
  } catch(e) {
    window.__fbLoaded = true;
    if (callback) callback(e, null);
  }
}

function finalizeInit(callback) {
  var auth = window.__fbAuth;
  var user = auth.currentUser;
  if (user) {
    loadFBData(user.uid, user, function() {
      window.__fbLoaded = true;
      startFBListener(user.uid);
      fbRefreshSessionFromCache();
      if (callback) callback(null, user);
    });
  } else {
    window.__fbLoaded = true;
    if (callback) callback(null, null);
  }
}

// Auth: Login
function fbLogin(email, password, callback) {
  var auth = window.__fbAuth;
  if (!auth) { if (callback) callback({ message: 'Firebase not initialized' }); return; }

  auth.signInWithEmailAndPassword(email, password)
    .then(function(cred) {
      return loadFBData(cred.user.uid, cred.user, function() {
        startFBListener(cred.user.uid);
        // Sync legacy localStorage data to Firestore (first login on new device)
        syncLegacyLocalData(cred.user.uid, function() {
          if (callback) callback(null, cred.user);
        });
      });
    })
    .catch(function(err) {
      if (callback) callback(err);
    });
}

// Auth: Register
function fbRegister(email, password, profile, callback) {
  var auth = window.__fbAuth;
  var db = window.__fbDb;
  if (!auth || !db) { if (callback) callback({ message: 'Firebase not initialized' }); return; }

  // Check if username already taken
  db.collection('usernames').doc(profile.username).get().then(function(doc) {
    if (doc.exists) {
      if (callback) callback({ message: 'Username already exists' });
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then(function(cred) {
        var uid = cred.user.uid;

        // Save username→uid mapping
        return db.collection('usernames').doc(profile.username).set({
          uid: uid,
          email: email
        }).then(function() {
          // Save profile
          return db.collection('profiles').doc(profile.username).set({
            uid: uid,
            email: email,
            username: profile.username,
            name: profile.name || profile.username,
            role: profile.role || 'executive_path',
            isAdmin: profile.isAdmin || false,
            executiveAdmin: profile.executiveAdmin || false
          });
        }).then(function() {
          // Initialize empty userdata
          return db.collection('userdata').doc(profile.username).set({
            tasks: [], plans: [], milestones: [], dailylog: [], trips: [],
            shared_tasks: [],
            it_assets: [], it_services: [], it_maintenance: [], it_inventory: [],
            it_task: [], it_planner: [], it_accomplishments: [], it_tickets: [], it_systems: []
          });
        }).then(function() {
          // Save to localStorage
          var users = JSON.parse(localStorage.getItem('users') || '[]');
          if (!users.some(function(u) { return u.username === profile.username; })) {
            users.push({
              username: profile.username,
              name: profile.name || profile.username,
              email: email,
              password: password,
              role: profile.role || 'executive_path',
              isAdmin: profile.isAdmin || false,
              executiveAdmin: profile.executiveAdmin || false
            });
            localStorage.setItem('users', JSON.stringify(users));
          }

          window.__fbCache = {
            profile: { username: profile.username, name: profile.name || profile.username, email: email, role: profile.role || 'executive_path', isAdmin: profile.isAdmin || false, executiveAdmin: profile.executiveAdmin || false },
            tasks: [], plans: [], milestones: [], dailylog: [], trips: [],
            shared_tasks: [],
            it_assets: [], it_services: [], it_maintenance: [], it_inventory: [],
            it_task: [], it_planner: [], it_accomplishments: [], it_tickets: [], it_systems: []
          };
          window.__fbLoaded = true;
          syncCacheToLocalStorage(profile.username);
          startFBListener(uid);

          if (callback) callback(null, cred.user);
        });
      })
      .catch(function(err) {
        if (callback) callback(err);
      });
  });
}

// Auth: Logout
function fbLogout(callback) {
  stopFBListener();
  var auth = window.__fbAuth;
  if (auth) {
    auth.signOut().then(function() {
      fbClearSession();
      window.__fbCache = {};
      window.__fbLoaded = false;
      if (callback) callback();
    }).catch(function() {
      fbClearSession();
      window.__fbCache = {};
      window.__fbLoaded = false;
      if (callback) callback();
    });
  } else {
    fbClearSession();
    window.__fbCache = {};
    window.__fbLoaded = false;
    if (callback) callback();
  }
}

// Session helpers
function fbSaveSession(data) {
  localStorage.setItem('session', JSON.stringify(data));
}

function fbClearSession() {
  localStorage.removeItem('session');
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('session')); } catch(e) { return null; }
}

// Load user data from Firestore into localStorage cache
function loadFBData(uid, user, callback) {
  if (typeof user === 'function') { callback = user; user = null; }
  var db = window.__fbDb;
  if (!db) { window.__fbCache = {}; window.__fbLoaded = true; if (callback) callback(); return; }

  // First, find username from profiles collection
  db.collection('profiles').where('uid', '==', uid).get().then(function(snapshot) {
    if (snapshot.empty) {
      // No profile yet - try to use existing localStorage
      var session = getSession();
      if (session) {
        loadLocalData(function() {
          window.__fbLoaded = true;
          if (callback) callback();
        });
        return;
      }
      // Auto-create profile from Firebase Auth user data
      if (user && user.email) {
        var autoUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
        var profileData = {
          uid: uid,
          email: user.email,
          username: autoUsername,
          name: user.displayName || autoUsername,
          role: 'executive_path',
          isAdmin: false,
          executiveAdmin: false
        };
        db.collection('usernames').doc(autoUsername).set({ uid: uid, email: user.email }).then(function() {
          return db.collection('profiles').doc(autoUsername).set(profileData);
        }).then(function() {
          // Check if userdata already exists (saved by another device)
          db.collection('userdata').doc(autoUsername).get().then(function(uDoc) {
            var data = uDoc.exists ? uDoc.data() : {};
            data.profile = profileData;

            // Merge existing cache data into Firestore data
            if (window.__fbCache && window.__fbCache !== data) {
              var needsUpload = false;
              Object.keys(window.__fbCache).forEach(function(k) {
                if (k !== 'profile' && window.__fbCache[k] !== undefined) {
                  if (!uDoc.exists || !(k in data)) {
                    data[k] = window.__fbCache[k];
                    needsUpload = true;
                  }
                }
              });
              if (needsUpload) {
                var payload = {};
                Object.keys(data).forEach(function(k) {
                  if (k !== 'profile') payload[k] = data[k];
                });
                db.collection('userdata').doc(autoUsername).set(payload, { merge: true }).catch(function(err) {
                  console.warn('Firestore initial upload error (auto):', err.message);
                });
              }
            }

            window.__fbCache = data;
            window.__fbLoaded = true;
            syncCacheToLocalStorage(autoUsername);
            if (callback) callback();
          }).catch(function() {
            window.__fbCache = { profile: profileData };
            window.__fbLoaded = true;
            syncCacheToLocalStorage(autoUsername);
            if (callback) callback();
          });
        }).catch(function() {
          window.__fbCache = { profile: profileData };
          window.__fbLoaded = true;
          if (callback) callback();
        });
        return;
      }
      window.__fbCache = {};
      window.__fbLoaded = true;
      if (callback) callback();
      return;
    }

    var profileData = snapshot.docs[0].data();
    var username = profileData.username;

    // Load userdata from Firestore
    db.collection('userdata').doc(username).get().then(function(doc) {
      var data = doc.exists ? doc.data() : {};
      data.profile = profileData;

      // Merge existing cache data (from localStorage fallback) into Firestore data
      if (window.__fbCache && window.__fbCache !== data) {
        var needsUpload = false;
        Object.keys(window.__fbCache).forEach(function(k) {
          if (k !== 'profile' && window.__fbCache[k] !== undefined) {
            if (!doc.exists || !(k in data)) {
              data[k] = window.__fbCache[k];
              needsUpload = true;
            }
          }
        });
        if (needsUpload) {
          var uploadData = {};
          Object.keys(data).forEach(function(k) {
            if (k !== 'profile') uploadData[k] = data[k];
          });
          db.collection('userdata').doc(username).set(uploadData, { merge: true }).catch(function(err) {
            console.warn('Firestore initial upload error:', err.message);
          });
        }
      }

      window.__fbCache = data;
      window.__fbLoaded = true;
      syncCacheToLocalStorage(username);
      if (callback) callback();
    }).catch(function() {
      // Fallback: load from localStorage
      loadLocalData(function() {
        window.__fbLoaded = true;
        if (callback) callback();
      });
    });
  }).catch(function() {
    loadLocalData(function() {
      window.__fbLoaded = true;
      if (callback) callback();
    });
  });
}

// Sync legacy localStorage data to Firestore (first-time upload)
function syncLegacyLocalData(uid, callback) {
  var db = window.__fbDb;
  if (!db || !uid) { if (callback) callback(); return; }

  var session = getSession();
  var username = session ? session.username : (window.__fbCache && window.__fbCache.profile ? window.__fbCache.profile.username : null);
  if (!username) { if (callback) callback(); return; }

  // Check if profile exists in Firestore already
  db.collection('profiles').doc(username).get().then(function(doc) {
    if (doc.exists) {
      // Profile exists - data should already be synced
      if (callback) callback();
      return;
    }

    // Upload localStorage data to Firestore
    var users = JSON.parse(localStorage.getItem('users') || '[]');
    var localUser = users.find(function(u) { return u.username === username; });

    // Save username mapping
    db.collection('usernames').doc(username).set({ uid: uid, email: localUser ? localUser.email : '' }).then(function() {
      // Save profile
      return db.collection('profiles').doc(username).set({
        uid: uid,
        email: (localUser ? localUser.email : '') || (session ? session.email : ''),
        username: username,
        name: (localUser ? localUser.name : null) || (session ? session.name : null) || username,
        role: (localUser ? localUser.role : null) || (session ? session.role : null) || 'executive_path',
        isAdmin: (localUser ? localUser.isAdmin : false) || (session ? session.isAdmin : false) || false,
        executiveAdmin: (localUser ? localUser.executiveAdmin : false) || (session ? session.executiveAdmin : false) || false
      });
    }).then(function() {
      // Collect and upload all user data
      var data = {};
      var prefixes = ['tasks', 'plans', 'milestones', 'dailylog', 'trips', 'shared_tasks'];
      prefixes.forEach(function(p) {
        try { var v = JSON.parse(localStorage.getItem(p + '_' + username)); if (Array.isArray(v)) data[p] = v; } catch(e) {}
      });
      var itTypes = ['assets', 'services', 'maintenance', 'inventory', 'task', 'planner', 'accomplishments', 'tickets', 'systems'];
      itTypes.forEach(function(t) {
        try { var v = JSON.parse(localStorage.getItem('it_' + t + '_' + username)); if (Array.isArray(v)) data['it_' + t] = v; } catch(e) {}
      });
      data.profile = {
        username: username,
        name: (localUser ? localUser.name : null) || (session ? session.name : null) || username,
        email: (localUser ? localUser.email : '') || (session ? session.email : ''),
        role: (localUser ? localUser.role : null) || (session ? session.role : null) || 'executive_path',
        isAdmin: (localUser ? localUser.isAdmin : false) || (session ? session.isAdmin : false) || false,
        executiveAdmin: (localUser ? localUser.executiveAdmin : false) || (session ? session.executiveAdmin : false) || false
      };

      return db.collection('userdata').doc(username).set(data);
    }).then(function() {
      // Update cache
      if (window.__fbCache) {
        Object.keys(data).forEach(function(k) { window.__fbCache[k] = data[k]; });
      }
      syncCacheToLocalStorage(username);
      if (callback) callback();
    }).catch(function() {
      if (callback) callback();
    });
  }).catch(function() {
    if (callback) callback();
  });
}

// Real-time listener for Firestore changes (cross-device sync)
function startFBListener(uid) {
  stopFBListener();
  var db = window.__fbDb;
  if (!db || !uid) return;

  // Find username
  db.collection('profiles').where('uid', '==', uid).get().then(function(snapshot) {
    if (snapshot.empty) return;
    var username = snapshot.docs[0].data().username;

    window.__fbUnsubscribe = db.collection('userdata').doc(username)
      .onSnapshot(function(doc) {
        if (!doc.exists) return;
        var data = doc.data();
        if (!data) return;

        // Preserve profile from existing cache if not in Firestore doc
        if (!data.profile) {
          data.profile = (window.__fbCache && window.__fbCache.profile) || null;
        }
        // If there's still no profile, try to load from profiles collection
        if (!data.profile) {
          db.collection('profiles').doc(username).get().then(function(pDoc) {
            if (pDoc.exists) {
              data.profile = pDoc.data();
              applySnapshotData(username, data);
            }
          }).catch(function() {});
          return;
        }

        applySnapshotData(username, data);
      }, function(err) {
        console.warn('Firestore listener error:', err);
      });
  }).catch(function() {});
}

function applySnapshotData(username, data) {
  var oldCache = window.__fbCache || {};
  window.__fbCache = data;
  window.__fbLoaded = true;
  syncCacheToLocalStorage(username);
  if (window.__fbOnUpdate) window.__fbOnUpdate(data, oldCache);
}

function stopFBListener() {
  if (window.__fbUnsubscribe) {
    window.__fbUnsubscribe();
    window.__fbUnsubscribe = null;
  }
}

// Called by pages to register a real-time update handler
function fbOnUpdate(callback) {
  window.__fbOnUpdate = callback;
}

// Read from cache, fallback to localStorage
function getFB(key) {
  if (!window.__fbLoaded) return null;
  if (window.__fbCache) {
    if (key in window.__fbCache) return window.__fbCache[key];
    // Fallback: check localStorage for data that hasn't been synced to Firestore yet
    var username = window.__fbCache.profile ? window.__fbCache.profile.username : null;
    if (username) {
      try {
        var localData = JSON.parse(localStorage.getItem(key + '_' + username));
        if (localData !== null && localData !== undefined) {
          window.__fbCache[key] = localData;
          // Also sync to Firestore for cross-device access
          syncFieldToFirestore(username, key, localData);
          return localData;
        }
      } catch(e) {}
    }
  }
  return null;
}

// Write to cache + localStorage + Firestore
function saveFB(key, data, callback) {
  if (window.__fbCache) window.__fbCache[key] = data;
  var username = window.__fbCache && window.__fbCache.profile ? window.__fbCache.profile.username : null;
  if (username) {
    localStorage.setItem(key + '_' + username, JSON.stringify(data));
    // Firestore sync (fire-and-forget)
    syncFieldToFirestore(username, key, data);
  }
  if (callback) callback();
}

// Sync a single field to Firestore
function syncFieldToFirestore(username, key, data) {
  var db = window.__fbDb;
  if (!db || !username) return;
  db.collection('userdata').doc(username).set(
    { [key]: data },
    { merge: true }
  ).catch(function(err) {
    console.warn('Firestore sync error for', key, err.message);
  });
}

// Save entire cache to localStorage
function saveFBFull(callback) {
  var username = window.__fbCache && window.__fbCache.profile ? window.__fbCache.profile.username : null;
  syncCacheToLocalStorage(username);
  // Sync to Firestore for cross-device access
  syncToFirestore(username, callback);
}

// Save entire cache to Firestore
function syncToFirestore(username, callback) {
  var db = window.__fbDb;
  if (!db || !username || !window.__fbCache) { if (callback) callback(); return; }

  var data = {};
  Object.keys(window.__fbCache).forEach(function(k) {
    data[k] = window.__fbCache[k];
  });

  db.collection('userdata').doc(username).set(data).then(function() {
    if (callback) callback();
  }).catch(function(err) {
    console.error('Firestore save error:', err);
    if (callback) callback();
  });
}

// Sync cache to localStorage
function syncCacheToLocalStorage(username) {
  if (!username || !window.__fbCache) return;
  var cache = window.__fbCache;
  var typeKeys = ['tasks', 'shared_tasks', 'plans', 'milestones', 'dailylog', 'trips'];
  typeKeys.forEach(function(k) {
    if (cache[k] && Array.isArray(cache[k])) {
      localStorage.setItem(k + '_' + username, JSON.stringify(cache[k]));
    }
  });
  var itTypes = ['assets', 'services', 'maintenance', 'inventory', 'task', 'planner', 'accomplishments', 'tickets', 'systems'];
  itTypes.forEach(function(t) {
    var k = 'it_' + t;
    if (cache[k] && Array.isArray(cache[k])) {
      localStorage.setItem(k + '_' + username, JSON.stringify(cache[k]));
    }
  });
  if (cache.profile) {
    localStorage.setItem('profile_' + username, JSON.stringify(cache.profile));
  }
}

// Load data from localStorage into cache (fallback when Firestore unavailable)
function loadLocalData(callback) {
  var session = getSession();
  var username = session ? session.username : null;
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
  cache.profile = {
    username: session.username,
    name: session.name || session.username,
    email: session.email || '',
    role: session.role || 'executive_path',
    isAdmin: session.isAdmin || false,
    executiveAdmin: session.executiveAdmin || false
  };
  window.__fbCache = cache;
  window.__fbLoaded = true;
  if (callback) callback();
}

// Legacy: loadFBData redirects to Firestore
function loadFBDataLegacy(uid, callback) { loadFBData(uid, callback); }

// Look up email by username (for login)
function lookupEmailByUsername(username, callback) {
  var db = window.__fbDb;
  if (!db) {
    // Fallback: check localStorage users array
    var users = JSON.parse(localStorage.getItem('users') || '[]');
    var found = users.find(function(u) { return u.username === username; });
    if (callback) callback(found ? found.email : null);
    return;
  }
  db.collection('usernames').doc(username).get().then(function(doc) {
    if (doc.exists) {
      if (callback) callback(doc.data().email);
    } else {
      // Fallback to localStorage
      var users = JSON.parse(localStorage.getItem('users') || '[]');
      var found = users.find(function(u) { return u.username === username; });
      if (callback) callback(found ? found.email : null);
    }
  }).catch(function() {
    var users = JSON.parse(localStorage.getItem('users') || '[]');
    var found = users.find(function(u) { return u.username === username; });
    if (callback) callback(found ? found.email : null);
  });
}

// Auth state change listener (called once at app start)
function onAuthStateChanged(callback) {
  var auth = window.__fbAuth;
  if (!auth) { if (callback) callback(null); return; }
  auth.onAuthStateChanged(function(user) {
    if (user) {
      loadFBData(user.uid, user, function() {
        if (callback) callback(user);
      });
    } else {
      if (callback) callback(null);
    }
  });
}

// Alias: fbGetSession (compatibility with supabase-era code)
function fbGetSession() {
  return getSession();
}

// ==================== FIREBASE CLIENT WRAPPER ====================
// Provides a Supabase-like interface for backward compatibility

function getClient() {
  var auth = window.__fbAuth;
  var db = window.__fbDb;
  if (!auth || !db) return null;

  return {
    auth: {
      signInWithPassword: function(_a) {
        // Maps to Firebase reauthentication
        return { error: null };
      },
      updateUser: function(_a) {
        return auth.currentUser.updatePassword(_a.password).then(function() {
          return { error: null };
        }).catch(function(err) {
          return { error: err };
        });
      }
    },
    rpc: function(name, args) {
      return Promise.resolve({ data: null, error: null });
    },
    from: function(table) {
      return db.collection(table);
    }
  };
}

// ==================== FIREBASE PASSWORD CHANGE ====================
function fbChangePassword(currentPassword, newPassword, callback) {
  var auth = window.__fbAuth;
  if (!auth || !auth.currentUser) {
    if (callback) callback({ message: 'Not authenticated' });
    return;
  }
  var user = auth.currentUser;
  var email = user.email;
  if (!email) {
    if (callback) callback({ message: 'No email on account' });
    return;
  }
  // Reauthenticate then update password
  var credential = firebase.auth.EmailAuthProvider.credential(email, currentPassword);
  user.reauthenticateWithCredential(credential).then(function() {
    return user.updatePassword(newPassword);
  }).then(function() {
    if (callback) callback(null);
  }).catch(function(err) {
    if (callback) callback(err);
  });
}

// ==================== FIREBASE USER LOOKUP ====================
function fbGetAllUsernames(callback) {
  var db = window.__fbDb;
  if (!db) { if (callback) callback(null, []); return; }
  db.collection('profiles').get().then(function(snapshot) {
    var users = [];
    snapshot.forEach(function(doc) {
      var d = doc.data();
      users.push({ username: d.username, name: d.name || d.username, email: d.email || '', role: d.role || 'executive_path', isAdmin: !!d.isAdmin, executiveAdmin: !!d.executiveAdmin });
    });
    if (callback) callback(null, users);
  }).catch(function(err) {
    console.error('fbGetAllUsernames error:', err);
    if (callback) callback(err, []);
  });
}

// ==================== FIREBASE TASK SHARING ====================
// Assign a task to another user (add to their shared_tasks)
function fbAssignTask(assigneeUsername, taskObj, callback) {
  var db = window.__fbDb;
  if (!db || !assigneeUsername) {
    if (callback) callback({ message: 'Not connected' });
    return;
  }
  var taskCopy = {};
  for (var k in taskObj) {
    if (k !== '_shared') taskCopy[k] = taskObj[k];
  }
  // Get assignee's userdata document and append to shared_tasks
  db.collection('userdata').doc(assigneeUsername).get().then(function(doc) {
    var data = doc.exists ? doc.data() : {};
    var shared = data.shared_tasks || [];
    shared.push(taskCopy);
    return db.collection('userdata').doc(assigneeUsername).set(
      { shared_tasks: shared },
      { merge: true }
    );
  }).then(function() {
    if (callback) callback(null);
  }).catch(function(err) {
    console.error('fbAssignTask error:', err);
    if (callback) callback(err);
  });
}

// Remove a shared task from another user
function fbRemoveSharedTask(assigneeUsername, taskId, callback) {
  var db = window.__fbDb;
  if (!db || !assigneeUsername) {
    if (callback) callback({ message: 'Not connected' });
    return;
  }
  db.collection('userdata').doc(assigneeUsername).get().then(function(doc) {
    if (!doc.exists) { if (callback) callback(); return; }
    var data = doc.data();
    var shared = data.shared_tasks || [];
    shared = shared.filter(function(t) { return t.id !== taskId; });
    return db.collection('userdata').doc(assigneeUsername).set(
      { shared_tasks: shared },
      { merge: true }
    );
  }).then(function() {
    if (callback) callback(null);
  }).catch(function(err) {
    console.error('fbRemoveSharedTask error:', err);
    if (callback) callback(err);
  });
}

// Update status of a shared task back in the creator's list
function fbUpdateAssignedTaskStatus(creatorUsername, taskId, status, callback) {
  var db = window.__fbDb;
  if (!db || !creatorUsername) {
    if (callback) callback({ message: 'Not connected' });
    return;
  }
  db.collection('userdata').doc(creatorUsername).get().then(function(doc) {
    if (!doc.exists) { if (callback) callback(); return; }
    var data = doc.data();
    var tasks = data.tasks || [];
    var idx = -1;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === taskId) { idx = i; break; }
    }
    if (idx === -1) { if (callback) callback(); return; }
    tasks[idx].status = status;
    tasks[idx].updatedAt = new Date().toISOString();
    return db.collection('userdata').doc(creatorUsername).set(
      { tasks: tasks },
      { merge: true }
    );
  }).then(function() {
    if (callback) callback(null);
  }).catch(function(err) {
    console.error('fbUpdateAssignedTaskStatus error:', err);
    if (callback) callback(err);
  });
}

// ==================== SESSION REFRESH ====================
// Update localStorage session from Firestore cache after data load.
// This ensures permission changes (isAdmin, executiveAdmin, role) take effect
// without requiring the user to logout and login again.
function fbRefreshSessionFromCache() {
  var profile = window.__fbCache && window.__fbCache.profile;
  if (!profile) return;
  var session = getSession();
  if (!session) return;
  var changed = false;
  if (session.isAdmin !== profile.isAdmin) { session.isAdmin = !!profile.isAdmin; changed = true; }
  if (session.executiveAdmin !== profile.executiveAdmin) { session.executiveAdmin = !!profile.executiveAdmin; changed = true; }
  if (session.role !== profile.role) { session.role = profile.role; changed = true; }
  if (session.name !== profile.name) { session.name = profile.name; changed = true; }
  if (session.email !== profile.email) { session.email = profile.email; changed = true; }
  if (changed) {
    fbSaveSession(session);
  }
}
