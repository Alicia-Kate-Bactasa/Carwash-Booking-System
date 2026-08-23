/**
 * File: scripts/supabaseClient.js
 * Purpose: Supabase client initialization and core helper functions for Montage Auto Studio.
 * Handles authentication, database queries, and storage integration.
 */

// Replace these placeholder values with your actual Supabase credentials from your Supabase Dashboard
// (Project Settings -> API)
const SUPABASE_URL = window.SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client
let supabaseClient = null;

if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('Supabase SDK not loaded yet. Make sure to include the CDN script tag before supabaseClient.js');
}

/**
 * Returns the active Supabase client instance.
 */
function getSupabase() {
    if (!supabaseClient && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

/**
 * Gets the current authenticated user session.
 */
async function getCurrentUser() {
    const sb = getSupabase();
    if (!sb) return null;
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) return null;
    return user;
}

/**
 * Gets the detailed user profile from the local public."user" table
 * (public.profiles does not exist in this database).
 */
async function getUserProfile() {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) return null;

    const user = await getCurrentUser();
    if (!user) return null;

    return { id: user.id, email: user.email, ...dbUser };
}

/**
 * Resolves the local integer-backed application user for the signed-in
 * Supabase auth user.
 *
 * bookings.user_id and subscriptions.user_id are INT foreign keys to
 * public."user"(user_id) — the Supabase auth UUID must NEVER be used in
 * those columns (PostgREST rejects it with a 400 type error).
 *
 * The row is found by JWT email (RLS scoped to the owner) and provisioned
 * on first login. Result is cached per browser session.
 */
async function getCurrentDbUser() {
    const user = await getCurrentUser();
    if (!user || !user.email) return null;

    const cacheKey = 'montage_db_user_' + user.id;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        try { return JSON.parse(cached); } catch (e) { /* refetch below */ }
    }

    const sb = getSupabase();
    if (!sb) return null;

    const { data: existing } = await sb
        .from('user')
        .select('user_id, email, username, role')
        .eq('email', user.email)
        .maybeSingle();

    let dbUser = existing;
    if (!dbUser) {
        // First login with this email: provision the local row (scoped RLS
        // policy only permits inserting our own email).
        const fallbackUsername = user.email.split('@')[0] + '-' + Date.now().toString(36);
        await sb.from('user').insert({
            email: user.email,
            username: fallbackUsername,
            password: 'supabase-managed',
            role: 'Customer'
        });
        const { data: created } = await sb
            .from('user')
            .select('user_id, email, username, role')
            .eq('email', user.email)
            .maybeSingle();
        dbUser = created;
    }

    if (dbUser) {
        try { sessionStorage.setItem(cacheKey, JSON.stringify(dbUser)); } catch (e) { /* ignore */ }
    }
    return dbUser || null;
}

/**
 * Signs out the current user and redirects to home page or login modal.
 */
async function signOutUser(redirectUrl = 'index.html') {
    const sb = getSupabase();
    if (sb) {
        await sb.auth.signOut();
    }
    if (redirectUrl) {
        window.location.href = redirectUrl;
    }
}

// Export getters to global scope for script usage
window.getSupabase = getSupabase;
window.getCurrentUser = getCurrentUser;
window.getUserProfile = getUserProfile;
window.getCurrentDbUser = getCurrentDbUser;
window.signOutUser = signOutUser;
