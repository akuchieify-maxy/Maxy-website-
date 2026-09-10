/**
 * MAXY Interactive Scripts & Dynamic SEO Manager
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. LOCAL STORAGE HELPER FUNCTIONS
     ========================================== */
  function saveEmailToLocalStorage(email, source) {
    try {
      const storedEmails = JSON.parse(localStorage.getItem('maxySubscribers')) || [];
      const newSubscriber = {
        email: email.toLowerCase(),
        source: source,
        date: new Date().toISOString()
      };
      storedEmails.push(newSubscriber);
      localStorage.setItem('maxySubscribers', JSON.stringify(storedEmails));
    } catch (e) {
      console.warn("Local storage is restricted or unavailable.", e);
    }
  }

  function isAlreadySubscribed(email) {
    try {
      const stored = JSON.parse(localStorage.getItem('maxySubscribers')) || [];
      return stored.some(sub => sub.email.toLowerCase() === email.toLowerCase());
    } catch (e) {
      return false;
    }
  }

  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }


  /* ==========================================
     2. COUNTDOWN TIMER MODULE
     ========================================== */
  const targetDate = new Date("January 1, 2027 00:00:00").getTime();
  let timerInterval = null;

  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
      if (timerInterval) clearInterval(timerInterval);
      return;
    }

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    } else {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      if (timerInterval) clearInterval(timerInterval);
    }
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);


  /* ==========================================
     3. SHARED FORMSPREE SUBMISSION HELPER
     ========================================== */
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvkoqqgz";

  async function submitFormPayload(email, source) {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: email,
        source: source,
        submittedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error("Formspree server returned an error.");
    }

    saveEmailToLocalStorage(email, source);
    return response;
  }


  /* ==========================================
     4. HOMEPAGE EARLY ACCESS FORM
     ========================================== */
  const signupForm = document.getElementById('signupForm');
  const signupEmail = document.getElementById('signupEmail');
  const signupFeedback = document.getElementById('signupFeedback');

  if (signupForm && signupEmail && signupFeedback) {
    signupForm.addEventListener('submit', async function(event) {
      event.preventDefault(); 
      const email = signupEmail.value.trim();

      if (!email) {
        signupFeedback.textContent = "Please enter your email address.";
        signupFeedback.style.display = "block";
        signupFeedback.style.color = "#e74c3c";
        return;
      }

      if (!isValidEmail(email)) {
        signupFeedback.textContent = "Please enter a valid email address (e.g., name@example.com).";
        signupFeedback.style.display = "block";
        signupFeedback.style.color = "#e74c3c";
        return;
      }

      if (isAlreadySubscribed(email)) {
        signupFeedback.textContent = "You are already on our early access list!";
        signupFeedback.style.display = "block";
        signupFeedback.style.color = "var(--gold)";
        return;
      }

      signupFeedback.textContent = "Connecting to early access list...";
      signupFeedback.style.display = "block";
      signupFeedback.style.color = "var(--gold)";

      try {
        await submitFormPayload(email, "MAXY Homepage Early Access");
        signupFeedback.textContent = `Success! Welcome to MAXY Early Access, ${email}.`;
        signupFeedback.style.color = "var(--gold)";
        signupEmail.value = "";
      } catch (error) {
        signupFeedback.textContent = "Oops! Problem submitting your email. Please try again.";
        signupFeedback.style.color = "#e74c3c";
      }
    });
  }


  /* ==========================================
     5. COMING SOON NOTIFY FORM MODULE
     ========================================== */
  const notifyForm = document.getElementById('notifyForm');
  const userEmail = document.getElementById('userEmail');
  const formFeedback = document.getElementById('formFeedback');

  if (notifyForm && userEmail && formFeedback) {
    notifyForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      const emailValue = userEmail.value.trim();
      const submitBtn = notifyForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      if (!emailValue) {
        formFeedback.textContent = "Please enter your email address.";
        formFeedback.style.display = "block";
        formFeedback.style.color = "#e74c3c";
        return;
      }

      if (!isValidEmail(emailValue)) {
        formFeedback.textContent = "Please enter a valid email address.";
        formFeedback.style.display = "block";
        formFeedback.style.color = "#e74c3c";
        return;
      }

      if (isAlreadySubscribed(emailValue)) {
        formFeedback.textContent = "You are already signed up for notification updates!";
        formFeedback.style.display = "block";
        formFeedback.style.color = "var(--gold)";
        return;
      }

      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Notifying...`;

      try {
        await submitFormPayload(emailValue, "MAXY Coming Soon Page");
        formFeedback.textContent = `Thank you! We will notify ${emailValue} when this product launches.`;
        formFeedback.style.color = "var(--gold)";
        userEmail.value = '';
      } catch (error) {
        formFeedback.textContent = "Oops! Problem submitting your email. Please try again.";
        formFeedback.style.color = "#e74c3c";
      } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }


  /* ==========================================
     6. MOBILE NAVIGATION MODULE
     ========================================== */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }


  /* ==========================================
     7. PRODUCT CAROUSEL AUTO-SLIDER
     ========================================== */
  const track = document.getElementById('productTrack');
  const container = document.getElementById('carouselContainer');

  if (track && container) {
    let currentIndex = 0;
    const cards = track.children;

    function slideProducts() {
      if (!cards || cards.length === 0) return;

      const totalCards = cards.length;
      const cardWidth = cards[0].getBoundingClientRect().width + 15; 
      const containerWidth = container.getBoundingClientRect().width;
      const visibleCards = Math.round(containerWidth / cardWidth) || 1;

      currentIndex++;
      const maxIndex = totalCards - visibleCards;

      if (currentIndex > maxIndex) { 
        currentIndex = 0;
      }

      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }

    let slideInterval = setInterval(slideProducts, 3000);

    container.addEventListener('mouseenter', () => clearInterval(slideInterval));
    container.addEventListener('mouseleave', () => {
      slideInterval = setInterval(slideProducts, 3000);
    });

    window.addEventListener('resize', () => {
      currentIndex = 0;
      track.style.transform = `translateX(0px)`;
    });
  }


  /* ==========================================
     8. PRODUCT PREVIEW MODAL MODULE
     ========================================== */
  const modal = document.getElementById('previewModal');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (modal && openModalBtn && closeModalBtn) {
    openModalBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      updatePageMeta(
        "MAXY - Exclusive Product Sneak Peek", 
        "Preview upcoming Nigerian food innovations from MAXY launching January 2027."
      );
    });

    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  }


  /* ==========================================
     9. DYNAMIC SEO METADATA MANAGER
     ========================================== */
  function updatePageMeta(title, description) {
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
    }
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
    }
  }

});
