// Wait for Supabase library to load
if (typeof window.supabase === 'undefined') {
  console.error('ERROR: Supabase library not loaded!');
  alert('Error loading authentication system. Please refresh the page.');
}

const supabaseUrl = 'https://niecaaetykuszimlvark.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZWNhYWV0eWt1c3ppbWx2YXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDE5ODUsImV4cCI6MjA4NDM3Nzk4NX0.hDHKccUYk4amDoMIJt_A5XR7uneUPmj0BqsN0zd98BA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let isLoggedIn = false;
let currentUser = null;

// Check if user is already logged in on page load
async function checkAuthStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    isLoggedIn = true;
    currentUser = session.user;
    updateLoginButton();
  } else {
    isLoggedIn = false;
    currentUser = null;
    updateLoginButton();
  }
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
async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    isLoggedIn = false;
    currentUser = null;
    updateLoginButton();
    showToast('Logged Out', 'You have been logged out successfully');
    showPage('home');
  } else {
    showToast('Logout Failed', error.message);
  }
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

// ===== Anto.io settings =====
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
        <img src="${photo.url}" alt="Captured at ${photo.date}" style="transform: rotate(180deg);">
        <button class="delete-photo-btn" onclick="deletePhoto(${index})" title="Delete photo">×</button>
      </div>
    `).join('');
  }
}

function deletePhoto(index) {
  photos.splice(index, 1);
  localStorage.setItem('robotPhotos', JSON.stringify(photos));
  renderGallery();
  showToast('Photo Deleted', 'Photo removed from gallery');
}

if (captureBtn) {
  captureBtn.addEventListener('click', () => {
    const streamImg = document.getElementById('cameraStream');
    
    if (!streamImg || streamImg.style.display === 'none' || !streamImg.src || streamImg.src === '') {
      showToast('Camera Offline', 'Cannot capture photo - camera stream is not active');
      return;
    }

    if (!streamImg.complete || streamImg.naturalWidth === 0) {
      showToast('Camera Loading', 'Please wait for camera to fully load');
      return;
    }

    showToast('Capturing photo', 'Saving image from ESP32 camera...');

    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        const width = streamImg.naturalWidth || streamImg.videoWidth || streamImg.width || 640;
        const height = streamImg.naturalHeight || streamImg.videoHeight || streamImg.height || 480;
        
        canvas.width = width;
        canvas.height = height;
        
        console.log(`Capturing image: ${width}x${height}`);
        
        // Draw image without rotation - rotation will be applied when displaying
        ctx.drawImage(streamImg, 0, 0, width, height);
        
        let capturedImageUrl;
        try {
          capturedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
        } catch (corsError) {
          console.error('CORS error when exporting canvas:', corsError);
          showToast('CORS Error', 'Camera image cannot be exported due to security restrictions. Using fetch method...');
          
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
        
        if (capturedImageUrl.length < 1000) {
          showToast('Capture Failed', 'Unable to capture image data. Try again.');
          console.error('Captured image is too small, likely blank');
          return;
        }
        
        const newPhoto = {
          url: capturedImageUrl,
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

// ===== Supabase Authentication Functions =====
const loginButton = document.getElementById('loginButton');
const signupButton = document.getElementById('signupButton');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeForgotModal = document.getElementById('closeForgotModal');
const resetPasswordButton = document.getElementById('resetPasswordButton');

// Login
if (loginButton) {
  loginButton.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email) {
      showToast('Missing Email', 'Please enter your email');
      return;
    }
    
    if (!password) {
      showToast('Missing Password', 'Please enter your password');
      return;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      showToast('Login Failed', error.message);
    } else {
      isLoggedIn = true;
      currentUser = data.user;
      updateLoginButton();
      showToast('Login Successful', 'Redirecting to control panel...');
      setTimeout(() => showPage('control'), 1000);
    }
  });
}

// Sign Up
if (signupButton) {
  signupButton.addEventListener('click', async () => {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!email) {
      showToast('Missing Email', 'Please enter your email');
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

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) {
      showToast('Signup Failed', error.message);
    } else {
      showToast('Account Created', 'Check your email to confirm your account, then login');
      loginTab.click();
      
      document.getElementById('signupEmail').value = '';
      document.getElementById('signupPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    }
  });
}

// Forgot Password Modal
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

// Reset Password
if (resetPasswordButton) {
  resetPasswordButton.addEventListener('click', async () => {
    const resetEmail = document.getElementById('resetEmail').value.trim();
    
    if (!resetEmail) {
      showToast('Missing Email', 'Please enter your email');
      return;
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin
    });
    
    if (error) {
      showToast('Reset Failed', error.message);
    } else {
      showToast('Email Sent', 'Check your email for password reset instructions');
      forgotPasswordModal.classList.remove('show');
      document.getElementById('resetEmail').value = '';
    }
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
const esp32Ip = "10.25.126.173";
const streamPort = ":81";
const streamPath = "/stream";
const streamUrl = `http://${esp32Ip}${streamPort}${streamPath}`;

const cameraView = document.querySelector('.camera-view');
const streamImg = document.getElementById('cameraStream');
const placeholder = document.getElementById('cameraPlaceholder');
const indicator = document.querySelector('.camera-indicator');
const placeholderText = document.getElementById('placeholderText');

let errorCount = 0;
const MAX_ERRORS_BEFORE_OFFLINE = 2;
const RETRY_DELAY = 1200;

function startStream() {
  const connectionStatus = document.getElementById('connectionStatus');
  const cameraIndicator = document.querySelector('.camera-indicator');
  
  // NEW FUNCTION to update both indicators
  function updateConnectionStatus(connected) {
    if (connectionStatus) {
      if (connected) {
        connectionStatus.classList.add('connected');
        connectionStatus.querySelector('span').textContent = 'Connected';
      } else {
        connectionStatus.classList.remove('connected');
        connectionStatus.querySelector('span').textContent = 'Offline';
      }
    }
    if (cameraIndicator) {
      if (connected) {
        cameraIndicator.classList.add('connected');
      } else {
        cameraIndicator.classList.remove('connected');
      }
    }
  }
  
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

      streamImg.crossOrigin = "anonymous";
      streamImg.src = streamUrl + '?t=' + Date.now();
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
    streamImg.style.transform = 'rotate(180deg)';
    placeholder.style.display = 'none';
    updateConnectionStatus(true); // ← THIS IS NEW
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
      updateConnectionStatus(false); // ← THIS IS NEW
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
    updateConnectionStatus(false); // ← THIS IS NEW
    if (placeholderText) placeholderText.textContent = 'Camera stream offline';
  }

  attemptConnect();
}

// --- KEEP ALL YOUR EXISTING CODE ABOVE ---

// ===== Initialization =====
window.addEventListener('load', async () => {
  await checkAuthStatus();
  showPage('home');
  handleScrollAnimations();
  
  // *** NEW HEARTBEAT CODE START ***
  // This tells the CMD panel that the user is actually on the website
  setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await supabase.auth.updateUser({
        data: { last_seen: new Date().toISOString() }
      });
      console.log('Heartbeat sent to Supabase...');
    }
  }, 30000); // 30 seconds
  // *** NEW HEARTBEAT CODE END ***

  const oldPhotos = JSON.parse(localStorage.getItem('robotPhotos') || '[]');
  const cleanedPhotos = oldPhotos.filter(photo => {
    return photo.url && photo.url.startsWith('data:image');
  });
  
  if (cleanedPhotos.length !== oldPhotos.length) {
    localStorage.setItem('robotPhotos', JSON.stringify(cleanedPhotos));
    photos = cleanedPhotos;
    renderGallery();
  }
  
  setTimeout(() => {
    document.querySelectorAll('.chart-bar-fill').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => bar.style.width = width, 100);
    });
  }, 500);

  startStream();
  syncStatus();
  setInterval(syncStatus, 3000);
});

console.log('Robot Control Panel loaded with Supabase!');
console.log('Hold phone horizontally (landscape) for game controller layout.');
