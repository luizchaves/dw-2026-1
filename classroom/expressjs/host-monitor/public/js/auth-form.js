(function () {
  function initAuthForm({
    endpoint,
    feedbackId,
    formId,
    submitButtonId,
    fallbackMessage,
  }) {
    const form = document.getElementById(formId);
    const feedback = document.getElementById(feedbackId);
    const submitButton = document.getElementById(submitButtonId);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      feedback.textContent = '';
      submitButton.disabled = true;
      submitButton.classList.add('opacity-60', 'cursor-not-allowed');

      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? fallbackMessage);
        }

        HostMonitorSession.setSession(result);
        window.location.href = '/dashboard.html';
      } catch (error) {
        feedback.textContent = error.message;
      } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-60', 'cursor-not-allowed');
      }
    });
  }

  window.HostMonitorAuthForm = {
    initAuthForm,
  };
})();
