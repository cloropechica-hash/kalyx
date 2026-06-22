if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const logEl = document.getElementById('log');
const startBtn = document.getElementById('startBtn');

function addLog(msg, type = 'info') {
  const div = document.createElement('div');
  div.className = `log-${type}`;
  div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  addLog('Fetching backup file...', 'info');

  try {
    const res = await fetch('scheduler-backup-2026-06-22.json');
    if (!res.ok) throw new Error('Could not load backup file');
    const backup = await res.json();
    
    addLog('Backup file loaded successfully.', 'success');
    
    const allUsers = backup.users || [];
    addLog(`Found ${allUsers.length} users in backup. Filtering duplicates...`, 'info');

    // Remove duplicates based on email
    const uniqueUsers = [];
    const seenEmails = new Set();
    
    allUsers.forEach(u => {
      const email = u.email.toLowerCase();
      if (!seenEmails.has(email)) {
        seenEmails.add(email);
        uniqueUsers.push(u);
      } else {
        addLog(`Removed duplicate email: ${email}`, 'warning');
      }
    });

    addLog(`Proceeding to upload ${uniqueUsers.length} unique users.`, 'info');

    for (let i = 0; i < uniqueUsers.length; i++) {
      await processUser(uniqueUsers[i], backup, i + 1, uniqueUsers.length);
    }

    addLog('Migration completed successfully!', 'success');
    addLog('You can now log in using the accounts in the main system.', 'info');
  } catch (error) {
    addLog(`Error: ${error.message}`, 'error');
  } finally {
    startBtn.disabled = false;
  }
});

async function processUser(user, fullBackup, index, total) {
  addLog(`[${index}/${total}] Processing ${user.username} (${user.email})...`, 'info');

  let uid = null;
  try {
    // Try to register the user
    const cred = await auth.createUserWithEmailAndPassword(user.email, user.password);
    uid = cred.user.uid;
    addLog(`  Created new Firebase Auth user for ${user.email}`, 'success');
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      addLog(`  Email ${user.email} already exists. Attempting to login to overwrite data...`, 'warning');
      try {
        const cred = await auth.signInWithEmailAndPassword(user.email, user.password);
        uid = cred.user.uid;
        addLog(`  Successfully logged in to existing account.`, 'success');
      } catch (loginErr) {
        addLog(`  Failed to login with backup password. Prompting for manual password...`, 'warning');
        const manualPass = prompt(`Ang account na ${user.email} ay nasa Firebase na pero iba ang password nito.\n\nPara mailipat ang data, pakilagay ang kasalukuyang password nito sa Firebase:`);
        
        if (manualPass) {
          try {
            const cred2 = await auth.signInWithEmailAndPassword(user.email, manualPass);
            uid = cred2.user.uid;
            addLog(`  Successfully logged in with manual password.`, 'success');
          } catch (manualErr) {
            addLog(`  Manual password failed: ${manualErr.message}. Skipping user.`, 'error');
            return;
          }
        } else {
          addLog(`  No password provided. Skipping data upload for this user.`, 'error');
          return;
        }
      }
    } else {
      addLog(`  Failed to create user ${user.email}: ${err.message}`, 'error');
      return;
    }
  }

  // Compile user's data from the backup
  addLog(`  Compiling Firestore data for ${user.username}...`, 'info');
  const userData = {
    profile: {
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      role: user.role || 'executive_path',
      isAdmin: !!user.isAdmin,
      executiveAdmin: !!user.executiveAdmin
    }
  };

  // Find all keys in backup that end with _username
  const suffix = `_${user.username}`;
  Object.keys(fullBackup).forEach(key => {
    if (key.endsWith(suffix) && Array.isArray(fullBackup[key])) {
      const fbKey = key.slice(0, -suffix.length);
      userData[fbKey] = fullBackup[key];
    }
  });

  try {
    // Upload to Firestore
    await db.collection('users').doc(uid).set({
      data: userData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    addLog(`  Successfully saved data to Firestore for ${user.username}.`, 'success');
  } catch (dbErr) {
    addLog(`  Failed to save Firestore data for ${user.username}: ${dbErr.message}`, 'error');
  }

  // Sign out after processing
  await auth.signOut();
}
