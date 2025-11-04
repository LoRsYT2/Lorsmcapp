// app.js - simple form submit handler used by developer.html, staff.html, media.html
// Adds handleFormSubmit(formId, type) - collects form inputs and POSTs to /api/submit
(function () {
  function getFormData(form) {
    const data = {};
    Array.from(form.elements).forEach(el => {
      if (!el.name) return;
      if (el.type === 'checkbox') {
        data[el.name] = el.checked;
      } else if (el.type === 'radio') {
        if (el.checked) data[el.name] = el.value;
      } else if (el.tagName.toLowerCase() === 'select' && el.multiple) {
        data[el.name] = Array.from(el.selectedOptions).map(o => o.value);
      } else {
        data[el.name] = el.value;
      }
    });
    return data;
  }

  window.handleFormSubmit = function (formId, category) {
    const form = document.getElementById(formId);
    if (!form) return console.warn('Form not found:', formId);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"], textarea[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      const payload = getFormData(form);
      // include a tiny metadata field so server can know which form sent it
      payload._category = category || formId;

      try {
        const resp = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await resp.json();
        if (resp.ok && json && json.ok) {
          // simple user feedback without changing CSS/markup
          alert('Application submitted successfully. Thank you!');
          form.reset();
        } else {
          console.error('Submission failed', json);
          alert('Could not submit application. Please try again later.');
        }
      } catch (err) {
        console.error('Error sending application', err);
        alert('Network error while submitting. Check console for details.');
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  };
})();