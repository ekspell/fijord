export const LINEAR_QUERIES = {
  teams: `{ teams { nodes { id name } } }`,
  teamProjects: `query TeamProjects($teamId: String!) {
    team(id: $teamId) { projects { nodes { id name } } }
  }`,
  createIssue: `mutation IssueCreate($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue { id identifier url title }
    }
  }`,
};

export const PRIORITY_MAP: Record<string, number> = {
  High: 2,
  Med: 3,
  Low: 4,
};

export function buildIssueDescription(
  description?: string,
  acceptanceCriteria?: string[]
): string {
  let md = description || "";
  if (acceptanceCriteria && acceptanceCriteria.length > 0) {
    md += "\n\n## Acceptance Criteria\n";
    md += acceptanceCriteria.map((ac) => `- [ ] ${ac}`).join("\n");
  }
  return md;
}

export class LinearError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function linearFetch(
  query: string,
  variables: Record<string, unknown> | undefined,
  apiKey: string
) {
  const res = await fetch("/api/linear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables, apiKey }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new LinearError(data.error || "Linear API error", res.status);
  }
  return res.json();
}
