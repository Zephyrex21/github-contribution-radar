import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

function getHeaders(userToken) {
  const token = userToken || process.env.GITHUB_API_TOKEN;
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `token ${token}`;
  return headers;
}

function handleGitHubError(error) {
  if (
    error.response?.status === 403 &&
    error.response?.headers['x-ratelimit-remaining'] === '0'
  ) {
    const err = new Error('GitHub API rate limit exceeded. Try again in a few minutes.');
    err.status = 429;
    throw err;
  }
  if (error.response?.status === 404) {
    const err = new Error('Resource not found on GitHub.');
    err.status = 404;
    throw err;
  }
  throw error;
}

function normalizeIssue(item) {
  const repoFullName = item.repository_url
    ? item.repository_url.replace('https://api.github.com/repos/', '')
    : item.repository?.full_name || '';

  return {
    githubIssueId: item.id,
    title: item.title,
    bodyPreview: item.body ? item.body.substring(0, 300) : '',
    labels: item.labels?.map((l) => l.name) || [],
    state: item.state,
    updatedAt: item.updated_at,
    url: item.html_url,
    repoFullName,
    number: item.number,
  };
}

function normalizeRepo(item) {
  return {
    githubRepoId: item.id,
    name: item.name,
    fullName: item.full_name,
    description: item.description || '',
    language: item.language,
    stars: item.stargazers_count,
    forks: item.forks_count,
    openIssuesCount: item.open_issues_count,
    updatedAt: item.updated_at,
    url: item.html_url,
  };
}

export async function searchIssues({
  q,
  language,
  label,
  sort = 'updated',
  page = 1,
  perPage = 20,
  userToken,
}) {
  try {
    let query = `${q} is:open is:issue`;
    if (language) query += ` language:${language}`;
    if (label) query += ` label:"${label}"`;

    const { data } = await axios.get(`${GITHUB_API}/search/issues`, {
      headers: getHeaders(userToken),
      params: { q: query, sort, per_page: perPage, page },
    });

    return { items: data.items.map(normalizeIssue), totalCount: data.total_count };
  } catch (err) {
    handleGitHubError(err);
  }
}

export async function searchRepos({ q, language, page = 1, perPage = 20, userToken }) {
  try {
    let query = q;
    if (language) query += ` language:${language}`;

    const { data } = await axios.get(`${GITHUB_API}/search/repositories`, {
      headers: getHeaders(userToken),
      params: { q: query, sort: 'stars', per_page: perPage, page },
    });

    return { items: data.items.map(normalizeRepo), totalCount: data.total_count };
  } catch (err) {
    handleGitHubError(err);
  }
}

export async function getIssueDetail({ owner, repo, issueNumber, userToken }) {
  try {
    const [issueRes, repoRes] = await Promise.all([
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`, {
        headers: getHeaders(userToken),
      }),
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
        headers: getHeaders(userToken),
      }),
    ]);
    return {
      issue: normalizeIssue(issueRes.data),
      repo: normalizeRepo(repoRes.data),
    };
  } catch (err) {
    handleGitHubError(err);
  }
}
