/* ==========================================================================
   SCALENSION — Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Theme Toggle Logic ───────────────────── */
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const target = current === 'dark' ? 'light' : 'dark';
      setTheme(target);
    });
  });

  /* ─── Navbar scroll ──────────────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ─── Mobile menu ───────────────────────── */
  const menuToggle   = document.querySelector('.menu-toggle');
  const mobileNav    = document.querySelector('.mobile-nav');
  const mobileOverlay= document.querySelector('.mobile-overlay');
  const mobileClose  = document.querySelector('.mobile-nav-close');

  const openMenu  = () => { mobileNav?.classList.add('open');    mobileOverlay?.classList.add('open'); };
  const closeMenu = () => { mobileNav?.classList.remove('open'); mobileOverlay?.classList.remove('open'); };

  menuToggle?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay?.addEventListener('click', closeMenu);

  /* ─── Active nav link ────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ─── Scroll reveal ──────────────────────── */
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  // Stagger children inside .stagger-group
  document.querySelectorAll('.stagger-group').forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${i * 0.09}s`;
    });
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ─── Course category filter (courses.html) ─ */
  const filterSelect   = document.getElementById('course-filter-select');
  const clearFilterBtn = document.getElementById('clear-filter-btn');
  const resultsCount   = document.getElementById('filter-results-count');
  const courseGroups   = document.querySelectorAll('.course-group');

  if (filterSelect && courseGroups.length) {
    const updateFilter = (filterVal) => {
      filterSelect.value = filterVal;

      let visibleCount = 0;
      courseGroups.forEach(group => {
        const matches = filterVal === 'all' || group.dataset.category === filterVal;
        group.style.display = matches ? 'block' : 'none';
        if (matches) visibleCount++;
      });

      if (filterVal !== 'all') {
        const selectedOption = filterSelect.options[filterSelect.selectedIndex];
        const labelText = selectedOption ? selectedOption.textContent.replace(/^[^\w]+/, '').trim() : filterVal;
        if (clearFilterBtn) clearFilterBtn.style.display = 'inline-flex';
        if (resultsCount) resultsCount.textContent = `Showing: ${labelText}`;
      } else {
        if (clearFilterBtn) clearFilterBtn.style.display = 'none';
        if (resultsCount) resultsCount.textContent = 'Showing all categories';
      }
    };

    filterSelect.addEventListener('change', e => {
      updateFilter(e.target.value);
    });

    clearFilterBtn?.addEventListener('click', () => {
      updateFilter('all');
    });

    // Support data-filter buttons if clicked from external links/cards
    document.querySelectorAll('[data-filter]').forEach(btn => {
      if (btn.id !== 'course-filter-select') {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.filter;
          if (filter) updateFilter(filter);
        });
      }
    });
  }

  /* ─── Roadmap accordion ─────────────────── */
  document.querySelectorAll('.course-card').forEach(card => {
    const btn       = card.querySelector('.roadmap-toggle-btn');
    const toggleTxt = card.querySelector('.toggle-text');
    const toggleIco = card.querySelector('.toggle-icon');

    btn?.addEventListener('click', e => {
      e.stopPropagation();
      const opening = !card.classList.contains('open');

      // Close all
      document.querySelectorAll('.course-card.open').forEach(c => {
        c.classList.remove('open');
        const t = c.querySelector('.toggle-text');
        const i = c.querySelector('.toggle-icon');
        if (t) t.textContent = 'View Roadmap';
        if (i) i.textContent = '↓';
      });

      if (opening) {
        card.classList.add('open');
        if (toggleTxt) toggleTxt.textContent = 'Hide Roadmap';
        if (toggleIco) toggleIco.textContent = '↑';

        // Smooth scroll card into view
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 80);
      }
    });
  });

  /* ─── Enquiry form ───────────────────────── */
  const form        = document.getElementById('enquiry-form');
  const formWrapper = document.querySelector('.form-wrapper');
  const formSuccess = document.querySelector('.form-success');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const submitBtn = form.querySelector('.form-submit');
      const actionUrl = form.action;

      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      const showSuccess = () => {
        if (formWrapper) formWrapper.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('show');
      };

      if (!actionUrl || actionUrl === window.location.href) {
        setTimeout(showSuccess, 1000);
        return;
      }

      const formData = new FormData(form);

      fetch(actionUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })
      .then(() => {
        showSuccess();
      })
      .catch(err => {
        console.error('Submission error:', err);
        showSuccess();
      });
    });
  }

  /* ─── Career page: Copy email button ──────── */
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'contact@scalension.com';
      navigator.clipboard.writeText(email).then(() => {
        const originalHTML = copyEmailBtn.innerHTML;
        copyEmailBtn.innerHTML = '<i class="fa-solid fa-check" style="color:var(--clr-green);"></i> Copied!';
        setTimeout(() => {
          copyEmailBtn.innerHTML = originalHTML;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });
  }

  /* ─── Free Guidance Session Feature ──────── */
  const sessionForm = document.getElementById('free-session-form');
  const embeddedGuidanceForm = document.getElementById('embedded-guidance-form');
  const sourceUrlField = document.getElementById('field-source-url');

  if (sourceUrlField) {
    sourceUrlField.value = window.location.href;
  }

  // Interactive Agenda Tags selector
  const agendaTagBtns = document.querySelectorAll('.agenda-tag-btn');
  const agendaTagsHidden = document.getElementById('field-agenda-tags');
  const agendaTextarea = document.getElementById('session-agenda');
  const waDirectBtn = document.getElementById('wa-direct-btn');

  if (agendaTagBtns.length) {
    agendaTagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');

        // Gather all selected tags
        const selected = Array.from(document.querySelectorAll('.agenda-tag-btn.active'))
          .map(b => b.dataset.agenda || b.textContent.trim());

        if (agendaTagsHidden) {
          agendaTagsHidden.value = selected.join(', ');
        }

        // If textarea exists and is either empty or contains previous tag prefix, update it gracefully
        if (agendaTextarea && selected.length) {
          const currentVal = agendaTextarea.value.trim();
          const tagNotice = `[Agenda Topics: ${selected.join(', ')}]\n`;
          
          if (!currentVal || currentVal.startsWith('[Agenda Topics:')) {
            const userExtra = currentVal.replace(/^\[Agenda Topics:.*?\]\n?/, '').trim();
            agendaTextarea.value = userExtra ? `${tagNotice}\n${userExtra}` : tagNotice;
          }
        }

        // Update WhatsApp quick chat message dynamically
        if (waDirectBtn) {
          const baseWa = 'https://wa.me/919892501878?text=';
          const courseVal = document.getElementById('session-course')?.value || 'General Guidance';
          const agendaSummary = selected.length ? selected.join(', ') : 'Free Guidance Session';
          const encoded = encodeURIComponent(`Hi Scalension, I'd like to book a free 1-on-1 session.\nDomain: ${courseVal}\nAgenda: ${agendaSummary}`);
          waDirectBtn.href = baseWa + encoded;
        }
      });
    });
  }

  // Support pre-populating domain/course and agenda from URL query parameters (e.g., ?course=ai-ml)
  const urlParams = new URLSearchParams(window.location.search);
  const paramCourse = urlParams.get('course');
  const paramAgenda = urlParams.get('agenda');

  if (paramCourse) {
    const courseSelect = document.getElementById('session-course');
    if (courseSelect) {
      const courseMap = {
        'ai-ml': 'AI & Machine Learning',
        'prompt': 'Prompt Engineering & GenAI',
        'python': 'Python for Data Science',
        'web-dev': 'Full Stack Web Dev',
        'cloud': 'Cloud Computing (AWS)',
        'devops': 'DevOps & CI/CD'
      };

      const targetValue = courseMap[paramCourse.toLowerCase()] || paramCourse;
      for (let i = 0; i < courseSelect.options.length; i++) {
        if (courseSelect.options[i].value.toLowerCase().includes(targetValue.toLowerCase()) ||
            courseSelect.options[i].text.toLowerCase().includes(targetValue.toLowerCase())) {
          courseSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  if (paramAgenda && agendaTextarea) {
    agendaTextarea.value = decodeURIComponent(paramAgenda);
  }

  // Generic guidance form submission handler
  const bindGuidanceForm = (f) => {
    if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const submitBtn = f.querySelector('.form-submit');
      const actionUrl = f.action;
      const card = f.closest('.form-card') || f.parentElement;
      const wrapper = card.querySelector('.form-wrapper');
      const success = card.querySelector('.form-success');

      if (submitBtn) {
        submitBtn.textContent = 'Requesting Slot…';
        submitBtn.disabled = true;
      }

      const showSuccessState = () => {
        if (wrapper) wrapper.style.display = 'none';
        if (success) success.classList.add('show');
      };

      if (!actionUrl || actionUrl === window.location.href) {
        setTimeout(showSuccessState, 1000);
        return;
      }

      const formData = new FormData(f);

      fetch(actionUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })
      .then(() => {
        showSuccessState();
      })
      .catch(err => {
        console.error('Session submission error:', err);
        showSuccessState();
      });
    });
  };

  bindGuidanceForm(sessionForm);
  bindGuidanceForm(embeddedGuidanceForm);

  /* ─── FAQ Accordion ──────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach(item => {
      const qBtn = item.querySelector('.faq-question');
      qBtn?.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        // Close others
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    });
  }

});




