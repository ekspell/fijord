export type JiraCreds = {
  domain: string;
  email: string;
  apiToken: string;
};

export class JiraError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function jiraFetch(
  path: string,
  method: string,
  body: unknown | undefined,
  creds: JiraCreds
) {
  const res = await fetch("/api/jira", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path,
      method,
      body,
      domain: creds.domain,
      email: creds.email,
      apiToken: creds.apiToken,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new JiraError(data.error || "Jira API error", res.status);
  }
  return res.json();
}

export const JIRA_PRIORITY_MAP: Record<string, string> = {
  High: "High",
  Med: "Medium",
  Low: "Low",
};

/** Build an Atlassian Document Format (ADF) document from description + acceptance criteria */
export function buildJiraDescription(
  description?: string,
  acceptanceCriteria?: string[]
): Record<string, unknown> {
  const content: Record<string, unknown>[] = [];

  if (description) {
    content.push({
      type: "paragraph",
      content: [{ type: "text", text: description }],
    });
  }

  if (acceptanceCriteria && acceptanceCriteria.length > 0) {
    content.push({
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Acceptance Criteria" }],
    });
    content.push({
      type: "bulletList",
      content: acceptanceCriteria.map((ac) => ({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: ac }],
          },
        ],
      })),
    });
  }

  return {
    type: "doc",
    version: 1,
    content: content.length > 0 ? content : [{ type: "paragraph", content: [] }],
  };
}
