// ===== Authentication State =====
let isLoggedIn = false;

// In-memory user database (persisted to localStorage)
function getUsersDB() {
  const users = localStorage.getItem('usersDB');
  return users ? JSON.parse(users) : [];
}

function saveUsersDB(users) {
  localStorage.setItem('usersDB', JSON.stringify(users));
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Find user by email
function findUser(email) {
  const users = getUsersDB();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Create new user
function createUser(email, password) {
  const users = getUsersDB();
  const newUser = {
    email: email.toLowerCase(),
    password: password,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsersDB(users);
  return newUser;
}

// Update user password
function updateUserPassword(email, newPassword) {
  const users = getUsersDB();
  const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    saveUsersDB(users);
    return true;
  }
  return false;
}

// Initialize
function initAuth() {
  isLoggedIn = false;
  localStorage.removeItem('robotAuth');
  localStorage.removeItem('loggedInEmail');
  updateLoginButton();
}

// Update login button text
function updateLoginButton() {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const navControlBtn = document.getElementById('navControlBtn');
  const mobileControlBtn = document.getElementById('mobileControlBtn');
  
  [navLoginBtn, mobileLoginBtn].forEach(btn => {
    if (btn) {
      if (isLoggedIn) {
        btn.style.display = 'none';
      } else {
        btn.style.display = '';
        btn.textContent = 'Login';
      }
    }
  });
  
  [navControlBtn, mobileControlBtn].forEach(btn => {
    if (btn) {
      btn.style.display = isLoggedIn ? '' : 'none';
    }
  });

  const heroBtn = document.getElementById('heroGetStarted');
  if (heroBtn) {
    heroBtn.textContent = isLoggedIn ? 'Control Panel' : 'Get Started';
  }
}

// Logout
function handleLogout() {
  isLoggedIn = false;
  localStorage.removeItem('robotAuth');
  localStorage.removeItem('loggedInEmail');
  updateLoginButton();
  showPage('home');
  showToast('Logged out', 'You have been signed out');
}

// ===== Page Navigation =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) {
      link.classList.add('active');
    }
  });

  if (mobileMenu) {
    mobileMenu.classList.remove('show');
  }

  window.scrollTo(0, 0);

  // Start camera stream when entering control page
  if (pageId === 'control') {
    setTimeout(startStream, 500);
  }
}

// Navigation links
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = link.dataset.page;
    
    if (pageId === 'control' && !isLoggedIn) {
      showPage('auth');
      return;
    }
    
    showPage(pageId);
  });
});

// Scroll links
document.querySelectorAll('.scroll-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const homePage = document.getElementById('page-home');
      if (!homePage.classList.contains('active')) {
        showPage('home');
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }

    if (mobileMenu) {
      mobileMenu.classList.remove('show');
    }
  });
});

// Hero button
const heroBtn = document.getElementById('heroGetStarted');
if (heroBtn) {
  heroBtn.addEventListener('click', () => {
    if (isLoggedIn) {
      showPage('control');
    } else {
      showPage('auth');
    }
  });
}

// ===== Mobile Menu Toggle =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
  });
}

// ===== Control Panel Hamburger Menu =====
const controlMenuBtn = document.getElementById('controlMenuBtn');
const controlDropdown = document.getElementById('controlDropdown');
const logoutBtn = document.getElementById('logoutBtn');

if (controlMenuBtn && controlDropdown) {
  controlMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    controlDropdown.classList.toggle('show');
  });
  
  document.addEventListener('click', (e) => {
    if (!controlDropdown.contains(e.target) && e.target !== controlMenuBtn) {
      controlDropdown.classList.remove('show');
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    handleLogout();
  });
}

// ===== Toast Notification =====
function showToast(title, message) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');

  if (toast && toastTitle && toastMessage) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// ===== Anto.io API =====
const ANTO_API_KEY = "Hayfk2nzZmkfXAy3EALML7JMdM9am4PaWdWSd4dg";
const ANTO_THING = "WaterRobot";
const CH_CONTROL = "control";
const CH_PUMP = "pump";
const CH_ARMS = "Arm_on_off";

function syncStatus() {
  fetch(`https://api.anto.io/channel/get/${ANTO_API_KEY}/${ANTO_THING}/${CH_PUMP}`)
    .then(res => res.json())
    .then(data => {
      const isOn = parseInt(data.value) === 1;
      updateButtonVisual(pumpBtn, isOn, 'pump');
    })
    .catch(err => console.log('Sync pump error:', err));

  fetch(`https://api.anto.io/channel/get/${ANTO_API_KEY}/${ANTO_THING}/${CH_ARMS}`)
    .then(res => res.json())
    .then(data => {
      const isOn = parseInt(data.value) === 1;
      updateButtonVisual(armsBtn, isOn, 'arm');
    })
    .catch(err => console.log('Sync arms error:', err));
}

function updateButtonVisual(btn, isActive, type) {
  if (!btn) return;
  btn.dataset.active = isActive.toString();
}

function sendToAnto(channel, value) {
  const url = `https://api.anto.io/channel/set/${ANTO_API_KEY}/${ANTO_THING}/${channel}/${value}`;
  
  fetch(url)
    .then(response => {
      if (response.ok) {
        console.log(`Success: Set ${channel} to ${value}`);
      } else {
        console.error(`Failed: Status ${response.status}`);
      }
    })
    .catch(error => {
      console.error("Error sending to Anto:", error);
    });
}

// ===== ESP32-CAM Live Streaming (FIXED) =====
const ESP32_IP = "10.48.223.173:81";
const STREAM_PORT = "81";
const STREAM_PATH = "/stream";
const STREAM_URL = `http://${ESP32_IP}:${STREAM_PORT}${STREAM_PATH}`;

let cameraRetryTimeout = null;

function startStream() {
  // ✅ ดึง element ใหม่ทุกครั้งที่เรียกใช้ (ป้องกัน null)
  const streamImg = document.getElementById('cameraStream');
  const placeholder = document.getElementById('cameraPlaceholder');
  const indicator = document.getElementById('cameraIndicator');
  const recIndicator = document.getElementById('recIndicator');
  
  // ✅ เช็คว่า element มีอยู่จริง
  if (!streamImg || !placeholder || !indicator) {
    console.error("❌ Camera elements not found!");
    return;
  }
  
  console.log("🔄 Starting camera stream:", STREAM_URL);
  
  // Clear timeout ก่อนหน้า
  if (cameraRetryTimeout) {
    clearTimeout(cameraRetryTimeout);
    cameraRetryTimeout = null;
  }
  
  // ✅ เพิ่ม timestamp เพื่อป้องกัน cache
  streamImg.src = STREAM_URL + "?t=" + Date.now();
  
  // ✅ สำเร็จ
  streamImg.onload = function() {
    console.log("✅ Camera connected successfully!");
    streamImg.style.display = 'block';
    placeholder.style.display = 'none';
    indicator.classList.add('active');
    indicator.textContent = 'LIVE';
    if (recIndicator) recIndicator.style.display = 'flex';
  };

  // ✅ ล้มเหลว - retry อัตโนมัติ
  streamImg.onerror = function() {
    console.error("❌ Camera connection failed");
    streamImg.style.display = 'none';
    placeholder.style.display = 'flex';
    indicator.classList.remove('active');
    indicator.textContent = 'OFFLINE';
    if (recIndicator) recIndicator.style.display = 'none';
    
    // ลองเชื่อมต่อใหม่ใน 5 วินาที
    cameraRetryTimeout = setTimeout(function() {
      console.log("🔄 Retrying connection...");
      startStream();
    }, 5000);
  };
}

// Retry button
const retryBtn = document.getElementById('retryBtn');
if (retryBtn) {
  retryBtn.addEventListener('click', function() {
    console.log("🔄 Manual retry...");
    startStream();
  });
}

// ===== Drive Controls =====
const driveButtons = document.querySelectorAll('.drive-btn');
let lastControlValue = 0;

driveButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const direction = btn.dataset.direction;
    const btnId = btn.id;
    let val = 0;
    
    if (btnId === 'btnForward') val = 1;
    else if (btnId === 'btnLeft') val = 2;
    else if (btnId === 'btnRight') val = 3;
    else if (btnId === 'btnBackward') val = 4;
    
    executeDrive(direction, btnId, val);
  });
});

function executeDrive(direction, btnId, value) {
  if (!value) return;

  if (lastControlValue === value) {
    sendToAnto(CH_CONTROL, 0);
    lastControlValue = 0;
    showToast('Stopping', 'Robot stopped');
    
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.remove('active-drive');
  } else {
    sendToAnto(CH_CONTROL, value);
    lastControlValue = value;
    showToast(`Driving ${direction}`, 'Command sent to robot');
    
    document.querySelectorAll('.drive-btn').forEach(b => b.classList.remove('active-drive'));
    
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active-drive');
  }

  const btn = document.getElementById(btnId);
  if (btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => { btn.style.transform = ''; }, 100);
  }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const controlPage = document.getElementById('page-control');
  if (!controlPage || !controlPage.classList.contains('active')) return;
  
  const key = e.key.toLowerCase();
  let direction = null;
  let btnId = null;
  let antoValue = null;

  switch (key) {
    case 'w':
      direction = 'forward';
      btnId = 'btnForward';
      antoValue = 1;
      break;
    case 'a':
      direction = 'left';
      btnId = 'btnLeft';
      antoValue = 2;
      break;
    case 's':
      direction = 'backward';
      btnId = 'btnBackward';
      antoValue = 4;
      break;
    case 'd':
      direction = 'right';
      btnId = 'btnRight';
      antoValue = 3;
      break;
  }

  if (direction && btnId && antoValue) {
    executeDrive(direction, btnId, antoValue);
  }
});

// ===== Function Buttons =====
const pumpBtn = document.getElementById('pumpBtn');
const armsBtn = document.getElementById('armsBtn');
const captureBtn = document.getElementById('captureBtn');
const stopBtn = document.getElementById('stopBtn');

if (pumpBtn) {
  pumpBtn.addEventListener('click', () => {
    const currentActive = pumpBtn.dataset.active === 'true';
    const newActive = !currentActive;
    const valueToSend = newActive ? 1 : 0;

    updateButtonVisual(pumpBtn, newActive, 'pump');
    showToast(newActive ? 'Pump ON' : 'Pump OFF', newActive ? 'Water flowing' : 'Water stopped');
    sendToAnto(CH_PUMP, valueToSend);
  });
}

if (armsBtn) {
  armsBtn.addEventListener('click', () => {
    const currentActive = armsBtn.dataset.active === 'true';
    const newActive = !currentActive;
    const valueToSend = newActive ? 1 : 0;

    updateButtonVisual(armsBtn, newActive, 'arm');
    showToast(newActive ? 'Arms Open' : 'Arms Closed', newActive ? 'Pipes in open position' : 'Pipes in closed position');
    sendToAnto(CH_ARMS, valueToSend);
  });
}

// Capture Photo
const galleryGrid = document.getElementById('galleryGrid');
let photos = JSON.parse(localStorage.getItem('robotPhotos') || '[]');

function renderGallery() {
  if (!galleryGrid) return;

  if (photos.length === 0) {
    galleryGrid.innerHTML = '<p class="no-photos">No photos captured yet. Click "Snap" to take a photo.</p>';
  } else {
    galleryGrid.innerHTML = photos.map(photo => `
      <div class="gallery-item">
        <img src="${photo.url}" alt="Captured at ${photo.date}">
      </div>
    `).join('');
  }
}

if (captureBtn) {
  captureBtn.addEventListener('click', () => {
    showToast('Capturing photo', 'Requesting photo from ESP32...');

    setTimeout(() => {
      const newPhoto = {
        url: `https://picsum.photos/800/600?random=${Date.now()}`,
        date: new Date().toLocaleString()
      };
      photos.unshift(newPhoto);
      localStorage.setItem('robotPhotos', JSON.stringify(photos));
      renderGallery();
      showToast('Photo captured!', 'Photo saved to gallery');
    }, 500);
  });
}

renderGallery();

// Emergency Stop
if (stopBtn) {
  stopBtn.addEventListener('click', () => {
    showToast('Emergency Stop!', 'Robot halted');

    sendToAnto(CH_CONTROL, 0);
    sendToAnto(CH_PUMP, 0);
    sendToAnto(CH_ARMS, 0);
    updateButtonVisual(pumpBtn, false, 'pump');
    updateButtonVisual(armsBtn, false, 'arm');
    
    document.querySelectorAll('.drive-btn').forEach(b => b.classList.remove('active-drive'));
    lastControlValue = 0;
    
    stopBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      stopBtn.style.transform = '';
    }, 100);
  });
}

// ===== Auth Tabs =====
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

if (loginTab && signupTab && loginForm && signupForm) {
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });
}

// ===== Form Submissions =====
const loginButton = document.getElementById('loginButton');
const signupButton = document.getElementById('signupButton');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeForgotModal = document.getElementById('closeForgotModal');
const resetPasswordButton = document.getElementById('resetPasswordButton');

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (forgotPasswordModal) {
      forgotPasswordModal.classList.add('show');
    }
  });
}

if (closeForgotModal) {
  closeForgotModal.addEventListener('click', () => {
    if (forgotPasswordModal) {
      forgotPasswordModal.classList.remove('show');
    }
  });
}

if (resetPasswordButton) {
  resetPasswordButton.addEventListener('click', () => {
    const email = document.getElementById('resetEmail').value;
    const newPassword = document.getElementById('newPassword').value;

    if (!isValidEmail(email)) {
      showToast('Error', 'Please enter a valid email');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Error', 'Password must be at least 6 characters');
      return;
    }

    const user = findUser(email);
    if (!user) {
      showToast('Error', 'Email not found');
      return;
    }

    updateUserPassword(email, newPassword);
    showToast('Success', 'Password updated successfully');
    forgotPasswordModal.classList.remove('show');
  });
}

if (loginButton) {
  loginButton.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!isValidEmail(email)) {
      showToast('Error', 'Please enter a valid email');
      return;
    }

    const user = findUser(email);
    if (!user || user.password !== password) {
      showToast('Error', 'Invalid email or password');
      return;
    }

    isLoggedIn = true;
    localStorage.setItem('robotAuth', 'true');
    localStorage.setItem('loggedInEmail', user.email);
    updateLoginButton();
    showToast('Welcome back!', 'Login successful');
    showPage('control');
  });
}

if (signupButton) {
  signupButton.addEventListener('click', () => {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!isValidEmail(email)) {
      showToast('Error', 'Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      showToast('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Error', 'Passwords do not match');
      return;
    }

    if (findUser(email)) {
      showToast('Error', 'Email already registered');
      return;
    }

    createUser(email, password);
    isLoggedIn = true;
    localStorage.setItem('robotAuth', 'true');
    localStorage.setItem('loggedInEmail', email);
    updateLoginButton();
    showToast('Welcome!', 'Account created successfully');
    showPage('control');
  });
}

// ===== Scroll Animation =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
  console.log("📄 DOM loaded, initializing...");
  
  initAuth();
  updateLoginButton();
  
  // Sync สถานะอุปกรณ์
  syncStatus();
  setInterval(syncStatus, 3000);
});
