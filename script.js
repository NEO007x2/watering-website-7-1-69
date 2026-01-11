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
  
  [navControlBtn, mobileControlBtn].forEach(btn => {
    if (btn) {
      if (isLoggedIn) {
        btn.style.display = '';
      } else {
        btn.style.display = 'none';
      }
    }
  });
  
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
  if (pageId === 'control' && !isLoggedIn) {
    showToast('Authentication Required', 'Please login to access the control panel');
    showPage('auth');
    return;
  }

  if (pageId === 'auth' && isLoggedIn) {
    handleLogout();
    return;
  }

  pages.forEach(page => page.classList.remove('active'));
  
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  document.querySelectorAll('[data-page]').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) {
      link.classList.add('active');
    }
  });
  
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) mobileMenu.classList.remove('show');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  setTimeout(handleScrollAnimations, 100);
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-page]');
  if (link) {
    e.preventDefault();
    const pageId = link.dataset.page;
    if (pageId) showPage(pageId);
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
    if (mobileMenu) mobileMenu.classList.remove('show');
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
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// Anto.io settings
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
    .catch(() => {});

  fetch(`https://api.anto.io/channel/get/${ANTO_API_KEY}/${ANTO_THING}/${CH_ARMS}`)
    .then(res => res.json())
    .then(data => {
      const isOn = parseInt(data.value) === 1;
      updateButtonVisual(armsBtn, isOn, 'arm');
    })
    .catch(() => {});
}

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

// ===== Drive Controls =====
const driveButtons = document.querySelectorAll('.drive-btn');
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

let lastControlValue = 0;

function executeDrive(direction, btnId, value) {
  if (!value) return;

  if (lastControlValue === value) {
    sendToAnto(CH_CONTROL, 0);
    lastControlValue = 0;
    showToast(`Stopping`, 'Robot stopped (Toggle)');
    document.getElementById(btnId)?.classList.remove('active-drive');
  } else {
    sendToAnto(CH_CONTROL, value);
    lastControlValue = value;
    showToast(`Driving ${direction}`, 'Command sent to robot');
    
    document.querySelectorAll('.drive-btn').forEach(b => b.classList.remove('active-drive'));
    document.getElementById(btnId)?.classList.add('active-drive');
  }

  const btn = document.getElementById(btnId);
  if (btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => { btn.style.transform = ''; }, 100);
  }
}

// ===== Keyboard Controls (WASD) =====
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  
  const controlPage = document.getElementById('page-control');
  if (!controlPage || !controlPage.classList.contains('active')) return;
  
  const key = e.key.toLowerCase();
  let direction = null;
  let btnId = null;
  let antoValue = null;

  switch (key) {
    case 'w': direction = 'forward';    btnId = 'btnForward';   antoValue = 1; break;
    case 'a': direction = 'left';       btnId = 'btnLeft';      antoValue = 2; break;
    case 's': direction = 'backward';   btnId = 'btnBackward';  antoValue = 4; break;
    case 'd': direction = 'right';      btnId = 'btnRight';     antoValue = 3; break;
  }

  if (direction) {
    e.preventDefault();
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
    showToast(
      newActive ? 'Arms Open (180°)' : 'Arms Closed (90°)',
      newActive ? 'Pipes in open position' : 'Pipes in closed position'
    );
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
    galleryGrid.innerHTML = photos.map((photo, index) => `
      <div class="gallery-item">
        <img src="${photo.url}" alt="Captured at ${photo.date}">
        <button class="delete-photo-btn" onclick="deletePhoto(${index})" title="Delete photo">×</button>
      </div>
    `).join('');
  }
}

// Delete photo function
function deletePhoto(index) {
  photos.splice(index, 1);
  localStorage.setItem('robotPhotos', JSON.stringify(photos));
  renderGallery();
  showToast('Photo Deleted', 'Photo removed from gallery');
}

if (captureBtn) {
  captureBtn.addEventListener('click', () => {
    const streamImg = document.getElementById('cameraStream');
    
    // Check if camera stream is active and visible
    if (!streamImg || streamImg.style.display === 'none' || !streamImg.src || streamImg.src === '') {
      showToast('Camera Offline', 'Cannot capture photo - camera stream is not active');
      return;
    }

    // Check if image is actually loaded
    if (!streamImg.complete || streamImg.naturalWidth === 0) {
      showToast('Camera Loading', 'Please wait for camera to fully load');
      return;
    }

    showToast('Capturing photo', 'Saving image from ESP32 camera...');

    // Use a small delay to ensure the frame is fully rendered
    setTimeout(() => {
      try {
        // Create a canvas to capture the current frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Set canvas size to match the actual image dimensions
        const width = streamImg.naturalWidth || streamImg.videoWidth || streamImg.width || 640;
        const height = streamImg.naturalHeight || streamImg.videoHeight || streamImg.height || 480;
        
        canvas.width = width;
        canvas.height = height;
        
        console.log(`Capturing image: ${width}x${height}`);
        
        // Draw the current frame
        ctx.drawImage(streamImg, 0, 0, width, height);
        
        // Convert canvas to data URL (base64 encoded image)
        let capturedImageUrl;
        try {
          capturedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
        } catch (corsError) {
          console.error('CORS error when exporting canvas:', corsError);
          showToast('CORS Error', 'Camera image cannot be exported due to security restrictions. Using fetch method...');
          
          // Alternative method: fetch the image and convert to base64
          fetch(streamImg.src)
            .then(response => response.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result;
                
                const newPhoto = {
                  url: base64data,
                  date: new Date().toLocaleString(),
                  width: width,
                  height: height
                };
                
                photos.unshift(newPhoto);
                
                if (photos.length > 20) {
                  photos = photos.slice(0, 20);
                }
                
                localStorage.setItem('robotPhotos', JSON.stringify(photos));
                renderGallery();
                showToast('Photo captured!', `Photo saved via fetch (${width}x${height})`);
                console.log(`Photo saved via fetch. Total photos: ${photos.length}`);
              };
              reader.readAsDataURL(blob);
            })
            .catch(fetchError => {
              console.error('Fetch error:', fetchError);
              showToast('Capture Failed', 'Unable to capture image via fetch method');
            });
          
          return;
        }
        
        // Verify that we actually captured something (not just a blank canvas)
        if (capturedImageUrl.length < 1000) {
          showToast('Capture Failed', 'Unable to capture image data. Try again.');
          console.error('Captured image is too small, likely blank');
          return;
        }
        
        // Save to photos array
        const newPhoto = {
          url: capturedImageUrl,
          date: new Date().toLocaleString(),
          width: width,
          height: height
        };
        
        photos.unshift(newPhoto);
        
        // Keep only last 20 photos to avoid localStorage limits
        if (photos.length > 20) {
          photos = photos.slice(0, 20);
        }
        
        localStorage.setItem('robotPhotos', JSON.stringify(photos));
        renderGallery();
        showToast('Photo captured!', `Photo saved (${width}x${height})`);
        
        console.log(`Photo saved successfully. Total photos: ${photos.length}`);
        
      } catch (error) {
        console.error('Error capturing photo:', error);
        showToast('Capture Error', 'Failed to capture photo: ' + error.message);
      }
    }, 100);
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
    setTimeout(() => stopBtn.style.transform = '', 100);
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
    forgotPasswordModal?.classList.add('show');
  });
}

if (closeForgotModal) {
  closeForgotModal.addEventListener('click', () => {
    forgotPasswordModal?.classList.remove('show');
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
    
    if (!resetEmail || !isValidEmail(resetEmail)) {
      showToast('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    const user = findUser(resetEmail);
    if (!user) {
      showToast('Email Not Found', 'No account exists with this email');
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      showToast('Password Mismatch', 'Passwords do not match');
      return;
    }
    
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
    
    if (!email || !isValidEmail(email)) {
      showToast('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    if (!password) {
      showToast('Missing Password', 'Please enter your password');
      return;
    }
    
    const user = findUser(email);
    if (!user || user.password !== password) {
      showToast('Login Failed', 'Wrong email or password');
      return;
    }
    
    isLoggedIn = true;
    localStorage.setItem('robotAuth', 'true');
    localStorage.setItem('loggedInEmail', email);
    
    updateLoginButton();
    showToast('Login Successful', 'Redirecting to control panel...');
    setTimeout(() => showPage('control'), 1000);
  });
}

if (signupButton) {
  signupButton.addEventListener('click', () => {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!email || !isValidEmail(email)) {
      showToast('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    if (findUser(email)) {
      showToast('Email Already Exists', 'An account with this email already exists');
      return;
    }
    
    if (!password || password.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      showToast('Password Mismatch', 'Passwords do not match');
      return;
    }

    createUser(email, password);
    showToast('Account Created', 'Please login to continue');
    loginTab.click();
    
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  });
}

// ===== Scroll Animations =====
function handleScrollAnimations() {
  document.querySelectorAll('.animate-on-scroll').forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      setTimeout(() => el.classList.add('visible'), index * 50);
    }
  });
}

window.addEventListener('scroll', handleScrollAnimations);

// ===== ESP32 Camera Stream with Improved Stability =====
const esp32Ip = "10.48.223.173";
const streamPort = ":81";
const streamPath = "/stream";
const streamUrl = `http://${esp32Ip}${streamPort}${streamPath}`;

const cameraView = document.querySelector('.camera-view');
const streamImg = document.getElementById('cameraStream');
const placeholder = document.getElementById('cameraPlaceholder');
const indicator = document.querySelector('.camera-indicator');
const placeholderText = document.getElementById('placeholderText'); // Add id="placeholderText" to <p> in HTML

let errorCount = 0;
const MAX_ERRORS_BEFORE_OFFLINE = 2;
const RETRY_DELAY = 1200; // 1.2 seconds - good balance between fast & not overloading ESP32

function startStream() {
  function isESPReachable(callback) {
    fetch(`http://${esp32Ip}`, { method: 'HEAD', mode: 'no-cors' })
      .then(() => callback(true))
      .catch(() => callback(false));
  }

  function attemptConnect() {
    isESPReachable((reachable) => {
      if (!reachable) {
        console.log("ESP32 not reachable - retrying later");
        setDisconnected();
        setTimeout(attemptConnect, RETRY_DELAY * 2);
        return;
      }

      // Add crossOrigin attribute to allow canvas export
      streamImg.crossOrigin = "anonymous";
      streamImg.src = streamUrl + '?t=' + Date.now(); // Cache busting
      console.log("Attempting to connect to camera stream...");
      
      if (placeholderText) {
        placeholderText.textContent = 'Connecting to camera...';
      }
    });
  }

  streamImg.onload = () => {
    errorCount = 0;
    console.log("Camera stream connected");
    streamImg.style.display = 'block';
    placeholder.style.display = 'none';
    indicator.classList.add('active');
    if (placeholderText) placeholderText.textContent = 'Camera stream offline';
  };

  streamImg.onerror = () => {
    errorCount++;
    console.warn(`Camera stream error (count: ${errorCount})`);

    if (errorCount >= MAX_ERRORS_BEFORE_OFFLINE) {
      setDisconnected();
    } else {
      if (placeholderText) placeholderText.textContent = 'Reconnecting...';
      placeholder.style.display = 'flex';
      streamImg.style.display = 'none';
      indicator.classList.remove('active');
    }

    setTimeout(() => {
      streamImg.src = "";
      setTimeout(attemptConnect, 100);
    }, RETRY_DELAY);
  };

  function setDisconnected() {
    console.log("Camera fully disconnected (after multiple errors)");
    streamImg.style.display = 'none';
    placeholder.style.display = 'flex';
    indicator.classList.remove('active');
    if (placeholderText) placeholderText.textContent = 'Camera stream offline';
  }

  // Start first attempt
  attemptConnect();
}

// ===== Initialization =====
window.addEventListener('load', () => {
  initAuth();
  showPage('home');
  handleScrollAnimations();
  
  // Clear old photos from picsum (clean up localStorage)
  const oldPhotos = JSON.parse(localStorage.getItem('robotPhotos') || '[]');
  const cleanedPhotos = oldPhotos.filter(photo => {
    // Keep only photos that are base64 data URLs (not external URLs)
    return photo.url && photo.url.startsWith('data:image');
  });
  
  if (cleanedPhotos.length !== oldPhotos.length) {
    localStorage.setItem('robotPhotos', JSON.stringify(cleanedPhotos));
    photos = cleanedPhotos;
    console.log(`Cleaned up ${oldPhotos.length - cleanedPhotos.length} old external photos`);
    renderGallery();
  }
  
  // Animate chart bars on load
  setTimeout(() => {
    document.querySelectorAll('.chart-bar-fill').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => bar.style.width = width, 100);
    });
  }, 500);

  // Start camera stream
  startStream();

  // Sync Anto status every 3 seconds
  syncStatus();
  setInterval(syncStatus, 3000);
});

console.log('Robot Control Panel loaded!');
console.log('Hold phone horizontally (landscape) for game controller layout.');