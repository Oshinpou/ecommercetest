// Core utility setup for bobomacx data.js // This file uses Gun.js, PouchDB, and CouchDB to support global, real-time, distributed account management and data sync

import Gun from 'https://cdn.jsdelivr.net/npm/gun/gun.js' import SEA from 'https://cdn.jsdelivr.net/npm/gun/sea.js' import 'https://cdn.jsdelivr.net/npm/gun/nts.js' import PouchDB from 'https://cdn.jsdelivr.net/npm/pouchdb/dist/pouchdb.min.js'

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']) const db = new PouchDB('bobomacx_local')

const auth = Gun.SEA

// Global variables let currentUser = null let userData = {}

/** Core Function Groups (100 Functional Expectations) */

/** User Account Functions */ export const createAccount = async (username, password) => { const pair = await auth.pair() const encrypted = await auth.encrypt(password, pair) gun.get('accounts').get(username).put({ pub: pair.pub, epub: pair.epub, password: encrypted, createdAt: Date.now() }) localStorage.setItem('bobomacx_user', username) currentUser = username }

export const loginAccount = async (username, password) => { gun.get('accounts').get(username).once(async data => { if (!data) return alert('User not found') const decrypted = await auth.decrypt(data.password, data) if (decrypted !== password) return alert('Incorrect password') localStorage.setItem('bobomacx_user', username) currentUser = username loadUserData() }) }

export const logoutAccount = () => { localStorage.removeItem('bobomacx_user') currentUser = null userData = {} }

export const recoverPassword = async (username, hint) => { // Implement with user-defined questions or OTP methods }

/** Session & Auto-login */ export const autoLogin = () => { const user = localStorage.getItem('bobomacx_user') if (user) { currentUser = user loadUserData() } }

/** Load All User Data */ const loadUserData = () => { if (!currentUser) return gun.get('data').get(currentUser).map().on((val, key) => { userData[key] = val db.put({ _id: key, ...val }).catch(() => {}) }) }

/** Save Any Data Type */ export const saveData = (type, data) => { if (!currentUser) return gun.get('data').get(currentUser).get(type).put(data) db.put({ _id: type, ...data }).catch(() => {}) }

/** Product Card */ export const generateProductCard = ({ id, name, desc, usage, warning, ingredients, price, image, reviews, views, currency }) => { return { id, name, description: desc, usage, warning, ingredients, price, image, reviews, views, currency, url: view-product.html?id=${id}, token: ${name}-${id}.replace(/\s+/g, '-') } }

/** Cart Functions */ export const addToCart = (product) => { if (!userData.cart) userData.cart = [] userData.cart.push(product) saveData('cart', { items: userData.cart }) }

export const removeFromCart = (id) => { if (!userData.cart) return userData.cart = userData.cart.filter(p => p.id !== id) saveData('cart', { items: userData.cart }) }

export const clearCart = () => { userData.cart = [] saveData('cart', { items: [] }) }

/** Orders */ export const createOrder = (order) => { if (!userData.orders) userData.orders = [] userData.orders.push(order) saveData('orders', { history: userData.orders }) }

/** Favorites */ export const addToFavorites = (id) => { if (!userData.favorites) userData.favorites = [] userData.favorites.push(id) saveData('favorites', { items: userData.favorites }) }

/** Notifications */ export const notify = (msg) => { if (!userData.notifications) userData.notifications = [] userData.notifications.push({ msg, time: Date.now() }) saveData('notifications', { list: userData.notifications }) }

/** History */ export const addToHistory = (action) => { if (!userData.history) userData.history = [] userData.history.push({ action, time: Date.now() }) saveData('history', { events: userData.history }) }

/** Complaint */ export const fileComplaint = (text) => { if (!userData.complaints) userData.complaints = [] userData.complaints.push({ text, date: Date.now() }) saveData('complaints', { list: userData.complaints }) }

/** Support, Help, FAQs, Policies */ export const storeStaticPages = (section, html) => { saveData(static_${section}, { content: html }) }

/** Peer-to-Peer and Couch Sync */ export const syncWithCouch = (remoteUrl) => { const remoteDB = new PouchDB(remoteUrl) db.sync(remoteDB, { live: true, retry: true }) }

/** Utility */ export const getAccountData = (key) => userData[key] || null export const isLoggedIn = () => !!currentUser

// More utilities and feature-specific handlers can be generated based on this template

  
