(() => {
  const panel = document.querySelector('#cloud');
  const form = panel.querySelector('form');
  const account = panel.querySelector('#cloud-account');
  const status = panel.querySelector('#cloud-status');
  const signOut = panel.querySelector('#cloud-sign-out');
  const importLocal = panel.querySelector('#cloud-import');
  const syncNow = panel.querySelector('#cloud-sync');
  if (!window.supabase) {
    form.hidden = true;
    status.textContent = 'Cloud sync is unavailable. You can still use this browser.';
    return;
  }

  const client = window.supabase.createClient('https://ztifkhgyxadbarihgyhy.supabase.co', 'sb_publishable_KH52s9kXjuv4i5aRppmu4g_yRXnvYO8');
  const table = () => client.from('dsa_planner_state');
  const empty = () => ({ attempts: [], notes: {}, plans: {}, time: '19:00' });
  const equal = (left, right) => {
    if (left === right) return true;
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every(k => Object.hasOwn(right, k) && equal(left[k], right[k]));
  };

  function mergeEntries(base, local, remote) {
    const result = { ...remote };
    for (const k of new Set([...Object.keys(base), ...Object.keys(local)])) {
      if (equal(base[k], local[k])) continue;
      if (Object.hasOwn(local, k)) Object.defineProperty(result, k, {
        value: local[k], enumerable: true, configurable: true, writable: true
      });
      else delete result[k];
    }
    return result;
  }

  const attemptsById = list => Object.fromEntries(list.map(a => [JSON.stringify([a.id, a.at]), a]));
  function merge(base, local, remote) {
    return {
      attempts: Object.values(mergeEntries(attemptsById(base.attempts), attemptsById(local.attempts), attemptsById(remote.attempts))),
      notes: mergeEntries(base.notes, local.notes, remote.notes),
      plans: mergeEntries(base.plans, local.plans, remote.plans),
      time: local.time === base.time ? remote.time : local.time
    };
  }

  let userId = null;
  let baseline = empty();
  let timer;
  let busy = false;
  const cacheKey = id => key + ':cloud:' + id;

  function persist() {
    if (!userId) return;
    try {
      localStorage.setItem(cacheKey(userId), JSON.stringify({ state, baseline }));
    } catch {
      status.textContent = 'Browser storage is unavailable. Keep this tab open until sync completes.';
    }
  }

  function schedule(delay = 600) {
    clearTimeout(timer);
    if (userId) timer = setTimeout(sync, delay);
  }

  window.saveCloudPlanner = () => {
    if (!userId) return false;
    persist();
    schedule();
    return true;
  };

  async function sync() {
    if (!userId || busy || dialog.open) return;
    const owner = userId;
    busy = true;
    status.textContent = 'Syncing…';
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: remote, error: readError } = await table().select('snapshot, revision').eq('user_id', owner).maybeSingle();
        if (readError) throw readError;
        if (userId !== owner || dialog.open) return;

        const local = JSON.parse(JSON.stringify(state));
        const previous = remote?.snapshot ?? empty();
        const merged = merge(baseline, local, previous);
        if (!equal(merged, previous)) {
          if (!remote) {
            const { error } = await table().insert({ user_id: owner, snapshot: merged });
            if (error?.code === '23505') continue;
            if (error) throw error;
          } else {
            const { data, error } = await table().update({ snapshot: merged, revision: remote.revision + 1 })
              .eq('user_id', owner).eq('revision', remote.revision).select('revision').maybeSingle();
            if (error) throw error;
            if (!data) continue;
          }
        }
        if (userId !== owner) return;
        const updated = merge(local, state, merged);
        if (!dialog.open) {
          const changed = !equal(state, updated) || app.hidden;
          baseline = merged;
          state = updated;
          app.hidden = false;
          if (changed) render();
        } else {
          // Keep the dialog's attempt indexes stable. Rebase when it closes.
          baseline = local;
          schedule();
        }
        persist();
        importLocal.disabled = false;
        status.textContent = equal(state, baseline) && !dialog.open ? 'Synced' : 'Changes pending';
        if (!equal(state, baseline)) schedule();
        return;
      }
      throw new Error('The planner changed on another device. Try syncing again.');
    } catch {
      if (userId === owner) {
        if (app.hidden) {
          app.hidden = false;
          render();
        }
        status.textContent = 'Couldn’t sync. Your changes are still on this device.';
      }
    } finally {
      busy = false;
      if (userId && userId !== owner) schedule(0);
    }
  }

  function useSession(session) {
    const next = session?.user.id ?? null;
    if (next === userId) return;
    clearTimeout(timer);
    if (dialog.open) dialog.close();
    userId = next;
    baseline = empty();
    state = empty();
    app.hidden = false;
    importLocal.disabled = true;
    if (userId) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey(userId)) || 'null');
        if (cached) ({ state, baseline } = cached);
      } catch {}
      app.hidden = true;
      schedule(0);
    } else {
      try { Object.assign(state, JSON.parse(localStorage.getItem(key) || '{}')); } catch {}
      render();
    }
    form.hidden = Boolean(userId);
    signOut.hidden = !userId;
    importLocal.hidden = !userId;
    syncNow.hidden = !userId;
    account.textContent = session?.user.email ?? '';
    status.textContent = userId ? 'Loading cloud progress…' : 'Signed out. Progress is saved on this browser.';
  }

  client.auth.onAuthStateChange((_event, session) => useSession(session));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    const fields = new FormData(form);
    button.disabled = true;
    status.textContent = 'Signing in…';
    try {
      const { error } = await client.auth.signInWithPassword({ email: fields.get('email'), password: fields.get('password') });
      if (error) throw error;
      form.reset();
    } catch (error) {
      status.textContent = error.message || 'Couldn’t sign in.';
    } finally {
      button.disabled = false;
    }
  });

  importLocal.addEventListener('click', () => {
    try {
      const fromBrowser = JSON.parse(localStorage.getItem(key) || '{}');
      if (!fromBrowser.attempts?.length && !Object.keys(fromBrowser.notes ?? {}).length) {
        status.textContent = 'There are no local attempts or notes to import.';
        return;
      }
      state = merge(empty(), state, { ...empty(), ...fromBrowser });
      save();
      render();
      status.textContent = 'Browser progress copied. Syncing…';
    } catch {
      status.textContent = 'Couldn’t read progress from this browser.';
    }
  });

  syncNow.addEventListener('click', sync);
  signOut.addEventListener('click', async () => {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) status.textContent = 'Couldn’t sign out. Try again.';
  });
  dialog.addEventListener('close', () => schedule(0));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(0); });
  window.addEventListener('online', () => schedule(0));
  setInterval(() => { if (!document.hidden) schedule(0); }, 30000);
})();
