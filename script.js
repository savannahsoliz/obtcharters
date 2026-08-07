// Navbar scroll state
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const revealItems = document.querySelectorAll('.reveal');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => observer.observe(item));

const statsStrip = document.querySelector('.stats-strip');
const statNumbers = document.querySelectorAll('.stat-number');

if (statsStrip && statNumbers.length) {
  const formatValue = (value, target) => {
    if (target === 100) {
      return `${value}%`;
    }
    return `${value}`;
  };

  const animateCounter = (element, target, duration = 2000) => {
    const startTime = performance.now();
    const startValue = 0;

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (target - startValue) * eased);
      element.textContent = formatValue(currentValue, target);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statNumbers.forEach((element) => {
          const target = Number(element.dataset.target || 0);
          animateCounter(element, target);
        });
        observerInstance.disconnect();
      }
    });
  }, { threshold: 0.35 });

  statsObserver.observe(statsStrip);
}

const selectedDateInput = document.getElementById('reserve-selected-date');
const tripRequestForm = document.getElementById('trip-request-form');
const successMessage = document.getElementById('trip-request-success');
const calendarButtons = document.querySelectorAll('.calendar-day');
const EMAILJS_PUBLIC_KEY = 'pAVuz1cvrL_PD7ZPs';
const EMAILJS_SERVICE_ID = 'service_nyzxf5j';
const EMAILJS_TEMPLATE_ID = 'template_0d9axbo';
const OWNER_EMAIL = 'obt.charters@gmail.com';

if (typeof window.emailjs !== 'undefined') {
  window.emailjs.init(EMAILJS_PUBLIC_KEY);
}

calendarButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (selectedDateInput) {
      selectedDateInput.value = button.getAttribute('data-date');
    }
    document.querySelectorAll('.calendar-day').forEach((day) => day.classList.remove('selected'));
    button.classList.add('selected');
  });
});

if (tripRequestForm) {
  tripRequestForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(tripRequestForm);
    const templateParams = {
      to_email: OWNER_EMAIL,
      reply_to: formData.get('email') || '',
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      preferred_trip_date: formData.get('selectedDate') || '',
      number_of_people: formData.get('people') || '',
      trip_type: formData.get('tripType') || '',
      comments: formData.get('comments') || '',
    };

    const submitButton = tripRequestForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    if (successMessage) {
      successMessage.classList.remove('error');
      successMessage.textContent = '';
    }

    if (typeof window.emailjs === 'undefined' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY' || EMAILJS_SERVICE_ID === 'service_id' || EMAILJS_TEMPLATE_ID === 'template_id') {
      if (successMessage) {
        successMessage.classList.add('error');
        successMessage.textContent = 'Email delivery is not configured yet. Please contact the charter owner directly at obt.charters@gmail.com or call (361) 815-4752.';
      }
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Trip Request';
      }
      return;
    }

    window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        tripRequestForm.reset();
        if (selectedDateInput) {
          selectedDateInput.value = '';
        }
        document.querySelectorAll('.calendar-day').forEach((day) => day.classList.remove('selected'));
        if (successMessage) {
          successMessage.textContent = 'Thank you for your trip request! The charter owner will contact you soon to confirm availability.';
        }
      })
      .catch((error) => {
        console.error('EmailJS request failed:', error);
        if (successMessage) {
          successMessage.classList.add('error');
          successMessage.textContent = 'We could not send your request right now. Please contact the charter owner directly at obt.charters@gmail.com or call (361) 815-4752.';
        }
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Send Trip Request';
        }
      });
  });
}

