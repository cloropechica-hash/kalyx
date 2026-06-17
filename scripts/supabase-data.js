// ==================== SUPABASE DATA LAYER ====================
// Maintains same function signatures as before so all pages work without changes.

window.__fbCache = {};
window.__fbLoaded = false;
window.__fbUser = null;
window.__fbUnsubscribe = null;
window.__fbAuthListener = null;

function getClient() {
  if (typeof supabaseClient !== 'undefined') return supabaseClient;
  if (typeof supabase !== 'undefined') {
    return supabase.createClient(
      SUPABASE_URL || 'https://xhweqrlyppvtksqbqrne.supabase.co',
      SUPABASE_ANON_KEY || 'sb_publishable_UMaXwhml3R_i0HFxYDuzXg_LtFmx96A',
      { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
    );
  }
  return null;
}

function initFirebase(callback) {
  var client = getClient();
  if (!client) {
    if (callback) callback('Supabase not loaded');
    return;
  }
  client.auth.getSession().then(function(result) {
    var session = result.data.session;
    if (session) {
      window.__fbUser = { uid: session.user.id, email: session.user.email };
      loadFBData(session.user.id, function(err) {
        fbSubscribe(session.user.id);
        if (callback) callback(err, window.__fbUser);
      });
    } else {
      window.__fbUser = null;
      window.__fbCache = {};
      window.__fbLoaded = false;
      if (callback) callback(null, null);
    }
  }).catch(function(err) {
    console.error('Supabase session check error:', err);
    if (callback) callback(err);
  });
  if (window.__fbAuthListener) {
    try { window.__fbAuthListener.subscription.unsubscribe(); } catch(e) {}
    window.__fbAuthListener = null;
  }
  var authResult = client.auth.onAuthStateChange(function(event, session) {
    if (window.__fbRegistering) return;
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
      window.__fbUser = { uid: session.user.id, email: session.user.email };
      loadFBData(session.user.id, function() {
        fbSubscribe(session.user.id);
      });
    } else if (event === 'SIGNED_OUT') {
      window.__fbUser = null;
      window.__fbCache = {};
      window.__fbLoaded = false;
      if (window.__fbUnsubscribe) {
        window.__fbUnsubscribe();
        window.__fbUnsubscribe = null;
      }
    }
  });
  window.__fbAuthListener = authResult.data ? authResult.data : authResult;
}

function loadFBData(uid, callback) {
  var client = getClient();
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
    console.log('Supabase unavailable, using localStorage fallback');
    if (callback) callback();
  }
  function loadFromSupabaseData(data) {
    window.__fbCache = data;
    window.__fbLoaded = true;
    var username = data.profile ? data.profile.username : null;
    if (username) {
      mergeLocalToCache(username);
      syncCacheToLocalStorage(username);
    }
    if (callback) callback();
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
  if (!client) {
    fallbackToLocalStorage();
    return;
  }
  client.rpc('get_userdata', { p_uid: uid }).then(function(rpcResult) {
    if (!rpcResult.error && rpcResult.data && Object.keys(rpcResult.data).length > 0) {
      var data = typeof rpcResult.data === 'string' ? JSON.parse(rpcResult.data) : rpcResult.data;
      loadFromSupabaseData(data);
      return;
    }
    throw new Error('RPC empty');
  }).catch(function() {
    client.from('userdata').select('data').eq('id', uid).single()
      .then(function(result) {
        if (result.error) {
          if (result.error.code === 'PGRST116') {
            window.__fbCache = {};
            window.__fbLoaded = true;
            var username = getUsernameFromSession();
            if (username) {
              migrateLocalStorageNoReload(uid, username);
            }
            if (callback) callback();
            return;
          }
          console.error('Supabase load error:', result.error);
          fallbackToLocalStorage();
          return;
        }
        var data = result.data.data || {};
        loadFromSupabaseData(data);
      })
      .catch(function(err) {
        console.error('Supabase load error:', err);
        fallbackToLocalStorage();
      });
  });
}

function fbSubscribe(uid, onUpdate) {
  var client = getClient();
  if (!client) return;
  if (window.__fbUnsubscribe) {
    window.__fbUnsubscribe();
    window.__fbUnsubscribe = null;
  }
  var channel = client.channel('userdata-' + uid)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'userdata', filter: 'id=eq.' + uid },
      function(payload) {
        if (payload.new && payload.new.data) {
          var incoming = payload.new.data;
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
      }
    )
    .subscribe();
  window.__fbUnsubscribe = function() {
    client.removeChannel(channel);
  };
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
  var client = getClient();
  var username = window.__fbCache && window.__fbCache.profile ? window.__fbCache.profile.username : null;
  if (username) syncCacheToLocalStorage(username);
  if (!client) {
    if (callback) callback('Supabase not loaded');
    return;
  }
  if (!window.__fbUser) {
    if (callback) callback('Not authenticated');
    return;
  }
  client.from('userdata').upsert(
    { id: window.__fbUser.uid, data: window.__fbCache, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  )
  .then(function(result) {
    if (result.error) {
      console.error('Supabase save error:', result.error);
      if (callback) callback(result.error);
    } else {
      if (callback) callback();
    }
  })
  .catch(function(err) {
    console.error('Supabase save error:', err);
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

function fbGetSession() {
  return JSON.parse(localStorage.getItem('session') || 'null');
}

function fbSaveSession(data) {
  localStorage.setItem('session', JSON.stringify(data));
}

function fbClearSession() {
  localStorage.removeItem('session');
}

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
    var client = getClient();
    if (!client) return;
    client.from('userdata').upsert(
      { id: uid, data: migrated, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    ).then(function() {
      console.log('Migrated ' + count + ' localStorage keys to Supabase.');
    }).catch(function(err) {
      console.error('Background migration error:', err);
    });
  }
}

function fbLogin(email, password, callback) {
  var client = getClient();
  if (!client) {
    if (callback) callback({ message: 'Supabase not loaded' });
    return;
  }
  client.auth.signInWithPassword({ email: email, password: password })
    .then(function(result) {
      if (result.error) {
        if (callback) callback(result.error);
        return;
      }
      var user = result.data.user;
      window.__fbUser = { uid: user.id, email: user.email };
      var jwtMeta = user.user_metadata || {};
      var jwtRole = jwtMeta.role || null;
      var jwtIsAdmin = jwtMeta.is_admin || false;
      var jwtUsername = jwtMeta.username || null;
      var jwtName = jwtMeta.name || null;
      var localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      var localUser = localUsers.find(function(u) { return u.email === user.email; });
      var finalRole = jwtRole || (localUser ? localUser.role : null) || 'executive_path';
      var finalIsAdmin = jwtIsAdmin || (localUser ? localUser.isAdmin || false : false);
      var finalUsername = jwtUsername || (localUser ? localUser.username : null) || user.email.split('@')[0];
      var finalName = jwtName || (localUser ? localUser.name : null) || finalUsername;
      var session = {
        username: finalUsername,
        name: finalName,
        email: user.email,
        isAdmin: finalIsAdmin,
        role: finalRole,
        supabaseUid: user.id,
        loggedIn: true,
        timestamp: Date.now()
      };
      fbSaveSession(session);
      Promise.resolve(client.from('profiles').upsert({
        id: user.id,
        username: finalUsername,
        name: finalName,
        email: user.email,
        role: finalRole,
        is_admin: finalIsAdmin
      })).then(null, function(e) { console.error('Profile sync error:', e); });
      loadFBData(user.id, function() {
        if (callback) callback(null, session);
      });
    })
    .catch(function(err) {
      if (callback) callback(err);
    });
}

function fbRegister(email, password, profile, callback) {
  window.__fbRegistering = true;
  var client = getClient();
  if (!client) {
    window.__fbRegistering = false;
    if (callback) callback({ message: 'Supabase not loaded' });
    return;
  }
  client.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        username: profile.username,
        name: profile.name,
        role: profile.role || 'executive_task',
        is_admin: profile.isAdmin || false
      }
    }
  })
  .then(function(result) {
    if (result.error) {
      window.__fbRegistering = false;
      if (callback) callback(result.error);
      return;
    }
    var uid = result.data.user.id;
    var p = {
      id: uid,
      username: profile.username,
      name: profile.name,
      email: email,
      role: profile.role || 'executive_task',
      is_admin: profile.isAdmin || false
    };
    function doCb(err, ok) {
      window.__fbRegistering = false;
      if (callback) callback(err, ok);
    }
    Promise.resolve(client.from('profiles').upsert(p, { onConflict: 'id' })).then(function() {
      Promise.resolve(client.from('userdata').upsert({ id: uid, data: {} }, { onConflict: 'id' })).then(function() {
        localStorage.setItem('welcome_' + profile.username, 'true');
        doCb(null, { username: profile.username, name: profile.name, role: profile.role });
      }, function(err) {
        console.error('userdata upsert error:', err);
        doCb(err);
      });
    }, function(err) {
      console.error('profiles upsert error:', err);
      doCb(err);
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
  for (var i = localStorage.length - 1; i >= 0; i--) {
    var k = localStorage.key(i);
    if (k && (k.indexOf('sb-') === 0 || k.indexOf('supabase') === 0)) {
      localStorage.removeItem(k);
    }
  }
  var client = getClient();
  if (!client) {
    window.__fbLoggingOut = false;
    if (callback) callback();
    return;
  }
  client.auth.signOut()
    .then(function() {
      if (window.__fbAuthListener) {
        try { window.__fbAuthListener.subscription.unsubscribe(); } catch(e) {}
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
