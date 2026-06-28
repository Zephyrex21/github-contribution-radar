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

/** Generic issue search — used by the /search endpoint */
export async function searchIssues({
  q,
  language,
  label,
  sort = 'updated',
  page = 1,
  perPage = 50,   // ← increased from 20
  userToken,
}) {
  try {
    let query = `${q} is:open is:issue`;
    if (language) query += ` language:${language}`;
    if (label)    query += ` label:"${label}"`;

    const { data } = await axios.get(`${GITHUB_API}/search/issues`, {
      headers: getHeaders(userToken),
      params: { q: query, sort, order: 'desc', per_page: perPage, page },
    });

    return { items: data.items.map(normalizeIssue), totalCount: data.total_count };
  } catch (err) {
    handleGitHubError(err);
  }
}

/**
 * For You search — runs ONE search per language in parallel, deduplicates, returns merged results.
 * This is the fix for the "only 20 results" problem.
 */
export async function searchForYou({ languages = [], perPage = 50, page = 1, userToken }) {
  try {
    // If no preferences, fall back to broad beginner search
    const langs = languages.length > 0 ? languages : [''];

    // Run one search per language in parallel (max 5 to stay within rate limits)
    const langSlice = langs.slice(0, 5);

    const searches = langSlice.map(lang => {
      const q = lang
        ? `is:open is:issue label:"good first issue" language:${lang}`
        : `is:open is:issue label:"good first issue"`;

      return axios.get(`${GITHUB_API}/search/issues`, {
        headers: getHeaders(userToken),
        params: { q, sort: 'updated', order: 'desc', per_page: perPage, page },
      }).then(r => r.data.items.map(normalizeIssue))
        .catch(() => []); // individual language failures don't crash whole response
    });

    const results = await Promise.all(searches);

    // Merge + deduplicate by githubIssueId
    const seen = new Set();
    const merged = [];
    for (const batch of results) {
      for (const issue of batch) {
        if (!seen.has(issue.githubIssueId)) {
          seen.add(issue.githubIssueId);
          merged.push(issue);
        }
      }
    }

    return { items: merged, totalCount: merged.length };
  } catch (err) {
    handleGitHubError(err);
  }
}

/**
 * Trending search — active repos with beginner issues, starred > 200
 */
export async function searchTrending({ page = 1, perPage = 50, userToken }) {
  try {
    // Two parallel queries: good first issues + help wanted, both from active repos
    const [gfi, hw] = await Promise.all([
      axios.get(`${GITHUB_API}/search/issues`, {
        headers: getHeaders(userToken),
        params: {
          q: `is:open is:issue label:"good first issue" stars:>200`,
          sort: 'updated', order: 'desc', per_page: perPage, page,
        },
      }).then(r => r.data.items.map(normalizeIssue)).catch(() => []),

      axios.get(`${GITHUB_API}/search/issues`, {
        headers: getHeaders(userToken),
        params: {
          q: `is:open is:issue label:"help wanted" stars:>500`,
          sort: 'updated', order: 'desc', per_page: Math.floor(perPage / 2), page,
        },
      }).then(r => r.data.items.map(normalizeIssue)).catch(() => []),
    ]);

    // Merge + deduplicate
    const seen = new Set();
    const merged = [];
    for (const issue of [...gfi, ...hw]) {
      if (!seen.has(issue.githubIssueId)) {
        seen.add(issue.githubIssueId);
        merged.push(issue);
      }
    }

    return { items: merged, totalCount: merged.length };
  } catch (err) {
    handleGitHubError(err);
  }
}

/** Fetch all issues from a specific repo */
export async function getRepoIssues({ owner, repo, page = 1, perPage = 50, userToken }) {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/issues`, {
      headers: getHeaders(userToken),
      params: {
        state: 'open',
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
      },
    });

    // Filter out pull requests (GitHub issues endpoint includes PRs)
    const issues = data
      .filter(i => !i.pull_request)
      .map(normalizeIssue);

    return { items: issues };
  } catch (err) {
    handleGitHubError(err);
  }
}

export async function searchRepos({ q, language, page = 1, perPage = 30, userToken }) {
  try {
    let query = q;
    if (language) query += ` language:${language}`;

    const { data } = await axios.get(`${GITHUB_API}/search/repositories`, {
      headers: getHeaders(userToken),
      params: { q: query, sort: 'stars', order: 'desc', per_page: perPage, page },
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

export async function getRepoDetail({ owner, repo, userToken }) {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: getHeaders(userToken),
    });
    return normalizeRepo(data);
  } catch (err) {
    handleGitHubError(err);
  }
}
