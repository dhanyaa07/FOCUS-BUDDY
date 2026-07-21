// PWA Install Prompt Handler
let deferredPrompt;
let installButton;

window.addEventListener('load', () => {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    }

    // Create install button
    createInstallButton();
});

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Save the event for later
    deferredPrompt = e;
    // Show install button
    if (installButton) {
        installButton.style.display = 'block';
    }
});

function createInstallButton() {
    // Check if button already exists
    if (document.getElementById('pwa-install-btn')) return;

    installButton = document.createElement('button');
    installButton.id = 'pwa-install-btn';
    installButton.innerHTML = '📱 Install App';
    installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    z-index: 9999;
    display: none;
    transition: all 0.3s;
  `;

    installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'scale(1.05)';
    });

    installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'scale(1)';
    });

    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);

        // Clear the deferred prompt
        deferredPrompt = null;

        // Hide the install button
        installButton.style.display = 'none';
    });

    document.body.appendChild(installButton);
}

// Listen for app installed event
window.addEventListener('appinstalled', () => {
    console.log('ADHD Assist PWA installed!');
    if (installButton) {
        installButton.style.display = 'none';
    }
});

// Check if app is running as PWA
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

// Show different UI if running as PWA
if (isPWA()) {
    console.log('Running as PWA!');
    document.body.classList.add('pwa-mode');
}

// Offline/Online status
window.addEventListener('online', () => {
    console.log('Back online!');
    showNotification('You\'re back online! 🌐', 'success');
});

window.addEventListener('offline', () => {
    console.log('Gone offline!');
    showNotification('You\'re offline. Some features may be limited. 📵', 'warning');
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#667eea'};
    color: white;
    padding: 12px 24px;
    border-radius: 20px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    animation: slideDown 0.3s ease;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
  .pwa-mode {
    /* Additional styles for PWA mode */
  }
`;
document.head.appendChild(style);
