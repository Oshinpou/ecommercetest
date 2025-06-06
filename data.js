// data.js – Core data and account manager for Bobomacx

import Gun from 'https://cdn.jsdelivr.net/npm/gun/gun.js'
import SEA from 'https://cdn.jsdelivr.net/npm/gun/sea.js'
import 'https://cdn.jsdelivr.net/npm/gun/nts.js'
import PouchDB from 'https://cdn.jsdelivr.net/npm/pouchdb/dist/pouchdb.min.js'

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun'])
const db = new PouchDB('bobomacx_local')
const auth = Gun.SEA

let currentUser = null
let userData = {}

/** Account Management */
export const createAccount = async (username, password) => {
  const pair = await auth.pair()
  const encrypted = await auth.encrypt(password, pair)
  gun.get('accounts').get(username).put({
    pub: pair.pub,
    epub: pair.epub,
    password: encrypted,
    createdAt: Date.now()
  })
  localStorage.setItem('bobomacx_user', username)
  currentUser = username
}

export const loginAccount = async (username, password) => {
  gun.get('accounts').get(username).once(async data => {
    if (!data) return alert('User not found')
    const decrypted = await auth.decrypt(data.password, data)
    if (decrypted !== password) return alert('Incorrect password')
    localStorage.setItem('bobomacx_user', username)
    currentUser = username
    loadUserData()
  })
}

export const logoutAccount = () => {
  localStorage.removeItem('bobomacx_user')
  currentUser = null
  userData = {}
}

export const autoLogin = () => {
  const user = localStorage.getItem('bobomacx_user')
  if (user) {
    currentUser = user
    loadUserData()
  }
}

/** Load All User Data */
const loadUserData = () => {
  if (!currentUser) return
  gun.get('data').get(currentUser).map().on((val, key) => {
    userData[key] = val
    db.put({ _id: key, ...val }).catch(() => {})
  })
}

/** Save Any Type of Data */
export const saveData = (type, data) => {
  if (!currentUser) return
  gun.get('data').get(currentUser).get(type).put(data)
  db.put({ _id: type, ...data }).catch(() => {})
}

/** Product Card Generator */
export const generateProductCard = ({
  id,
  name,
  desc,
  usage,
  warning,
  ingredients,
  price,
  image,
  reviews,
  views,
  currency,
  category,
  subcategory
}) => {
  return {
    id,
    name,
    description: desc,
    usage,
    warning,
    ingredients,
    price,
    image,
    reviews,
    views,
    currency,
    category,       // e.g., "Clothing"
    subcategory,    // e.g., "Tops for Girls"
    url: `view-product.html?id=${id}`,
    token: `${name}-${id}`.replace(/\s+/g, '-')
  }
}

export const categoryOptions = { 'Clothing': [ 'Shirts for Men', 'Tops for Women', 'Dresses for Girls', 'Pants for Boys', 'Newborn Bodysuits', 'Jackets for Women', 'Ethnic Wear', 'Sleepwear', 'Activewear', 'Jeans', 'Skirts', 'Suits', 'Sarees', 'Kurtas', 'Leggings', 'Shorts', 'Blazers', 'Innerwear', 'Swimwear', 'Winterwear', 'Denim Jackets', 'Crop Tops', 'Tracksuits', 'Maternity Wear', 'Vests' ], 'Cosmetics': [ 'Face Creams', 'Serums', 'Shampoos', 'Hair Oils', 'Lip Balms', 'Face Wash', 'Toners', 'Moisturizers', 'Body Lotions', 'Sunscreens', 'Cleansers', 'Makeup Removers', 'Lipsticks', 'Eyeliners', 'Blushes', 'Highlighters', 'Compact Powders', 'Face Masks', 'Conditioners', 'Peels' ], 'Electronics': [ 'Mobile Phones', 'Earbuds', 'Chargers', 'Laptops', 'Monitors', 'Smart Watches', 'Cameras', 'Speakers', 'Bluetooth Devices', 'Power Banks', 'Gaming Consoles', 'Headphones', 'Projectors', 'Routers', 'Printers', 'Tablets', 'Smart TVs', 'Memory Cards', 'Hard Drives', 'VR Headsets' ], 'Furniture': [ 'Sofas', 'Beds', 'Dining Tables', 'Chairs', 'Wardrobes', 'Bookshelves', 'TV Units', 'Coffee Tables', 'Shoe Racks', 'Office Desks', 'Bean Bags', 'Side Tables', 'Stools', 'Cupboards', 'Vanity Tables', 'Study Tables', 'Recliners', 'Dressers', 'Mattresses', 'Cribs' ], 'Accessories': [ 'Watches', 'Bags', 'Belts', 'Wallets', 'Sunglasses', 'Hats', 'Scarves', 'Keychains', 'Phone Cases', 'Jewelry Sets', 'Bracelets', 'Earrings', 'Necklaces', 'Hair Accessories', 'Rings', 'Brooches', 'Anklets', 'Travel Pouches', 'Luggage Tags', 'Caps' ], 'Footwear': [ 'Sneakers', 'Formal Shoes', 'Casual Shoes', 'Sandals', 'Flip Flops', 'Heels', 'Boots', 'Slippers', 'Sports Shoes', 'Loafers', 'Ballet Flats', 'School Shoes', 'Wedges', 'Derby Shoes', 'Crocs', 'Running Shoes', 'Ethnic Footwear', 'Kids Footwear', 'Moccasins', 'Kolhapuris' ], 'Jewelry': [ 'Earrings', 'Necklaces', 'Bracelets', 'Rings', 'Anklets', 'Bangles', 'Nose Pins', 'Chokers', 'Toe Rings', 'Maang Tikka', 'Hair Pins', 'Brooches', 'Chains', 'Pendants', 'Cufflinks', 'Gemstone Jewelry', 'Pearl Jewelry', 'Gold Plated', 'Silver Jewelry', 'Fashion Sets' ], 'Home Decor': [ 'Wall Art', 'Lamps', 'Candles', 'Rugs', 'Curtains', 'Photo Frames', 'Vases', 'Mirrors', 'Planters', 'Clocks', 'Showpieces', 'Table Decor', 'Cushions', 'Storage Boxes', 'Decorative Lights', 'Room Dividers', 'Wall Stickers', 'Artificial Plants', 'Tapestries', 'Name Plates' ], 'Toys & Games': [ 'Board Games', 'Puzzles', 'Soft Toys', 'Action Figures', 'Educational Toys', 'Remote Control Toys', 'Dolls', 'Outdoor Play', 'Musical Toys', 'Ride-ons', 'Blocks', 'Building Sets', 'Craft Kits', 'Robots', 'Cards', 'Kites', 'Balloons', 'Toy Vehicles', 'Marbles', 'Learning Tablets' ], 'Luxury': [ 'Designer Bags', 'Luxury Watches', 'Gold Jewelry', 'Platinum Rings', 'Silk Scarves', 'Cashmere Coats', 'High-End Shoes', 'Luxury Perfumes', 'Limited Edition Collectibles', 'Designer Sunglasses', 'Luxury Skincare', 'Diamond Earrings', 'Premium Furniture', 'Luxury Chocolates', 'Satin Bedsheets', 'Crystal Showpieces', 'Gourmet Hampers', 'High-End Headphones', 'Luxury Pens', 'Exclusive Decor' ] };

/** Cart Management */
export const addToCart = (product) => {
  if (!userData.cart) userData.cart = []
  userData.cart.push(product)
  saveData('cart', { items: userData.cart })
}

export const removeFromCart = (id) => {
  if (!userData.cart) return
  userData.cart = userData.cart.filter(p => p.id !== id)
  saveData('cart', { items: userData.cart })
}

export const clearCart = () => {
  userData.cart = []
  saveData('cart', { items: [] })
}

/** Orders */
export const createOrder = (order) => {
  if (!userData.orders) userData.orders = []
  userData.orders.push(order)
  saveData('orders', { history: userData.orders })
}

/** Favorites */
export const addToFavorites = (id) => {
  if (!userData.favorites) userData.favorites = []
  userData.favorites.push(id)
  saveData('favorites', { items: userData.favorites })
}

/** Notifications */
export const notify = (msg) => {
  if (!userData.notifications) userData.notifications = []
  userData.notifications.push({ msg, time: Date.now() })
  saveData('notifications', { list: userData.notifications })
}

/** History */
export const addToHistory = (action) => {
  if (!userData.history) userData.history = []
  userData.history.push({ action, time: Date.now() })
  saveData('history', { events: userData.history })
}

/** Complaints */
export const fileComplaint = (text) => {
  if (!userData.complaints) userData.complaints = []
  userData.complaints.push({ text, date: Date.now() })
  saveData('complaints', { list: userData.complaints })
}

/** Static Pages */
export const storeStaticPages = (section, html) => {
  saveData(`static_${section}`, { content: html })
}

/** PouchDB & CouchDB Sync */
export const syncWithCouch = (remoteUrl) => {
  const remoteDB = new PouchDB(remoteUrl)
  db.sync(remoteDB, { live: true, retry: true })
}

/** Utility */
export const getAccountData = (key) => userData[key] || null
export const isLoggedIn = () => !!currentUser

/** Currency Management */
export const currencyOptions = [
  'USD', 'INR', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'SGD',
  'HKD', 'SEK', 'NOK', 'KRW', 'BRL', 'MXN', 'NZD', 'ZAR', 'RUB', 'AED',
  'TRY', 'THB', 'MYR', 'PHP', 'IDR', 'PLN', 'DKK', 'HUF', 'ILS', 'SAR'
]

let selectedCurrency = localStorage.getItem('bobomacx_currency') || 'USD'

export const setCurrency = (currency) => {
  if (currencyOptions.includes(currency)) {
    selectedCurrency = currency
    localStorage.setItem('bobomacx_currency', currency)
    notify(`Currency changed to ${currency}`)
  }
}

export const getCurrency = () => selectedCurrency

// Store per-user account data
export function setCurrency(currency) {
  const username = localStorage.getItem('loggedInUser')
  if (!username) return

  const allAccounts = JSON.parse(localStorage.getItem('accounts')) || {}
  if (!allAccounts[username]) return

  allAccounts[username].currency = currency
  localStorage.setItem('accounts', JSON.stringify(allAccounts))
}

export function getCurrency() {
  const username = localStorage.getItem('loggedInUser')
  if (!username) return 'USD'

  const allAccounts = JSON.parse(localStorage.getItem('accounts')) || {}
  return allAccounts[username]?.currency || 'USD'
}

localStorage.setItem('bobomacx_currency', currency)
  }
}

export const getCurrency = () => selectedCurrency

/** Currency Conversion (Basic placeholder) */
export const convertPrice = (amount, rate = 1) => {
  return parseFloat((amount * rate).toFixed(2))
}

/** Views Counter */
export const incrementProductView = (id) => {
  gun.get('views').get(id).once(data => {
    const count = (data || 0) + 1
    gun.get('views').get(id).put(count)
  })
}

/** Reviews Handler */
export const addReview = (productId, review) => {
  const reviewId = `${productId}-${Date.now()}`
  gun.get('reviews').get(productId).get(reviewId).put({
    ...review,
    createdAt: Date.now()
  })
}

/** Fetch Reviews */
export const getReviews = (productId, callback) => {
  gun.get('reviews').get(productId).map().on(callback)
}

/** Recently Viewed Products */
export const addRecentlyViewed = (product) => {
  if (!userData.recentlyViewed) userData.recentlyViewed = []
  userData.recentlyViewed = [product, ...userData.recentlyViewed.filter(p => p.id !== product.id)].slice(0, 10)
  saveData('recentlyViewed', { items: userData.recentlyViewed })
}

/** Promo Code Application */
export const applyPromoCode = (code) => {
  // Placeholder logic, can be extended with real promo rules
  const validCodes = {
    'WELCOME10': 10,
    'LUXURY20': 20,
    'BOBOSAVE30': 30
  }
  return validCodes[code] || 0
}

/** Search History */
export const addSearchTerm = (term) => {
  if (!userData.searchHistory) userData.searchHistory = []
  userData.searchHistory.unshift({ term, time: Date.now() })
  userData.searchHistory = userData.searchHistory.slice(0, 20)
  saveData('searchHistory', { terms: userData.searchHistory })
}

if (currencyOptions.includes(currency)) {
    selectedCurrency = currency
    localStorage.setItem('bobomacx_currency', currency)
  }
}

export const getCurrency = () => selectedCurrency

/** Update Account Password */
export const updatePassword = async (newPassword) => {
  if (!currentUser) return
  gun.get('accounts').get(currentUser).once(async data => {
    const decrypted = await auth.decrypt(data.password, data)
    if (decrypted) {
      const pair = { pub: data.pub, epub: data.epub }
      const encrypted = await auth.encrypt(newPassword, pair)
      gun.get('accounts').get(currentUser).put({ password: encrypted })
      notify('Password updated successfully')
    }
  })
}

/** Delete User Account */
export const deleteAccount = () => {
  if (!currentUser) return
  gun.get('accounts').get(currentUser).put(null)
  gun.get('data').get(currentUser).put(null)
  logoutAccount()
  notify('Account deleted permanently')
}

/** Toggle Favorites */
export const toggleFavorite = (id) => {
  if (!userData.favorites) userData.favorites = []
  const index = userData.favorites.indexOf(id)
  if (index > -1) {
    userData.favorites.splice(index, 1)
  } else {
    userData.favorites.push(id)
  }
  saveData('favorites', { items: userData.favorites })
}

/** Set Default Currency */
export const setCurrency = (currency) => {
  if (!currencyOptions.includes(currency)) return
  selectedCurrency = currency
  localStorage.setItem('bobomacx_currency', currency)
  notify(`Currency set to ${currency}`)
}

/** Get Selected Currency */
export const getCurrency = () => {
  return selectedCurrency || 'INR'
}

/** Initialize Local Currency from Storage */
(() => {
  const storedCurrency = localStorage.getItem('bobomacx_currency')
  if (storedCurrency && currencyOptions.includes(storedCurrency)) {
    selectedCurrency = storedCurrency
  } else {
    selectedCurrency = 'INR'
  }
})()

/** Generate Unique Order ID */
export const generateOrderId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `ORD-${timestamp}-${random}`.toUpperCase()
}

/** Filter Products by Category */
export const filterProducts = (category, subcategory, products) => {
  return products.filter(p =>
    (!category || p.category === category) &&
    (!subcategory || p.subcategory === subcategory)
  )
}

/** View Counter */
export const incrementProductView = (id) => {
  if (!userData.views) userData.views = {}
  userData.views[id] = (userData.views[id] || 0) + 1
  saveData('views', userData.views)
}

/** Review Management */
export const addReview = (productId, review) => {
  if (!userData.reviews) userData.reviews = {}
  if (!userData.reviews[productId]) userData.reviews[productId] = []
  userData.reviews[productId].push({ ...review, time: Date.now() })
  saveData('reviews', userData.reviews)
}

/** Promote Post / Product */
export const promoteItem = (type, id, details) => {
  if (!userData.promotions) userData.promotions = []
  userData.promotions.push({ type, id, details, promotedAt: Date.now() })
  saveData('promotions', { list: userData.promotions })
}

/** Delete Account */
export const deleteAccount = () => {
  if (!currentUser) return
  gun.get('accounts').get(currentUser).put(null)
  gun.get('data').get(currentUser).put(null)
  db.destroy().then(() => {
    logoutAccount()
  })
}

/** Backup All User Data */
export const exportUserData = () => {
  return JSON.stringify(userData, null, 2)
}

/** Import All User Data */
export const importUserData = (json) => {
  try {
    const data = JSON.parse(json)
    Object.keys(data).forEach(key => {
      saveData(key, data[key])
    })
  } catch (err) {
    console.error('Invalid JSON:', err)
  }
}
