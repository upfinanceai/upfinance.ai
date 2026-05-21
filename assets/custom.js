document.addEventListener('DOMContentLoaded', function () {
  var modal = document.querySelector('[data-partner-form-modal]');
  if (!modal) return;

  var form = modal.querySelector('[data-partner-form]');
  var closeBtn = modal.querySelector('[data-partner-form-close]');
  var cancelBtn = modal.querySelector('[data-partner-form-cancel]');

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-partner-open]');
    if (!trigger) return;
    event.preventDefault();
    openModal();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (window.i18next && typeof window.i18next.t === 'function') {
        alert(window.i18next.t('partner_form.submit_success'));
      } else {
        alert('Submitted successfully. We will contact you soon.');
      }

      form.reset();
      closeModal();
    });
  }
});
