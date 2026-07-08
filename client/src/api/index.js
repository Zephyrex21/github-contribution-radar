import api from './axiosInstance';

export const issuesApi = {
  search:        params           => api.get('/api/issues/search', { params }).then(r => r.data),
  getForYou:     params           => api.get('/api/issues/foryou', { params }).then(r => r.data),
  getTrending:   params           => api.get('/api/issues/trending', { params }).then(r => r.data),
  getRepoIssues: (owner, repo, p) => api.get(`/api/issues/repo/${owner}/${repo}`, { params: p }).then(r => r.data),
  getDetail:     (owner, repo, n) => api.get(`/api/issues/${owner}/${repo}/${n}`).then(r => r.data),
  summarize:     payload          => api.post('/api/issues/summarize', payload).then(r => r.data),
};

export const reposApi = {
  search: params => api.get('/api/repos/search', { params }).then(r => r.data),
};

export const savedItemsApi = {
  getAll:   params     => api.get('/api/saved-items', { params }).then(r => r.data),
  save:     body       => api.post('/api/saved-items', body).then(r => r.data),
  update:   (id, body) => api.patch(`/api/saved-items/${id}`, body).then(r => r.data),
  remove:   id         => api.delete(`/api/saved-items/${id}`).then(r => r.data),
  verifyPR: id         => api.post(`/api/saved-items/${id}/verify-pr`).then(r => r.data),
};

export const dashboardApi = {
  getSummary:  () => api.get('/api/dashboard/summary').then(r => r.data),
  getHeatmap:  () => api.get('/api/dashboard/heatmap').then(r => r.data),
  getActivity: () => api.get('/api/dashboard/activity').then(r => r.data),
};

export const profileApi = {
  get:               () => api.get('/api/profile').then(r => r.data),
  updatePreferences: body => api.patch('/api/profile/preferences', body).then(r => r.data),
};
