const BASE_URL = 'https://your-energy.b.goit.study/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) data = await res.json();
  else data = await res.text();

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export const api = {
  getQuote() {
    return request('/quote');
  },

  getFilters({ filter, page = 1, limit = 12 }) {
    const params = new URLSearchParams({ filter, page, limit });
    return request(`/filters?${params.toString()}`);
  },

  getExercises({ bodypart, muscles, equipment, keyword, page = 1, limit = 12 } = {}) {
    const params = new URLSearchParams();
    if (bodypart) params.set('bodypart', bodypart);
    if (muscles) params.set('muscles', muscles);
    if (equipment) params.set('equipment', equipment);
    if (keyword) params.set('keyword', keyword);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return request(`/exercises?${params.toString()}`);
  },

  getExerciseById(id) {
    return request(`/exercises/${id}`);
  },
  rateExercise(id, { rate, email, comment } = {}) {
    return request(`/exercises/${id}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({
        rate,            // ✅ обов’язково
        email,           // ✅ обов’язково
        comment,         // (може бути опціонально; якщо 400 буде про comment — скажу як назвати)
      }),
    });
  },



  // ✅ один правильний метод для рейтингу
  patchRating(id, rating) {
    return request(`/exercises/${id}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({ rating: Math.round(Number(rating)) }),
    });
  },


  postSubscription(email) {
    return request(`/subscription`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

};

