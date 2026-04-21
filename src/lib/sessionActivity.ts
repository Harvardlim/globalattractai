const LAST_ACTIVITY_KEY = 'app_last_activity';
const INACTIVITY_LIMIT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Record current timestamp as last activity */
export function recordActivity() {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch {
    // localStorage may be unavailable
  }
}

/** Check if the session has expired due to inactivity (7 days) */
export function isSessionExpiredByInactivity(): boolean {
  try {
    const last = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!last) return false; // First visit, no expiry
    const elapsed = Date.now() - parseInt(last, 10);
    return elapsed > INACTIVITY_LIMIT_MS;
  } catch {
    return false;
  }
}

/** Clear the activity timestamp (on sign out) */
export function clearActivity() {
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    // ignore
  }
}
