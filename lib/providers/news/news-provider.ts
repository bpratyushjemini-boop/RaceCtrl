import { BaseProvider } from "../base";
import { CacheManager } from "../cache/cache-manager";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  date: string;
  imageUrl?: string;
  category: "Breaking" | "Feature" | "Technical" | "Analysis" | "Trending";
}

const OFFLINE_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    title: "Hamilton secures historic first podium with Scuderia Ferrari at Monza GP",
    summary: "A masterclass in tire conservation saw Lewis Hamilton clinch a P3 finish on Ferrari's home soil, sending the tifosi into absolute raptures.",
    url: "/news/hamilton-ferrari-podium",
    date: "2026-07-19T17:30:00Z",
    category: "Trending",
  },
  {
    id: "news-2",
    title: "New active aerodynamics regulations finalized for 2026 F1 grid",
    summary: "The FIA has finalized the active aero mapping parameters for the upcoming technical regulation reset. Dual-element wings will adapt in real-time.",
    url: "/news/2026-active-aero",
    date: "2026-07-18T14:15:00Z",
    category: "Technical",
  },
  {
    id: "news-3",
    title: "Verstappen and Norris engage in wheel-to-wheel battle in Silverstone thriller",
    summary: "Championship leaders Max Verstappen and Lando Norris swapped positions three times in five laps during an epic duel at Copse corner.",
    url: "/news/verstappen-norris-silverstone",
    date: "2026-07-17T11:00:00Z",
    category: "Breaking",
  },
  {
    id: "news-4",
    title: "Audi F1 completes dynamic dyno testing on 2026 hybrid power unit",
    summary: "Audi's technical headquarters in Neuburg confirms that their all-new 50/50 electrical-thermal split power unit has finished its first full race simulation.",
    url: "/news/audi-power-unit",
    date: "2026-07-15T09:45:00Z",
    category: "Analysis",
  },
  {
    id: "news-5",
    title: "Mercedes introduces revised front wing architecture for Spa upgrade package",
    summary: "Technical drawings reveal a bold outwash-generating endplate scoop designed to re-energize the floor vortex under high-speed cornering.",
    url: "/news/mercedes-spa-upgrades",
    date: "2026-07-14T08:00:00Z",
    category: "Technical",
  }
];

export class NewsProvider implements BaseProvider {
  name = "news";
  private rssUrl = "https://www.skysports.com/rss/12040"; // Sky Sports F1 RSS

  async fetch(key: string, ...args: any[]): Promise<NewsArticle[]> {
    if (typeof window !== "undefined") return OFFLINE_NEWS;

    const cacheKey = "f1_news_feed";
    const cached = CacheManager.get<NewsArticle[]>(cacheKey, 600000); // 10 minutes cache
    if (cached) return cached;

    try {
      const res = await fetch(this.rssUrl, {
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        return OFFLINE_NEWS;
      }

      const xml = await res.text();
      const articles = this.parseRssXml(xml);
      
      if (articles.length > 0) {
        CacheManager.set(cacheKey, articles);
        return articles;
      }
    } catch (err) {
      console.warn("[NewsProvider] Failed to fetch live news, serving mocks:", err);
    }

    return OFFLINE_NEWS;
  }

  normalize(key: string, data: any): any {
    return data;
  }

  validate(key: string, data: any): boolean {
    return Array.isArray(data) && data.length > 0;
  }

  private parseRssXml(xml: string): NewsArticle[] {
    const articles: NewsArticle[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/;
    const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/;
    const linkRegex = /<link>([\s\S]*?)<\/link>/;
    const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
    const enclosureRegex = /<enclosure[^>]+url="([^"]+)"/;
    const mediaContentRegex = /<media:content[^>]+url="([^"]+)"/;

    let match;
    let count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < 8) {
      const itemContent = match[1];
      
      const titleMatch = titleRegex.exec(itemContent);
      const descMatch = descRegex.exec(itemContent);
      const linkMatch = linkRegex.exec(itemContent);
      const pubDateMatch = pubDateRegex.exec(itemContent);
      const enclosureMatch = enclosureRegex.exec(itemContent) || mediaContentRegex.exec(itemContent);

      const title = titleMatch ? this.cleanXmlEntities(titleMatch[1]) : "";
      const summary = descMatch ? this.cleanXmlEntities(descMatch[1].replace(/<[^>]*>?/gm, "")) : ""; // Strip HTML tags
      const url = linkMatch ? linkMatch[1].trim() : "";
      const date = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();
      const imageUrl = enclosureMatch ? enclosureMatch[1] : undefined;

      if (title && url) {
        // Classify categories heuristically based on keywords
        let category: NewsArticle["category"] = "Analysis";
        const text = (title + " " + summary).toLowerCase();
        if (text.includes("breaking") || text.includes("announce") || text.includes("sign")) {
          category = "Breaking";
        } else if (text.includes("upgrade") || text.includes("aero") || text.includes("engine") || text.includes("technical")) {
          category = "Technical";
        } else if (text.includes("interview") || text.includes("feature")) {
          category = "Feature";
        } else if (text.includes("hamilton") || text.includes("verstappen") || text.includes("norris")) {
          category = "Trending";
        }

        articles.push({
          id: `live-news-${count}`,
          title,
          summary,
          url,
          date,
          imageUrl,
          category,
        });
        count++;
      }
    }

    return articles;
  }

  private cleanXmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .trim();
  }
}
