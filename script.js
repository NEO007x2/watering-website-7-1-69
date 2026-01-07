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

// Initialize - DO NOT auto-login, always start logged out
function initAuth() {
  // Always start logged out - no auto-login
  isLoggedIn = false;
  localStorage.removeItem('robotAuth');
  localStorage.removeItem('loggedInEmail');
  updateLoginButton();
}

// Update login button text based on auth status
function updateLoginButton() {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const navControlBtn = document.getElementById('navControlBtn');
  const mobileControlBtn = document.getElementById('mobileControlBtn');
  
  // Update login buttons - hide when logged in (logout is in control panel hamburger menu)
  [navLoginBtn, mobileLoginBtn].forEach(btn => {
    if (btn) {
      if (isLoggedIn) {
        btn.style.display = 'none';
      } else {
        btn.style.display = '';
        btn.textContent = 'Login';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
      }
    }
  });
  
  // Show/hide control panel buttons (only show when logged in)
  [navControlBtn, mobileControlBtn].forEach(btn => {
    if (btn) {
      if (isLoggedIn) {
        btn.style.display = '';
      } else {
        btn.style.display = 'none';
      }
    }
  });
  
  // Update hero button
  const heroButtons = document.querySelectorAll('.hero-buttons [data-page="auth"]');
  heroButtons.forEach(btn => {
    if (isLoggedIn) {
      btn.setAttribute('data-page', 'control');
      btn.innerHTML = `Control Your Robot Now
        <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>`;
    } else {
      btn.setAttribute('data-page', 'auth');
      btn.innerHTML = `Control Your Robot Now
        <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>`;
    }
  });
}

// Handle logout
function handleLogout() {
  isLoggedIn = false;
  localStorage.removeItem('robotAuth');
  localStorage.removeItem('loggedInEmail');
  updateLoginButton();
  showToast('Logged Out', 'You have been logged out successfully');
  showPage('home');
}

// ===== Page Navigation =====
const pages = document.querySelectorAll('.page');

function showPage(pageId) {
  // Check if trying to access control panel without login
  if (pageId === 'control' && !isLoggedIn) {
    showToast('Authentication Required', 'Please login to access the control panel');
    showPage('auth');
    return;
  }

  // Handle logout click when logged in
  if (pageId === 'auth' && isLoggedIn) {
    handleLogout();
    return;
  }

  // Hide all pages
  pages.forEach(page => page.classList.remove('active'));
  
  // Show selected page
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Update nav links
  document.querySelectorAll('[data-page]').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) {
      link.classList.add('active');
    }
  });
  
  // Close mobile menu
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    mobileMenu.classList.remove('show');
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Trigger scroll animations on new page
  setTimeout(handleScrollAnimations, 100);
}

// Add click handlers to navigation links
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-page]');
  if (link) {
    e.preventDefault();
    const pageId = link.dataset.page;
    if (pageId) {
      showPage(pageId);
    }
  }
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('.scroll-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      showPage('home');
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      mobileMenu.classList.remove('show');
    }
  });
});

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

// ===== Drive Controls ===== //
const driveButtons = document.querySelectorAll('.drive-btn');
driveButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const direction = btn.dataset.direction;
    showToast(`Driving ${direction}`, 'Command sent to robot');
    
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 100);
  });
});

// Anto settting
const ANTO_API_KEY = "Hayfk2nzZmkfXAy3EALML7JMdM9am4PaWdWSd4dg"; // key anto
const ANTO_THING = "WaterRobot";
const CH_CONTROL = "control";
const CH_PUMP = "pump";
const CH_ARMS = "Arm_on_off";

function syncStatus(){
  // check status pump
  fetch(`https://api.anto.io/channel/get/${ANTO_API_KEY}/${ANTO_THING}/${CH_PUMP}`)
    .then(res => res.json())
    .then(data => {
      const isOn = parseInt(data.value) === 1;
      updateButtonVisual(pumpBtn, isOn, 'pump');
    });

  //check status arm
  fetch(`https://api.anto.io/channel/get/${ANTO_API_KEY}/${ANTO_THING}/${CH_ARMS}`)
    .then(res => res.json())
    .then(data => {
      const isOn = parseInt(data.value) === 1;
      updateButtonVisual(armsBtn, isOn, 'arm');
    });  
}

//--- change Btn status function ---//
function updateButtonVisual(btn, isActive, type) {
  if (!btn) return;
  
  
  const currentState = btn.dataset.active === 'true';
  
  
  if (currentState !== isActive) {
    btn.dataset.active = isActive.toString();
    
    
    if (type === 'pump') {
       console.log(`Pump synced: ${isActive ? 'ON' : 'OFF'}`);
    } else if (type === 'arm') {
       console.log(`Arm synced: ${isActive ? 'Open' : 'Closed'}`);
    }
  }
}

function sendToAnto(channel, value) {
  
  const url = `https://api.anto.io/channel/set/${ANTO_API_KEY}/${ANTO_THING}/${channel}/${value}`;

  
  fetch(url)
.then(response => {
      if(response.ok) {
         console.log(`Success: Set ${channel} to ${value}`);
      } else {
         console.error(`Failed: Status ${response.status}`);
      }
    })
    .catch(error => {
      console.error("Error sending to Anto:", error);
    });
}

// ===== Keyboard Controls (WASD) =====

let lastControlValue = 0; // to keep last data in control channel

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

  if (direction) {
    e.preventDefault();

    if(antoValue !== null) {
      
      
      if (lastControlValue === antoValue) {
        // repeat hit Btn
        sendToAnto(CH_CONTROL, 0);
        lastControlValue = 0; // set to 0
        showToast(`Stopping`, 'Robot stopped (Toggle)');
        
      } else {
        // new hit Btn
        sendToAnto(CH_CONTROL, antoValue);
        lastControlValue = antoValue; 
        showToast(`Driving ${direction}`, 'Command sent to robot');
      }
    }

    // Animation 
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 100);
    }
  }
});

// ===== Function Buttons =====
const pumpBtn = document.getElementById('pumpBtn');
const armsBtn = document.getElementById('armsBtn');
const captureBtn = document.getElementById('captureBtn');
const stopBtn = document.getElementById('stopBtn');

if (pumpBtn) {
  pumpBtn.addEventListener('click', () => {

    // toggle status btn
    const currentActive = pumpBtn.dataset.active === 'true';
    const newActive = !currentActive;
    const valueToSend = newActive ? 1 : 0;

    // update UI
    updateButtonVisual(pumpBtn, newActive, 'pump');
    showToast(newActive ? 'Pump ON' : 'Pump OFF', newActive ? 'Water flowing' : 'Water stopped');

    // send to anto 
    sendToAnto(CH_PUMP, valueToSend);
  });
}

if (armsBtn) {
 armsBtn.addEventListener('click', () => {
   
    // toggle status btn
    const currentActive = armsBtn.dataset.active === 'true';
    const newActive = !currentActive;
    const valueToSend = newActive ? 1 : 0;

    // update UI
    updateButtonVisual(armsBtn, newActive, 'arm');
    showToast(newActive ? 'Arms Open (180°)' : 'Arms Closed (90°)', newActive ? 'Pipes in open position' : 'Pipes in closed position');
    
    // send to anto
    sendToAnto(CH_ARMS, valueToSend);
  });
}

// ===== Capture Photo =====
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

// ===== Emergency Stop =====
if (stopBtn) {
  stopBtn.addEventListener('click', () => {
    showToast('Emergency Stop!', 'Robot halted');

    sendToAnto(CH_CONTROL, 0);
    sendToAnto(CH_PUMP, 0);
    sendToAnto(CH_ARMS, 0);
    updateButtonVisual(pumpBtn, false, 'pump');
    updateButtonVisual(armsBtn, false, 'arm');
    
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

if (forgotPasswordModal) {
  forgotPasswordModal.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.classList.remove('show');
    }
  });
}

if (resetPasswordButton) {
  resetPasswordButton.addEventListener('click', () => {
    const resetEmail = document.getElementById('resetEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Email validation
    if (!resetEmail) {
      showToast('Invalid Email', 'Please enter your email address');
      return;
    }
    
    if (!isValidEmail(resetEmail)) {
      showToast('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    // Check if user exists
    const user = findUser(resetEmail);
    if (!user) {
      showToast('Email Not Found', 'No account exists with this email address');
      return;
    }
    
    // Password validation
    if (!newPassword) {
      showToast('Weak Password', 'Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      showToast('Password Mismatch', 'Passwords do not match');
      return;
    }
    
    // Simulate email verification
    showToast('Verifying Email', 'Simulating email verification...');
    
    setTimeout(() => {
      if (updateUserPassword(resetEmail, newPassword)) {
        showToast('Password Reset', 'Your password has been successfully reset');
        forgotPasswordModal.classList.remove('show');
        document.getElementById('resetEmail').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
      }
    }, 1500);
  });
}

if (loginButton) {
  loginButton.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Email validation
    if (!email) {
      showToast('Invalid Email', 'Please enter your email address');
      return;
    }
    
    if (!isValidEmail(email)) {
      showToast('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    // Password validation
    if (!password) {
      showToast('Missing Password', 'Please enter your password');
      return;
    }
    
    // Find user in database
    const user = findUser(email);
    
    // User doesn't exist - can't login with random credentials
    if (!user) {
      showToast('Login Failed', 'Wrong email or password');
      return;
    }
    
    // Wrong password
    if (user.password !== password) {
      showToast('Login Failed', 'Wrong email or password');
      return;
    }
    
    // Successful login
    isLoggedIn = true;
    localStorage.setItem('robotAuth', 'true');
    localStorage.setItem('loggedInEmail', email);
    
    updateLoginButton();
    
    showToast('Login Successful', 'Redirecting to control panel...');
    setTimeout(() => {
      showPage('control');
    }, 1000);
  });
}

if (signupButton) {
  signupButton.addEventListener('click', () => {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    // Email validation
    if (!email) {
      showToast('Invalid Email', 'Please enter your email address');
      return;
    }
    
    if (!isValidEmail(email)) {
      showToast('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    // Check for duplicate email
    if (findUser(email)) {
      showToast('Email Already Exists', 'An account with this email already exists');
      return;
    }
    
    // Password validation
    if (!password) {
      showToast('Weak Password', 'Please enter a password');
      return;
    }
    
    if (password.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    // Confirm password
    if (password !== confirm) {
      showToast('Password Mismatch', 'Passwords do not match');
      return;
    }

    // Create new user
    createUser(email, password);
    
    showToast('Account Created', 'Please login to continue');
    loginTab.click();
    
    // Clear form
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  });
}

// ===== Scroll Animations =====
function handleScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  elements.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight - 50;
    
    if (isVisible) {
      setTimeout(() => {
        el.classList.add('visible');
      }, index * 50);
    }
  });
}

window.addEventListener('scroll', handleScrollAnimations);

window.addEventListener('load', () => {
  // Initialize auth (always logged out on page load)
  initAuth();
  
  // Always show home page on load
  showPage('home');
  
  handleScrollAnimations();
  
  // Animate chart bars
  setTimeout(() => {
    const chartBars = document.querySelectorAll('.chart-bar-fill');
    chartBars.forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = width;
      }, 100);
    });
  }, 500);
});

// Intersection Observer for animations
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

console.log('Robot Control Panel loaded!');
console.log('Hold phone horizontally (landscape) for game controller layout.');

// ESP32 cam live streamimg 

  const esp32Ip = "10.231.38.238"; //esp32 cam IP
  const streamPort = ":81";        
  const streamPath = "/stream";    

  const streamUrl = `http://${esp32Ip}${streamPort}${streamPath}`;

  
  const cameraView = document.querySelector('.camera-view');
  const streamImg = document.getElementById('cameraStream');
  const placeholder = document.getElementById('cameraPlaceholder');
  const indicator = document.querySelector('.camera-indicator');

  function startStream() {
    
    streamImg.src = streamUrl;
    
    // live stream successful 
    streamImg.onload = () => {
      console.log("Camera connected");
      streamImg.style.display = 'block';      
      placeholder.style.display = 'none';     
      indicator.classList.add('active');      
    };

    // live stream fail
    streamImg.onerror = () => {
      console.log("Camera disconnected or error");
      streamImg.style.display = 'none';       
      placeholder.style.display = 'flex';     
      indicator.classList.remove('active');   
      
      // reconnect in 5 sec
      setTimeout(() => {
        streamImg.src = ""; 
        setTimeout(() => { streamImg.src = streamUrl; }, 100); 
      }, 5000);
    };
  }

  // start function
  document.addEventListener('DOMContentLoaded', () => {
    
    // start stream
    startStream(); 

    // recheck status Btn
    syncStatus();
    
    //check status in 3 sec
    setInterval(syncStatus, 3000); 
});
