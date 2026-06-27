/**
 * Generates rule-based "what to do next" steps for an issue.
 * No AI — purely deterministic based on labels and repo info.
 */
export function generateNextSteps(issue, repo) {
  const steps = [];
  const labels = (issue.labels || []).map((l) => l.toLowerCase());

  steps.push(
    `Read the contributing guidelines in CONTRIBUTING.md or the README at github.com/${repo.fullName}.`
  );
  steps.push('Fork the repository and create a new branch for your change.');

  if (labels.includes('bug')) {
    steps.push('Reproduce the bug locally before writing any code.');
    steps.push('Find existing test files related to the broken area.');
  }

  if (labels.includes('documentation') || labels.includes('docs')) {
    steps.push('Review the existing docs folder structure before adding new content.');
  }

  if (labels.includes('feature') || labels.includes('enhancement')) {
    steps.push(
      'Read the full issue thread to understand the agreed design before starting to code.'
    );
  }

  if (labels.includes('good first issue')) {
    steps.push('Comment on the issue to let maintainers know you are working on it.');
  }

  steps.push('Run existing tests before and after your changes to confirm nothing breaks.');
  steps.push('Keep your PR focused — one fix or one feature per PR.');
  steps.push(`Open your PR against the default branch of ${repo.fullName}.`);

  return steps;
}
