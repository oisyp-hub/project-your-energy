import { api } from '../api/yourEnergyApi.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.footer__form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const emailInput =
      form.querySelector('input[type="email"]') ||
      form.querySelector('input[name="email"]');

    const email = emailInput?.value?.trim();
    if (!email) return;

    try {
      // якщо у тебе в api є метод subscription/subscribe — використай його
      if (typeof api?.subscription === 'function') {
        await api.subscription({ email });
      } else if (typeof api?.subscribe === 'function') {
        await api.subscribe({ email });
      } else {
        // fallback напряму
        const res = await fetch('https://your-energy.b.goit.study/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error(`Subscription failed: ${res.status}`);
      }

      form.reset();
      // тут можеш показати “success” як у макеті
    } catch (err) {
      console.error('❌ Subscription error:', err);
    }
  });
});
