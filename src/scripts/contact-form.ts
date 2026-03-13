const form = document.getElementById('contact-form') as HTMLFormElement;
const statusEl = document.getElementById('form-status') as HTMLDivElement;
const timestampEl = document.getElementById('form-timestamp') as HTMLInputElement;

if (timestampEl)
  timestampEl.value = String(Date.now());

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const btnText = submitBtn.querySelector('.btn-text') as HTMLSpanElement;
    const originalHtml = btnText.innerHTML;
    submitBtn.disabled = true;
    btnText.textContent = form.dataset.sending || 'Sending...';
    statusEl.style.display = 'none';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        statusEl.className = 'form-status form-status-success';
        const titleEl = document.createElement('strong');
        titleEl.textContent = form.dataset.successTitle || 'Success';
        const msgEl = document.createElement('p');
        msgEl.textContent = form.dataset.successMsg || '';
        statusEl.replaceChildren(titleEl, msgEl);
        statusEl.style.display = 'block';
        form.reset();
        if (timestampEl)
          timestampEl.value = String(Date.now());
      }
      else {
        throw new Error('Request failed');
      }
    }
    catch {
      statusEl.className = 'form-status form-status-error';
      const titleEl = document.createElement('strong');
      titleEl.textContent = form.dataset.errorTitle || 'Error';
      const msgEl = document.createElement('p');
      msgEl.textContent = form.dataset.errorMsg || '';
      statusEl.replaceChildren(titleEl, msgEl);
      statusEl.style.display = 'block';
    }
    finally {
      submitBtn.disabled = false;
      btnText.innerHTML = originalHtml;
    }
  });
}
