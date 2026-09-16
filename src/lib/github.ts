export interface GitHubActivityItem {
  id: string;
  type: string;
  actionText: string;
  repoName: string;
  repoUrl: string;
  date: string;
  detail?: string;
  targetUrl?: string;
}

export function formatGitHubEvent(event: any): GitHubActivityItem | null {
  const repoName = event.repo?.name || "";
  const repoUrl = `https://github.com/${repoName}`;
  const rawDate = event.created_at;
  const dateObj = new Date(rawDate);
  const date = !isNaN(dateObj.getTime())
    ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`
    : rawDate;

  const type = event.type;
  const payload = event.payload || {};

  switch (type) {
    case "PushEvent": {
      const branch = (payload.ref || "").replace("refs/heads/", "");
      const commitCount = payload.size ?? (payload.commits?.length || 1);
      const commitMsg = payload.commits?.[0]?.message?.split("\n")[0];
      return {
        id: event.id,
        type: "Push",
        actionText: `Pushed ${commitCount > 1 ? `${commitCount} commits` : "commit"} to ${branch}`,
        repoName,
        repoUrl,
        date,
        detail: commitMsg,
        targetUrl: `${repoUrl}/tree/${branch}`,
      };
    }
    case "PullRequestEvent": {
      const action = payload.action;
      const pr = payload.pull_request;
      return {
        id: event.id,
        type: "PR",
        actionText: `${action === "opened" ? "Opened" : action === "closed" && pr?.merged ? "Merged" : action} Pull Request #${payload.number || pr?.number}`,
        repoName,
        repoUrl,
        date,
        detail: pr?.title,
        targetUrl: pr?.html_url || `${repoUrl}/pull/${payload.number}`,
      };
    }
    case "IssuesEvent": {
      const action = payload.action;
      const issue = payload.issue;
      return {
        id: event.id,
        type: "Issue",
        actionText: `${action === "opened" ? "Opened" : action === "closed" ? "Closed" : action} Issue #${payload.issue?.number}`,
        repoName,
        repoUrl,
        date,
        detail: issue?.title,
        targetUrl: issue?.html_url || `${repoUrl}/issues/${issue?.number}`,
      };
    }
    case "CreateEvent": {
      const refType = payload.ref_type; // 'repository', 'branch', 'tag'
      const ref = payload.ref;
      return {
        id: event.id,
        type: "Create",
        actionText: `Created ${refType} ${ref ? `\`${ref}\` in` : ""}`,
        repoName,
        repoUrl,
        date,
        detail: payload.description,
        targetUrl: ref && refType === "branch" ? `${repoUrl}/tree/${ref}` : repoUrl,
      };
    }
    case "DeleteEvent": {
      return {
        id: event.id,
        type: "Delete",
        actionText: `Deleted ${payload.ref_type} \`${payload.ref}\``,
        repoName,
        repoUrl,
        date,
        targetUrl: repoUrl,
      };
    }
    case "ForkEvent": {
      const forkee = payload.forkee;
      return {
        id: event.id,
        type: "Fork",
        actionText: `Forked from`,
        repoName,
        repoUrl,
        date,
        detail: forkee?.full_name ? `→ ${forkee.full_name}` : undefined,
        targetUrl: forkee?.html_url || repoUrl,
      };
    }
    case "WatchEvent": {
      return {
        id: event.id,
        type: "Star",
        actionText: "Starred repository",
        repoName,
        repoUrl,
        date,
        targetUrl: repoUrl,
      };
    }
    case "ReleaseEvent": {
      return {
        id: event.id,
        type: "Release",
        actionText: `Published release ${payload.release?.tag_name || payload.release?.name || ""}`,
        repoName,
        repoUrl,
        date,
        detail: payload.release?.name,
        targetUrl: payload.release?.html_url || `${repoUrl}/releases`,
      };
    }
    case "IssueCommentEvent": {
      return {
        id: event.id,
        type: "Comment",
        actionText: `Commented on #${payload.issue?.number}`,
        repoName,
        repoUrl,
        date,
        detail: payload.comment?.body?.slice(0, 100),
        targetUrl: payload.comment?.html_url,
      };
    }
    default: {
      const cleanType = type.replace("Event", "");
      return {
        id: event.id,
        type: cleanType,
        actionText: cleanType,
        repoName,
        repoUrl,
        date,
        targetUrl: repoUrl,
      };
    }
  }
}
