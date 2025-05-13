// Initialize Gun
const gun = Gun(['https://gunjs-server.herokuapp.com/gun']); // You can set up your own relay too
const pouch = new PouchDB('macx_local');
const couch = new PouchDB('https://admin:password@yourcouchdbserver.com/macx_users', {
  skip_setup: true,
});

// Global user node
let userNode = null;
let currentUser = null;

// SIGNUP
function signup() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  gun.get('users').get(email).put({ email, password });
  pouch.put({ _id: email, password });
  couch.put({ _id: email, password });

  alert("Account created successfully.");
}

// LOGIN
function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  gun.get('users').get(email).once(data => {
    if (data && data.password === password) {
      localStorage.setItem('macx_user', email);
      currentUser = email;
      alert("Logged in!");
      window.location.href = "home.html"; // redirect to logged-in page
    } else {
      alert("Invalid credentials.");
    }
  });
}

// RECOVER PASSWORD (Simple demo)
function recoverPassword() {
  const email = document.getElementById('recoverEmail').value;
  gun.get('users').get(email).once(data => {
    if (data) {
      alert("Your password is: " + data.password);
    } else {
      alert("Email not found.");
    }
  });
}

// LOGGED-IN SESSION ACROSS PAGES
window.onload = function () {
  const email = localStorage.getItem('macx_user');
  if (email) {
    currentUser = email;
    userNode = gun.get('users').get(email);
  }
}

// Example function to save product to cart
function addToCart(productId) {
  if (!currentUser) return alert("Login required");
  gun.get('users').get(currentUser).get('cart').set(productId);
  pouch.put({ _id: 'cart_' + productId, productId });
  couch.put({ _id: 'cart_' + productId, productId });
}

// Store and manage all account-specific data
function saveUserData(key, value) {
  if (!currentUser) return;
  gun.get('users').get(currentUser).get(key).put(value);
  pouch.put({ _id: currentUser + '_' + key, value });
  couch.put({ _id: currentUser + '_' + key, value });
}

// Example: Retrieve cart
function getCart(callback) {
  if (!currentUser) return;
  gun.get('users').get(currentUser).get('cart').map().once(data => {
    if (data) callback(data);
  });
}

function addToCart(productId) {
  if (!currentUser) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }
  const timestamp = new Date().toISOString();
  const cartItem = { id: productId, added: timestamp };

  gun.get('users').get(currentUser).get('cart').set(cartItem);
  pouch.put({ _id: 'cart_' + productId + '_' + timestamp, ...cartItem });
  couch.put({ _id: 'cart_' + productId + '_' + timestamp, ...cartItem });

  alert("Added to cart.");
}
