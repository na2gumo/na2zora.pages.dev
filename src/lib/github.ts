export interface ActivityDetailItem {
  message: string;
  url?: string;
  sha?: string;
}

export interface GitHubActivityItem {
  id: string;
  type: string;
  actionText: string;
  repoName: string;
  repoUrl: string;
  date: string;
  detail?: string;
  targetUrl?: string;
  detailsList?: ActivityDetailItem[];
}

/**
 * 複数の GitHub イベント（特に同じリポジトリ・同じ日への PushEvent）を
 * 1 つのアクティビティにまとめ、コミット一覧や詳細を detailsList に保持する。
 */
export function aggregateGitHubEvents(
  events: any[],
  recentCommitsByRepo: Record<string, any[]> = {}
): GitHubActivityItem[] {
  const aggregated: GitHubActivityItem[] = [];

  for (const event of events) {
    const rawDate = event.created_at;
    const dateObj = new Date(rawDate);
    const date = !isNaN(dateObj.getTime())
      ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`
      : rawDate;

    const repoName = event.repo?.name || "";
    const repoUrl = `https://github.com/${repoName}`;
    const payload = event.payload || {};
    const type = event.type;

    if (type === "PushEvent") {
      const branch = (payload.ref || "").replace("refs/heads/", "");
      const commitList: any[] = payload.commits || [];
      let commitCount = commitList.length > 0 ? commitList.length : (payload.size ?? (payload.distinct_size ?? 1));

      // コミット詳細リストの生成（payload.commits にあればそれを利用）
      let details: ActivityDetailItem[] = commitList.map((c) => ({
        message: c.message ? c.message.split("\n")[0] : "Commit",
        sha: c.sha ? c.sha.slice(0, 7) : undefined,
        url: c.url
          ? c.url.replace("api.github.com/repos", "github.com").replace("/commits/", "/commit/")
          : c.sha
          ? `${repoUrl}/commit/${c.sha}`
          : undefined,
      }));

      // 直近の集約済みアイテムと同じリポジトリ・同じ日付の Push があればマージ
      const existing = aggregated.find(
        (item) =>
          item.type === "Push" &&
          item.repoName.startsWith(repoName) &&
          item.date === date
      );

      if (existing) {
        const currentCountMatch = existing.actionText.match(/\d+/);
        const currentCount = currentCountMatch ? parseInt(currentCountMatch[0], 10) : 1;
        const newCount = currentCount + commitCount;
        existing.actionText = `Made ${newCount} commits to`;

        if (!existing.detailsList) {
          existing.detailsList = [];
        }
        if (details.length > 0) {
          existing.detailsList.push(...details);
        }
        // 重複を除去
        const uniqueDetails = Array.from(
          new Map(existing.detailsList.map((d) => [d.sha || d.message, d])).values()
        );
        existing.detailsList = uniqueDetails;

        if (existing.detailsList.length > 0 && !existing.detail) {
          existing.detail = existing.detailsList[0].message;
        }
        continue;
      }

      // payload.commits が空の場合、渡された recentCommitsByRepo から同日のコミットを補完
      if (details.length === 0 && recentCommitsByRepo[repoName]) {
        const repoCommits = recentCommitsByRepo[repoName];
        const dayCommits = repoCommits.filter((c: any) => {
          const cDate = c.commit?.committer?.date || c.commit?.author?.date || "";
          return cDate.startsWith(date);
        });

        if (dayCommits.length > 0) {
          commitCount = Math.max(commitCount, dayCommits.length);
          details = dayCommits.map((c: any) => ({
            message: (c.commit?.message || "").split("\n")[0] || "Commit",
            sha: (c.sha || "").slice(0, 7),
            url: c.html_url || `${repoUrl}/commit/${c.sha}`,
          }));
        }
      }

      // 新規 Push アイテム
      aggregated.push({
        id: event.id,
        type: "Push",
        actionText: `Made ${commitCount} ${commitCount === 1 ? "commit" : "commits"} to`,
        repoName: branch ? `${repoName} (${branch})` : repoName,
        repoUrl: branch ? `${repoUrl}/tree/${branch}` : repoUrl,
        date,
        detail: details[0]?.message,
        targetUrl: branch ? `${repoUrl}/tree/${branch}` : repoUrl,
        detailsList: details.length > 0 ? details : undefined,
      });
      continue;
    }

    if (type === "PullRequestEvent") {
      const action = payload.action;
      const pr = payload.pull_request;
      aggregated.push({
        id: event.id,
        type: "PR",
        actionText: `${action === "opened" ? "Opened" : action === "closed" && pr?.merged ? "Merged" : action} Pull Request #${payload.number || pr?.number} in`,
        repoName,
        repoUrl,
        date,
        detail: pr?.title,
        targetUrl: pr?.html_url || `${repoUrl}/pull/${payload.number}`,
        detailsList: pr?.title
          ? [{ message: pr.title, url: pr.html_url || `${repoUrl}/pull/${payload.number}` }]
          : undefined,
      });
      continue;
    }

    if (type === "IssuesEvent") {
      const action = payload.action;
      const issue = payload.issue;
      aggregated.push({
        id: event.id,
        type: "Issue",
        actionText: `${action === "opened" ? "Opened" : action === "closed" ? "Closed" : action} Issue #${issue?.number} in`,
        repoName,
        repoUrl,
        date,
        detail: issue?.title,
        targetUrl: issue?.html_url || `${repoUrl}/issues/${issue?.number}`,
        detailsList: issue?.title
          ? [{ message: issue.title, url: issue.html_url || `${repoUrl}/issues/${issue?.number}` }]
          : undefined,
      });
      continue;
    }

    if (type === "CreateEvent") {
      const refType = payload.ref_type;
      const ref = payload.ref;
      aggregated.push({
        id: event.id,
        type: "Create",
        actionText: `Created ${refType} ${ref ? `\`${ref}\` in` : "in"}`,
        repoName,
        repoUrl,
        date,
        detail: payload.description,
        targetUrl: ref && refType === "branch" ? `${repoUrl}/tree/${ref}` : repoUrl,
      });
      continue;
    }

    if (type === "DeleteEvent") {
      aggregated.push({
        id: event.id,
        type: "Delete",
        actionText: `Deleted ${payload.ref_type} \`${payload.ref}\` in`,
        repoName,
        repoUrl,
        date,
        targetUrl: repoUrl,
      });
      continue;
    }

    if (type === "ForkEvent") {
      const forkee = payload.forkee;
      aggregated.push({
        id: event.id,
        type: "Fork",
        actionText: `Forked`,
        repoName,
        repoUrl,
        date,
        detail: forkee?.full_name ? `→ ${forkee.full_name}` : undefined,
        targetUrl: forkee?.html_url || repoUrl,
      });
      continue;
    }

    if (type === "WatchEvent") {
      aggregated.push({
        id: event.id,
        type: "Star",
        actionText: "Starred",
        repoName,
        repoUrl,
        date,
        targetUrl: repoUrl,
      });
      continue;
    }

    if (type === "ReleaseEvent") {
      aggregated.push({
        id: event.id,
        type: "Release",
        actionText: `Published release ${payload.release?.tag_name || payload.release?.name || ""} in`,
        repoName,
        repoUrl,
        date,
        detail: payload.release?.name,
        targetUrl: payload.release?.html_url || `${repoUrl}/releases`,
      });
      continue;
    }

    if (type === "IssueCommentEvent") {
      aggregated.push({
        id: event.id,
        type: "Comment",
        actionText: `Commented on #${payload.issue?.number} in`,
        repoName,
        repoUrl,
        date,
        detail: payload.comment?.body?.slice(0, 100),
        targetUrl: payload.comment?.html_url,
      });
      continue;
    }

    // Default fallback
    const cleanType = type.replace("Event", "");
    aggregated.push({
      id: event.id,
      type: cleanType,
      actionText: `${cleanType} in`,
      repoName,
      repoUrl,
      date,
      targetUrl: repoUrl,
    });
  }

  return aggregated;
}
