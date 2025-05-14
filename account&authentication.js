// account&authentication.js

import Gun from 'gun'; import SEA from 'gun/sea'; import PouchDB from 'pouchdb'; import 'gun/sea'; import 'gun/lib/open';

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']); const db = new PouchDB('bobomacx_local'); const remoteCouch = 'https://your-couchdb-url/bobomacx'; // Replace with your CouchDB URL

let user = gun.user();

const auth = { async createAccount(alias, password, hint = '') { try { const ack = await user.create(alias, password); if (ack.err) throw ack.err; await user.get('hint').put(hint); return true; } catch (err) { console.error('Create account failed:', err); return false; } },

async loginAccount(alias, password) { return new Promise((resolve) => { user.auth(alias, password, (ack) => { if (ack.err) { console.error('Login failed:', ack.err); resolve(false); } else { localStorage.setItem('macx_session', JSON.stringify(user._)); resolve(true); } }); }); },

logoutAccount() { user.leave(); localStorage.removeItem('macx_session'); },

autoLogin() { const session = localStorage.getItem('macx_session'); if (session) { const alias = JSON.parse(session).alias; gun.user().recall({ sessionStorage: true }, () => { console.log('Session recalled for', alias); }); } },

async recoverPassword(alias) { try { const temp = gun.get('~@' + alias); temp.once((data) => { console.log('Recovery hint:', data?.hint || 'No hint'); }); } catch (err) { console.error('Recovery failed:', err); } },

async deleteAccount() { await user.get('status').put('deleted'); },

async permanentlyDeleteAccount() { user.delete(user.is.alias, user._.sea, (ack) => { if (ack.err) console.error('Permanent delete failed:', ack.err); else console.log('Account permanently deleted'); }); },

async changePassword(oldPassword, newPassword) { const alias = user.is.alias; await auth.logoutAccount(); const success = await auth.loginAccount(alias, oldPassword); if (!success) return false; return new Promise((resolve) => { user.auth(alias, oldPassword, async () => { const pair = await SEA.pair(); await gun.user().auth(alias, newPassword); resolve(true); }); }); },

isLoggedIn() { return !!user.is; },

async getAccountData() { return new Promise((resolve) => { user.once((data) => { resolve(data); }); }); },

async syncWithCouch() { try { await db.sync(remoteCouch, { live: true, retry: true }); console.log('CouchDB synced'); } catch (err) { console.error('CouchDB sync failed:', err); } },

async storeLocal(key, value) { try { await db.put({ _id: key, data: value }); return true; } catch (err) { console.error('Local store failed:', err); return false; } },

gunPeerSync(path, callback) { gun.get(path).on(callback); },

getPublicKey() { return user?.is?.pub || null; },

setLocalSession(data) { localStorage.setItem('macx_session', JSON.stringify(data)); } };

export default auth;

