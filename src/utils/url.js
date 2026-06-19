export function getHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    if (url.includes("//")) url = url.substring(url.indexOf("//") + 2);
    if (url.includes("/")) url = url.substring(0, url.indexOf("/"));
    return url;
  }
}
