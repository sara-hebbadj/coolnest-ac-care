/* CoolNest AC Care prototype
   Built with plain JavaScript. All saved data stays in this browser via localStorage. */

(() => {
  'use strict';

  const STORAGE_KEY = 'coolnestBookings';
  const LAST_BOOKING_KEY = 'coolnestLastBookingRef';
  const DASHBOARD_SESSION_KEY = 'coolnestDashboardLoggedIn';

  const SERVICES = {
    'AC Inspection': {
      slug: 'inspection',
      description: 'A structured check to identify the likely cause of cooling, leaking, smell, or noise concerns.',
      price: 149
    },
    'AC Cleaning': {
      slug: 'cleaning',
      description: 'Routine cleaning for accessible filters, vents, and internal components to support fresher airflow.',
      price: 189
    },
    'Coil Cleaning': {
      slug: 'coil-cleaning',
      description: 'Focused cleaning for indoor or outdoor coils when dirt buildup may be affecting performance.',
      price: 279
    },
    'AC Duct Cleaning': {
      slug: 'duct-cleaning',
      description: 'A deeper service concept for homes with persistent dust, odour, or airflow concerns across rooms.',
      price: 799
    },
    'Emergency Repair': {
      slug: 'emergency-repair',
      description: 'Priority assessment for urgent loss of cooling, active leaking, or other time-sensitive AC issues.',
      price: 249
    },
    'Annual Care Plan': {
      slug: 'annual-care-plan',
      description: 'A scheduled maintenance concept for households that prefer planned visits and reminders.',
      price: 899
    },
    'Property Manager Plan': {
      slug: 'property-manager-plan',
      description: 'A flexible maintenance concept for landlords, holiday-home teams, and multi-property operators.',
      price: 1499
    },
    'Not sure': {
      slug: 'not-sure',
      description: 'Share the symptoms and CoolNest can review the request before confirming the most suitable service.',
      price: 0
    }
  };

  const ISSUE_RECOMMENDATIONS = {
    'AC not cooling': {
      service: 'AC Inspection',
      text: 'An inspection is the best starting point when an AC is running but the room stays warm. If the issue is urgent, the request can be marked for priority review.'
    },
    'Water leaking': {
      service: 'AC Inspection',
      text: 'Water can come from several causes, so a structured inspection is the safest first step before any repair is confirmed.'
    },
    'Strange smell': {
      service: 'AC Cleaning',
      text: 'Routine AC cleaning is a practical first step. If the smell appears across several rooms, duct cleaning may also be considered after assessment.'
    },
    'Unusual noise': {
      service: 'AC Inspection',
      text: 'Unusual noise should be checked before parts or repairs are recommended. Avoid continuing to run the unit if the sound becomes severe.'
    },
    'High electricity bill': {
      service: 'Coil Cleaning',
      text: 'Dirty coils may reduce efficiency, but an inspection may still be needed to confirm the cause. Coil cleaning is a useful starting recommendation for this prototype.'
    },
    'Routine cleaning': {
      service: 'AC Cleaning',
      text: 'Routine AC cleaning is suited to regular household maintenance, especially before peak cooling periods.'
    },
    'Not sure': {
      service: 'Not sure',
      text: 'Choose “Not sure” and describe what you have noticed. CoolNest can review the details before confirming the service.'
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initFaqs();
    initIssueRecommender();
    initBookingPage();
    initConfirmationPage();
    initAssistant();
    initDashboard();
    setCurrentYear();
  });

  function setCurrentYear() {
    document.querySelectorAll('[data-current-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  function initFaqs() {
    document.querySelectorAll('.faq-question').forEach(button => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const isOpen = item.classList.toggle('open');
        button.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  function initIssueRecommender() {
    const buttons = document.querySelectorAll('[data-issue]');
    const output = document.querySelector('#recommendationOutput');
    if (!buttons.length || !output) return;

    const serviceName = output.querySelector('[data-recommended-service]');
    const serviceText = output.querySelector('[data-recommendation-text]');
    const bookingLink = output.querySelector('[data-recommendation-link]');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const issue = button.dataset.issue;
        const recommendation = ISSUE_RECOMMENDATIONS[issue];
        serviceName.textContent = recommendation.service;
        serviceText.textContent = recommendation.text;
        bookingLink.href = `booking.html?service=${encodeURIComponent(recommendation.service)}&issue=${encodeURIComponent(issue)}`;
        bookingLink.classList.remove('hidden');
      });
    });
  }

  function getBookings() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Could not read stored bookings.', error);
      return [];
    }
  }

  function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }

  function generateReference() {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `CN-${datePart}-${randomPart}`;
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    const parsed = new Date(`${dateString}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateString;
    return parsed.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function slugify(value = '') {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function initBookingPage() {
    const form = document.querySelector('#bookingForm');
    if (!form) return;

    const steps = [...form.querySelectorAll('.form-step')];
    const progressItems = [...document.querySelectorAll('.progress-step')];
    const nextButtons = form.querySelectorAll('[data-next-step]');
    const backButtons = form.querySelectorAll('[data-prev-step]');
    const dateInput = form.querySelector('#appointmentDate');
    const submitButton = form.querySelector('[type="submit"]');
    let currentStep = 0;

    if (dateInput) {
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      dateInput.min = localToday;
    }

    applyBookingQueryParameters(form);
    updateBookingSidebar(form);

    form.addEventListener('input', () => updateBookingSidebar(form));
    form.addEventListener('change', () => updateBookingSidebar(form));

    nextButtons.forEach(button => button.addEventListener('click', () => {
      if (!validateStep(steps[currentStep])) return;
      currentStep = Math.min(currentStep + 1, steps.length - 1);
      if (currentStep === steps.length - 1) populateReview(form);
      renderStep();
    }));

    backButtons.forEach(button => button.addEventListener('click', () => {
      currentStep = Math.max(currentStep - 1, 0);
      renderStep();
    }));

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateStep(steps[currentStep])) return;

      submitButton.disabled = true;
      submitButton.textContent = 'Saving request…';

      const data = collectFormData(form);
      const booking = {
        id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        reference: generateReference(),
        createdAt: new Date().toISOString(),
        status: 'New',
        isDemo: false,
        timeline: [
          { label: 'Booking request created', date: new Date().toISOString() }
        ],
        ...data
      };

      const bookings = getBookings();
      bookings.unshift(booking);
      saveBookings(bookings);
      localStorage.setItem(LAST_BOOKING_KEY, booking.reference);
      window.location.href = `confirmation.html?ref=${encodeURIComponent(booking.reference)}`;
    });

    function renderStep() {
      steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
      progressItems.forEach((item, index) => {
        item.classList.toggle('active', index === currentStep);
        item.classList.toggle('done', index < currentStep);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function applyBookingQueryParameters(form) {
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    const issue = params.get('issue');
    const propertyType = params.get('property');
    const units = params.get('units');
    const area = params.get('area');
    const urgency = params.get('urgency');

    if (service) {
      const radio = [...form.querySelectorAll('input[name="service"]')].find(input => input.value.toLowerCase() === service.toLowerCase());
      if (radio) radio.checked = true;
    }
    if (issue) {
      const problem = form.querySelector('#problemDescription');
      if (problem && !problem.value) problem.value = `Customer selected: ${issue}.`;
    }
    if (propertyType) setSelectValue(form.querySelector('#propertyType'), propertyType);
    if (units) form.querySelector('#units').value = units;
    if (area) setSelectValue(form.querySelector('#area'), area);
    if (urgency) setSelectValue(form.querySelector('#urgency'), urgency);
  }

  function setSelectValue(select, desired) {
    if (!select || !desired) return;
    const option = [...select.options].find(item => item.value.toLowerCase() === desired.toLowerCase());
    if (option) select.value = option.value;
  }

  function validateStep(step) {
    let valid = true;
    const requiredFields = [...step.querySelectorAll('[required]')];
    const handledRadioNames = new Set();

    requiredFields.forEach(field => {
      if (field.type === 'radio') {
        if (handledRadioNames.has(field.name)) return;
        handledRadioNames.add(field.name);
        const group = [...step.querySelectorAll(`input[name="${field.name}"]`)];
        const checked = group.some(input => input.checked);
        const error = step.querySelector(`[data-error-for="${field.name}"]`);
        if (!checked) {
          valid = false;
          if (error) error.textContent = 'Please select an option.';
        } else if (error) {
          error.textContent = '';
        }
        return;
      }

      const error = step.querySelector(`[data-error-for="${field.id}"]`);
      let message = '';

      if (!String(field.value).trim()) message = 'This field is required.';
      else if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value)) message = 'Enter a valid email address.';
      else if (field.type === 'tel' && !/^[+\d][\d\s()-]{7,}$/.test(field.value)) message = 'Enter a valid phone number.';
      else if (field.type === 'number' && Number(field.value) < Number(field.min || 0)) message = `Enter ${field.min || 1} or more.`;
      else if (field.type === 'date' && field.min && field.value < field.min) message = 'Choose today or a future date.';

      field.classList.toggle('invalid', Boolean(message));
      if (error) error.textContent = message;
      if (message) valid = false;
    });

    if (!valid) {
      const firstInvalid = step.querySelector('.invalid, input[type="radio"]');
      firstInvalid?.focus();
    }
    return valid;
  }

  function collectFormData(form) {
    const data = new FormData(form);
    return {
      service: data.get('service'),
      propertyType: data.get('propertyType'),
      units: Number(data.get('units')),
      area: data.get('area'),
      community: data.get('community'),
      problemDescription: data.get('problemDescription'),
      urgency: data.get('urgency'),
      appointmentDate: data.get('appointmentDate'),
      timeSlot: data.get('timeSlot'),
      fullName: data.get('fullName'),
      phone: data.get('phone'),
      email: data.get('email'),
      contactMethod: data.get('contactMethod'),
      notes: data.get('notes') || ''
    };
  }

  function updateBookingSidebar(form) {
    const data = new FormData(form);
    const summaryMap = {
      service: data.get('service') || 'Not selected',
      property: data.get('propertyType') || 'Not added',
      units: data.get('units') || '—',
      area: data.get('area') || 'Not added',
      date: data.get('appointmentDate') ? formatDate(data.get('appointmentDate')) : 'Not selected',
      time: data.get('timeSlot') || 'Not selected'
    };

    Object.entries(summaryMap).forEach(([key, value]) => {
      document.querySelectorAll(`[data-booking-summary="${key}"]`).forEach(el => el.textContent = value);
    });
  }

  function populateReview(form) {
    const data = collectFormData(form);
    const review = document.querySelector('#bookingReview');
    if (!review) return;

    review.innerHTML = `
      <div class="summary-list">
        ${reviewRow('Service', data.service)}
        ${reviewRow('Property', `${data.propertyType} · ${data.units} unit${data.units === 1 ? '' : 's'}`)}
        ${reviewRow('Location', `${data.area}${data.community ? `, ${data.community}` : ''}`)}
        ${reviewRow('Urgency', data.urgency)}
        ${reviewRow('Appointment', `${formatDate(data.appointmentDate)} · ${data.timeSlot}`)}
        ${reviewRow('Customer', data.fullName)}
        ${reviewRow('Contact', `${data.phone} · ${data.email}`)}
        ${reviewRow('Preferred contact', data.contactMethod)}
      </div>
      <div class="review-box" style="margin-top:18px">
        <h4>Problem description</h4>
        <p>${escapeHtml(data.problemDescription)}</p>
        ${data.notes ? `<h4>Additional notes</h4><p>${escapeHtml(data.notes)}</p>` : ''}
      </div>`;
  }

  function reviewRow(label, value) {
    return `<div class="summary-row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || '—')}</dd></div>`;
  }

  function initConfirmationPage() {
    const container = document.querySelector('#confirmationDetails');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const reference = params.get('ref') || localStorage.getItem(LAST_BOOKING_KEY);
    const booking = getBookings().find(item => item.reference === reference);

    if (!booking) {
      container.innerHTML = `
        <div class="card-flat center">
          <h2>Booking details not found</h2>
          <p class="muted">This browser does not have the requested booking. You can create a new prototype booking below.</p>
          <a class="btn btn-primary" href="booking.html">Create a booking</a>
        </div>`;
      return;
    }

    document.querySelectorAll('[data-confirm-reference]').forEach(el => el.textContent = booking.reference);
    document.querySelectorAll('[data-confirm-name]').forEach(el => el.textContent = booking.fullName);
    document.querySelectorAll('[data-confirm-status]').forEach(el => el.textContent = booking.status);

    container.innerHTML = `
      <dl class="summary-list">
        ${reviewRow('Customer name', booking.fullName)}
        ${reviewRow('Selected service', booking.service)}
        ${reviewRow('Property', `${booking.propertyType} · ${booking.units} unit${booking.units === 1 ? '' : 's'}`)}
        ${reviewRow('Area', `${booking.area}${booking.community ? `, ${booking.community}` : ''}`)}
        ${reviewRow('Appointment', `${formatDate(booking.appointmentDate)} · ${booking.timeSlot}`)}
        ${reviewRow('Urgency', booking.urgency)}
        ${reviewRow('Preferred contact', booking.contactMethod)}
        ${reviewRow('Current status', booking.status)}
      </dl>`;
  }

  function initAssistant() {
    const launcher = document.querySelector('#chatLauncher');
    const windowEl = document.querySelector('#chatWindow');
    if (!launcher || !windowEl) return;

    const closeButton = windowEl.querySelector('[data-chat-close]');
    const minimizeButton = windowEl.querySelector('[data-chat-minimize]');
    const restartButton = windowEl.querySelector('[data-chat-restart]');
    const body = windowEl.querySelector('#chatBody');
    const form = windowEl.querySelector('#chatForm');
    const input = windowEl.querySelector('#chatInput');

    let state = createChatState();

    launcher.addEventListener('click', () => {
      windowEl.classList.add('open');
      windowEl.classList.remove('minimized');
      launcher.setAttribute('aria-expanded', 'true');
      if (!body.children.length) startConversation();
      input.focus();
    });

    closeButton.addEventListener('click', () => {
      windowEl.classList.remove('open');
      launcher.setAttribute('aria-expanded', 'false');
    });

    minimizeButton.addEventListener('click', () => {
      windowEl.classList.toggle('minimized');
    });

    restartButton.addEventListener('click', () => {
      body.innerHTML = '';
      state = createChatState();
      startConversation();
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      addChatMessage(value, 'user');
      input.value = '';
      handleChatInput(value);
    });

    body.addEventListener('click', event => {
      const button = event.target.closest('[data-chat-reply]');
      if (!button) return;
      const value = button.dataset.chatReply;
      addChatMessage(value, 'user');
      button.closest('.suggestions')?.remove();
      handleChatInput(value);
    });

    function createChatState() {
      return { step: 'issue', service: '', property: '', units: '', area: '', urgency: '' };
    }

    function startConversation() {
      addChatMessage('Hi, I’m Nora, the CoolNest Assistant. I can help organise your request and suggest a service, but I cannot confirm a technical diagnosis. What is happening with your AC?', 'assistant', [
        'Not cooling', 'Water leaking', 'Strange smell', 'Unusual noise', 'Routine cleaning'
      ]);
    }

    function addChatMessage(text, sender, suggestions = []) {
      const message = document.createElement('div');
      message.className = `chat-message ${sender}`;
      message.textContent = text;
      body.appendChild(message);

      if (suggestions.length) {
        const options = document.createElement('div');
        options.className = 'suggestions';
        suggestions.forEach(suggestion => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'suggestion';
          button.dataset.chatReply = suggestion;
          button.textContent = suggestion;
          options.appendChild(button);
        });
        body.appendChild(options);
      }
      body.scrollTop = body.scrollHeight;
    }

    function addTypingThen(callback) {
      const typing = document.createElement('div');
      typing.className = 'chat-message assistant typing';
      typing.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;
      setTimeout(() => {
        typing.remove();
        callback();
      }, 550);
    }

    function handleChatInput(rawValue) {
      const value = rawValue.toLowerCase();

      if (/spark|smoke|burning|electrical/.test(value)) {
        state.urgency = 'Emergency';
        state.service = 'Emergency Repair';
        state.step = 'property';
        addTypingThen(() => addChatMessage('For sparks, smoke, burning smells, or electrical concerns, turn off the unit if it is safe to do so and seek professional support. Do not continue running it. I have marked the request as an emergency. Is the property an apartment or villa?', 'assistant', ['Apartment', 'Villa', 'Restart']));
        return;
      }

      if (value === 'restart') {
        body.innerHTML = '';
        state = createChatState();
        startConversation();
        return;
      }

      if (state.step === 'issue') {
        state.service = recommendServiceFromText(value);
        state.step = 'property';
        addTypingThen(() => addChatMessage(`Based on what you shared, ${state.service} is a sensible starting point for this prototype. Is the property an apartment or a villa?`, 'assistant', ['Apartment', 'Villa']));
        return;
      }

      if (state.step === 'property') {
        state.property = /villa/.test(value) ? 'Villa' : /apartment|flat/.test(value) ? 'Apartment' : rawValue;
        state.step = 'units';
        addTypingThen(() => addChatMessage('How many AC units need attention?', 'assistant', ['1', '2', '3', '4 or more']));
        return;
      }

      if (state.step === 'units') {
        const number = value.match(/\d+/);
        state.units = number ? number[0] : value.includes('more') ? '4' : rawValue;
        state.step = 'area';
        addTypingThen(() => addChatMessage('Which Dubai area is the property in?', 'assistant', ['Al Barsha', 'Dubai Marina', 'JVC', 'Business Bay']));
        return;
      }

      if (state.step === 'area') {
        state.area = rawValue;
        state.step = 'urgency';
        addTypingThen(() => addChatMessage('How urgent is the issue?', 'assistant', ['Routine', 'Within a few days', 'As soon as possible', 'Emergency']));
        return;
      }

      if (state.step === 'urgency') {
        state.urgency = normaliseUrgency(rawValue);
        state.step = 'complete';
        const url = buildAssistantBookingUrl(state);
        addTypingThen(() => {
          addChatMessage('I have organised the details. Continue to the booking form to choose a date, add contact information, and review the request.', 'assistant');
          const options = document.createElement('div');
          options.className = 'suggestions';
          options.innerHTML = `<a class="suggestion" href="${url}">Continue to booking</a><button type="button" class="suggestion" data-chat-reply="Restart">Restart</button>`;
          body.appendChild(options);
          body.scrollTop = body.scrollHeight;
        });
        return;
      }

      addTypingThen(() => addChatMessage('Your request summary is ready. Use the booking link above, or restart the conversation.', 'assistant', ['Restart']));
    }
  }

  function recommendServiceFromText(value) {
    if (/emergency|not cooling|warm|hot/.test(value)) return /emergency/.test(value) ? 'Emergency Repair' : 'AC Inspection';
    if (/leak|water/.test(value)) return 'AC Inspection';
    if (/smell|odor|odour/.test(value)) return 'AC Cleaning';
    if (/noise|noisy|sound/.test(value)) return 'AC Inspection';
    if (/duct/.test(value)) return 'AC Duct Cleaning';
    if (/coil/.test(value)) return 'Coil Cleaning';
    if (/clean|maintenance|service/.test(value)) return 'AC Cleaning';
    return 'Not sure';
  }

  function normaliseUrgency(value) {
    const lower = value.toLowerCase();
    if (lower.includes('emergency')) return 'Emergency';
    if (lower.includes('soon') || lower.includes('possible')) return 'As soon as possible';
    if (lower.includes('few')) return 'Within a few days';
    return 'Routine';
  }

  function buildAssistantBookingUrl(state) {
    const params = new URLSearchParams({
      service: state.service,
      property: state.property,
      units: state.units,
      area: state.area,
      urgency: state.urgency
    });
    return `booking.html?${params.toString()}`;
  }

  function initDashboard() {
    const loginScreen = document.querySelector('#dashboardLogin');
    const dashboardContent = document.querySelector('#dashboardContent');
    if (!loginScreen || !dashboardContent) return;

    const loginForm = document.querySelector('#dashboardLoginForm');
    const loginError = document.querySelector('#dashboardLoginError');
    const logoutButton = document.querySelector('#dashboardLogout');
    const loadDemoButton = document.querySelector('#loadDemoBookings');
    const clearDemoButton = document.querySelector('#clearDemoBookings');
    const searchInput = document.querySelector('#bookingSearch');
    const statusFilter = document.querySelector('#statusFilter');
    const urgencyFilter = document.querySelector('#urgencyFilter');
    const sortSelect = document.querySelector('#sortBookings');
    const tableBody = document.querySelector('#bookingTableBody');
    const emptyState = document.querySelector('#dashboardEmpty');
    const drawer = document.querySelector('#bookingDrawer');

    let selectedBookingId = null;

    const showDashboard = () => {
      loginScreen.classList.add('hidden');
      dashboardContent.classList.remove('hidden');
      renderDashboard();
    };

    if (sessionStorage.getItem(DASHBOARD_SESSION_KEY) === 'true') showDashboard();

    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      if (email === 'owner@coolnest.demo' && password === 'demo123') {
        sessionStorage.setItem(DASHBOARD_SESSION_KEY, 'true');
        loginError.textContent = '';
        showDashboard();
      } else {
        loginError.textContent = 'Use the demo credentials shown above.';
      }
    });

    logoutButton.addEventListener('click', () => {
      sessionStorage.removeItem(DASHBOARD_SESSION_KEY);
      dashboardContent.classList.add('hidden');
      loginScreen.classList.remove('hidden');
      loginForm.reset();
    });

    loadDemoButton.addEventListener('click', () => {
      const current = getBookings();
      const demos = createDemoBookings();
      const existingRefs = new Set(current.map(item => item.reference));
      const uniqueDemos = demos.filter(item => !existingRefs.has(item.reference));
      saveBookings([...current, ...uniqueDemos]);
      renderDashboard();
    });

    clearDemoButton.addEventListener('click', () => {
      const remaining = getBookings().filter(item => !item.isDemo);
      saveBookings(remaining);
      renderDashboard();
    });

    [searchInput, statusFilter, urgencyFilter, sortSelect].forEach(control => {
      control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', renderBookingTable);
    });

    tableBody.addEventListener('click', event => {
      const viewButton = event.target.closest('[data-view-booking]');
      const deleteButton = event.target.closest('[data-delete-booking]');
      if (viewButton) openBookingDrawer(viewButton.dataset.viewBooking);
      if (deleteButton) deleteBooking(deleteButton.dataset.deleteBooking);
    });

    drawer.addEventListener('click', event => {
      if (event.target === drawer || event.target.closest('[data-close-drawer]')) closeDrawer();
    });

    document.querySelector('#drawerStatus')?.addEventListener('change', event => {
      if (!selectedBookingId) return;
      updateBookingStatus(selectedBookingId, event.target.value);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeDrawer();
    });

    function renderDashboard() {
      renderStats();
      renderBookingTable();
      renderAnalytics();
      renderReminders();
    }

    function filteredBookings() {
      let bookings = getBookings();
      const query = searchInput.value.trim().toLowerCase();
      const status = statusFilter.value;
      const urgency = urgencyFilter.value;
      const sort = sortSelect.value;

      if (query) {
        bookings = bookings.filter(item => [item.reference, item.fullName, item.service, item.area, item.phone, item.email]
          .some(value => String(value || '').toLowerCase().includes(query)));
      }
      if (status) bookings = bookings.filter(item => item.status === status);
      if (urgency) bookings = bookings.filter(item => item.urgency === urgency);

      return bookings.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sort === 'oldest' ? aTime - bTime : bTime - aTime;
      });
    }

    function renderStats() {
      const bookings = getBookings();
      const stats = {
        total: bookings.length,
        new: bookings.filter(item => item.status === 'New').length,
        confirmed: bookings.filter(item => item.status === 'Confirmed').length,
        completed: bookings.filter(item => item.status === 'Completed').length,
        emergencies: bookings.filter(item => item.urgency === 'Emergency').length,
        revenue: bookings.reduce((total, item) => total + estimateBookingValue(item), 0)
      };

      Object.entries(stats).forEach(([key, value]) => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (!element) return;
        element.textContent = key === 'revenue' ? `AED ${value.toLocaleString('en-AE')}` : value;
      });
    }

    function renderBookingTable() {
      const bookings = filteredBookings();
      tableBody.innerHTML = '';
      emptyState.classList.toggle('hidden', bookings.length > 0);

      bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${escapeHtml(booking.reference)}</strong>${booking.isDemo ? '<br><span class="demo-pill">Demo data</span>' : ''}</td>
          <td>${escapeHtml(booking.fullName)}<br><span class="tiny muted">${escapeHtml(booking.phone)}</span></td>
          <td>${escapeHtml(booking.service)}</td>
          <td>${escapeHtml(booking.area)}</td>
          <td>${escapeHtml(formatDate(booking.appointmentDate))}<br><span class="tiny muted">${escapeHtml(booking.timeSlot)}</span></td>
          <td><span class="urgency-pill urgency-${slugify(booking.urgency)}">${escapeHtml(booking.urgency)}</span></td>
          <td><span class="status-pill status-${slugify(booking.status)}">${escapeHtml(booking.status)}</span></td>
          <td><div class="actions-cell">
            <button class="btn btn-secondary btn-sm" type="button" data-view-booking="${booking.id}">View</button>
            <button class="btn btn-danger btn-sm" type="button" data-delete-booking="${booking.id}" aria-label="Delete ${escapeHtml(booking.reference)}">Delete</button>
          </div></td>`;
        tableBody.appendChild(row);
      });
    }

    function openBookingDrawer(id) {
      const booking = getBookings().find(item => item.id === id);
      if (!booking) return;
      selectedBookingId = id;
      document.querySelector('#drawerReference').textContent = booking.reference;
      document.querySelector('#drawerStatus').value = booking.status;
      document.querySelector('#drawerContent').innerHTML = `
        ${booking.isDemo ? '<p><span class="demo-pill">Demo booking</span></p>' : ''}
        <div class="grid-2">
          <div class="detail-box"><h4>Customer</h4><p><strong>${escapeHtml(booking.fullName)}</strong><br>${escapeHtml(booking.phone)}<br>${escapeHtml(booking.email)}<br>Contact by ${escapeHtml(booking.contactMethod)}</p></div>
          <div class="detail-box"><h4>Appointment</h4><p><strong>${escapeHtml(formatDate(booking.appointmentDate))}</strong><br>${escapeHtml(booking.timeSlot)}<br>${escapeHtml(booking.urgency)}</p></div>
          <div class="detail-box"><h4>Property</h4><p><strong>${escapeHtml(booking.propertyType)}</strong><br>${escapeHtml(String(booking.units))} AC unit(s)<br>${escapeHtml(booking.area)}${booking.community ? `<br>${escapeHtml(booking.community)}` : ''}</p></div>
          <div class="detail-box"><h4>Service</h4><p><strong>${escapeHtml(booking.service)}</strong><br>Estimated demo value: AED ${estimateBookingValue(booking).toLocaleString('en-AE')}</p></div>
        </div>
        <div class="detail-box" style="margin-top:16px"><h4>Problem description</h4><p>${escapeHtml(booking.problemDescription || 'No description')}</p></div>
        <div class="detail-box" style="margin-top:16px"><h4>Customer notes</h4><p>${escapeHtml(booking.notes || 'No additional notes')}</p></div>
        <h3 style="margin-top:24px">Booking timeline</h3>
        <ul class="timeline-list">${(booking.timeline || []).map(item => `<li><strong>${escapeHtml(item.label)}</strong><br><span class="tiny">${new Date(item.date).toLocaleString('en-AE')}</span></li>`).join('')}</ul>`;
      drawer.classList.add('open');
      document.body.classList.add('no-scroll');
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      document.body.classList.remove('no-scroll');
      selectedBookingId = null;
    }

    function updateBookingStatus(id, status) {
      const bookings = getBookings();
      const booking = bookings.find(item => item.id === id);
      if (!booking) return;
      booking.status = status;
      booking.timeline = booking.timeline || [];
      booking.timeline.push({ label: `Status changed to ${status}`, date: new Date().toISOString() });
      saveBookings(bookings);
      renderDashboard();
      openBookingDrawer(id);
    }

    function deleteBooking(id) {
      const booking = getBookings().find(item => item.id === id);
      if (!booking) return;
      if (!window.confirm(`Delete booking ${booking.reference}? This cannot be undone.`)) return;
      saveBookings(getBookings().filter(item => item.id !== id));
      renderDashboard();
      closeDrawer();
    }

    function renderAnalytics() {
      const bookings = getBookings();
      renderBarChart('#serviceChart', countBy(bookings, 'service'));
      renderBarChart('#statusChart', countBy(bookings, 'status'));
      renderBarChart('#areaChart', countBy(bookings, 'area'));
      renderBarChart('#urgencyChart', {
        Emergency: bookings.filter(item => item.urgency === 'Emergency').length,
        'Non-emergency': bookings.filter(item => item.urgency !== 'Emergency').length
      });
    }

    function renderBarChart(selector, data) {
      const element = document.querySelector(selector);
      if (!element) return;
      const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6);
      const max = Math.max(1, ...entries.map(entry => entry[1]));
      element.innerHTML = entries.length ? entries.map(([label, value]) => `
        <div class="chart-row">
          <span title="${escapeHtml(label)}">${escapeHtml(label)}</span>
          <div class="chart-bar-track"><div class="chart-bar" style="width:${(value / max) * 100}%"></div></div>
          <strong>${value}</strong>
        </div>`).join('') : '<p class="muted small">No booking data yet.</p>';
    }

    function renderReminders() {
      const container = document.querySelector('#maintenanceReminders');
      if (!container) return;
      const completed = getBookings().filter(item => item.status === 'Completed').slice(0, 6);
      if (!completed.length) {
        container.innerHTML = '<p class="muted">Completed bookings will appear here as simulated future maintenance reminders.</p>';
        return;
      }
      container.innerHTML = completed.map(booking => {
        const due = new Date(booking.appointmentDate || booking.createdAt);
        due.setMonth(due.getMonth() + 6);
        return `<div class="reminder-card"><span class="demo-pill">Simulated reminder</span><h4 style="margin-top:12px">${escapeHtml(booking.fullName)}</h4><p class="small">${escapeHtml(booking.service)} · ${escapeHtml(booking.area)}</p><p class="tiny muted">Suggested follow-up: ${due.toLocaleDateString('en-AE', { month:'short', year:'numeric' })}</p></div>`;
      }).join('');
    }
  }

  function estimateBookingValue(booking) {
    const base = SERVICES[booking.service]?.price || 149;
    const units = Math.max(1, Number(booking.units) || 1);
    const multiplier = booking.service.includes('Plan') ? 1 : 1 + ((units - 1) * 0.55);
    return Math.round(base * multiplier);
  }

  function countBy(items, key) {
    return items.reduce((result, item) => {
      const value = item[key] || 'Unknown';
      result[value] = (result[value] || 0) + 1;
      return result;
    }, {});
  }

  function createDemoBookings() {
    const now = new Date();
    const dateFromNow = days => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date.toISOString().slice(0, 10);
    };
    const createdFromNow = days => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date.toISOString();
    };

    const raw = [
      ['CN-DEMO-1001','Maya Rahman','AC Inspection','Apartment',2,'Dubai Marina','Marina Heights','The living-room AC is running but the room remains warm.','As soon as possible',dateFromNow(1),'9:00 AM – 11:00 AM','+971 50 555 0101','maya@example.demo','WhatsApp','Please call security on arrival.','New',-1],
      ['CN-DEMO-1002','Omar Nasser','AC Cleaning','Villa',5,'Arabian Ranches','Saheel','Routine cleaning for the ground-floor and bedroom units.','Routine',dateFromNow(4),'1:00 PM – 3:00 PM','+971 55 555 0102','omar@example.demo','Phone','Parking is available in front of the villa.','Confirmed',-3],
      ['CN-DEMO-1003','Leila Haddad','Emergency Repair','Apartment',1,'Business Bay','Executive Towers','Active water leaking near the indoor unit.','Emergency',dateFromNow(0),'5:00 PM – 7:00 PM','+971 52 555 0103','leila@example.demo','WhatsApp','The unit has been switched off.','Technician Assigned',-1],
      ['CN-DEMO-1004','Daniel Brooks','Coil Cleaning','Apartment',3,'Downtown Dubai','Boulevard Point','Cooling has become slower and the electricity bill increased.','Within a few days',dateFromNow(2),'11:00 AM – 1:00 PM','+971 56 555 0104','daniel@example.demo','Email','Concierge access required.','Contacted',-4],
      ['CN-DEMO-1005','Aisha Karim','AC Duct Cleaning','Villa',7,'Jumeirah','Jumeirah 2','Persistent dust and an odour across several rooms.','Routine',dateFromNow(7),'9:00 AM – 11:00 AM','+971 54 555 0105','aisha@example.demo','Phone','Family has allergies; please explain the process first.','Confirmed',-5],
      ['CN-DEMO-1006','Noah Wilson','Annual Care Plan','Apartment',2,'JVC','Belgravia','Interested in planned maintenance for two units.','Routine',dateFromNow(-20),'3:00 PM – 5:00 PM','+971 58 555 0106','noah@example.demo','Email','','Completed',-28]
    ];

    return raw.map((item, index) => ({
      id: `demo-${index + 1}`,
      reference: item[0], fullName:item[1], service:item[2], propertyType:item[3], units:item[4], area:item[5], community:item[6],
      problemDescription:item[7], urgency:item[8], appointmentDate:item[9], timeSlot:item[10], phone:item[11], email:item[12], contactMethod:item[13], notes:item[14], status:item[15],
      createdAt: createdFromNow(item[16]), isDemo: true,
      timeline: [
        { label: 'Demo booking created', date: createdFromNow(item[16]) },
        ...(item[15] !== 'New' ? [{ label: `Status changed to ${item[15]}`, date: createdFromNow(item[16] + 1) }] : [])
      ]
    }));
  }
})();
