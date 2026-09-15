import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootUrl = new URL(
  "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/",
);
const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const startedAt = new Date();
const timestamp = startedAt.toISOString().replaceAll(":", "-");
const snapshotDirectory = resolve(
  runsDirectory,
  `product-knowledge-snapshot-${timestamp}`,
);
const maximumPages = 1_000;
const concurrency = 8;

type SnapshotPage = {
  url: string;
  fetchedAt: string;
  httpStatus: number;
  title: string;
  contentSha256: string;
  text: string;
};

type CrawlFailure = {
  url: string;
  reason: string;
};

function normalizeUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    const url = new URL(rawUrl, baseUrl);
    url.hash = "";
    url.search = "";

    if (url.origin !== rootUrl.origin) return null;
    if (!url.pathname.startsWith(rootUrl.pathname)) return null;
    if (
      url.pathname.includes("/assets/") ||
      url.pathname.includes("/stylesheets/") ||
      url.pathname.includes("/javascripts/") ||
      url.pathname.includes("/search/")
    ) {
      return null;
    }

    const finalSegment = url.pathname.split("/").at(-1) ?? "";
    if (finalSegment.includes(".") && !finalSegment.endsWith(".html")) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function extractText($: cheerio.CheerioAPI): string {
  const content = $("article.md-content__inner").first().clone();
  const root = content.length > 0 ? content : $("main").first().clone();
  root.find("script, style, nav, footer").remove();
  root.find("br").replaceWith("\n");
  root.find("h1, h2, h3, h4, h5, h6, p, li, tr, pre, blockquote").each(
    (_, element) => {
      $(element).append("\n");
    },
  );

  return root
    .text()
    .replaceAll("\u00a0", " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPage(
  url: string,
): Promise<
  | { page: SnapshotPage; links: string[] }
  | { failure: CrawlFailure }
> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "jobvision-harness-snapshot-poc/0.1" },
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      return {
        failure: { url, reason: `HTTP ${response.status} ${response.statusText}` },
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return {
        failure: { url, reason: `Unexpected Content-Type: ${contentType}` },
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const text = extractText($);
    const finalUrl = normalizeUrl(response.url, url) ?? url;
    const links = $("a[href]")
      .map((_, element) => normalizeUrl($(element).attr("href") ?? "", finalUrl))
      .get()
      .filter((link): link is string => link !== null);
    const title = $("h1").first().text().trim() || $("title").text().trim();

    return {
      page: {
        url: finalUrl,
        fetchedAt: new Date().toISOString(),
        httpStatus: response.status,
        title,
        contentSha256: createHash("sha256").update(text).digest("hex"),
        text,
      },
      links,
    };
  } catch (error) {
    return {
      failure: {
        url,
        reason: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

const queue = [rootUrl.href];
const discovered = new Set(queue);
const pages: SnapshotPage[] = [];
const failures: CrawlFailure[] = [];

while (queue.length > 0) {
  const batch = queue.splice(0, concurrency);
  const results = await Promise.all(batch.map(fetchPage));

  for (const result of results) {
    if ("failure" in result) {
      failures.push(result.failure);
      continue;
    }

    pages.push(result.page);
    for (const link of result.links) {
      if (discovered.has(link)) continue;
      if (discovered.size >= maximumPages) {
        throw new Error(`Crawl exceeded the ${maximumPages}-page safety limit.`);
      }
      discovered.add(link);
      queue.push(link);
    }
  }
}

pages.sort((left, right) => left.url.localeCompare(right.url));
await mkdir(snapshotDirectory, { recursive: true });

const pagesJsonl = `${pages.map((page) => JSON.stringify(page)).join("\n")}\n`;
const pagesPath = resolve(snapshotDirectory, "pages.jsonl");
const manifestPath = resolve(snapshotDirectory, "manifest.json");
const finishedAt = new Date();
const manifest = {
  schemaVersion: 1,
  rootUrl: rootUrl.href,
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  discovery: {
    strategy: "breadth-first crawl of same-origin HTML links under the Product Knowledge path",
    sitemap: "present but empty",
    robotsTxt: "not present (HTTP 404)",
    assetsDownloaded: false,
    maximumPages,
  },
  pageCount: pages.length,
  failureCount: failures.length,
  failures,
  pages: pages.map(({ url, fetchedAt, httpStatus, title, contentSha256 }) => ({
    url,
    fetchedAt,
    httpStatus,
    title,
    contentSha256,
  })),
};
const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;

await writeFile(pagesPath, pagesJsonl, "utf8");
await writeFile(manifestPath, manifestJson, "utf8");

const totalBytes =
  Buffer.byteLength(pagesJsonl, "utf8") + Buffer.byteLength(manifestJson, "utf8");
console.log(
  JSON.stringify(
    {
      snapshotDirectory,
      pagesPath,
      manifestPath,
      pageCount: pages.length,
      failureCount: failures.length,
      totalBytes,
      format: "UTF-8 JSON Lines page records plus a JSON manifest",
    },
    null,
    2,
  ),
);

if (pages.length === 0 || failures.length > 0) {
  process.exitCode = 1;
}
