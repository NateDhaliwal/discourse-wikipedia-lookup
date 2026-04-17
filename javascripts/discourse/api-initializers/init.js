import { apiInitializer } from "discourse/lib/api";
import DTooltipInstance from "discourse/float-kit/lib/d-tooltip-instance";

export default apiInitializer((api) => {
  const tooltip = api.container.lookup("service:tooltip");
  api.decorateCookedElement(async (post) => {
    const wp_wraps = post.querySelectorAll("[data-wrap=\"wikipedia-lookup\"]");
    if (wp_wraps.length > 0) {
      for (const wrap of wp_wraps) {
        const search_term = wrap.textContent;
        const data = await getIfCached(search_term);
        if (data === null) continue; // Exit if no matches, so don't add any styling
        wrap.classList.add("wp-lookup");
        const excerpt = data.excerpt.replace(/(<([^>]+)>)/ig, '');
        const content = `Full page at https://wikipedia.org/wiki/${data.key} \n\n ${excerpt}`;
        tooltip.register(wrap, {
          content: content,
          placement: "top",
          fallbackPlacements: ["bottom"],
          triggers: ["hover"],
        })
      }
    } else {
      return;
    }
  });
});

async function getIfCached(search_term) {
  const searchItem = JSON.parse(sessionStorage.getItem(search_term));
  if (searchItem && searchItem.key && searchItem.excerpt) return searchItem;
  const res = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(search_term)}`);
  const data = await res.json();
  if (data["pages"].length === 0) return null;
  sessionStorage.setItem(search_term, JSON.stringify(data["pages"][0]));
  return data["pages"][0];
}
