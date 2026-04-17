import { apiInitializer } from "discourse/lib/api";
import DTooltipInstance from "discourse/float-kit/lib/d-tooltip-instance";

export default apiInitializer((api) => {
  const tooltip = api.container.lookup("service:tooltip");
  api.decorateCookedElement(async (post) => {
    const wp_wraps = post.querySelectorAll("[data-wrap=\"wikipedia-lookup\"]");
    let wrap_no = 0;
    if (wp_wraps.length > 0) {
      for (const wrap of wp_wraps) {
        const search_term = wrap.textContent;
        wrap.id = `wikipedia-lookup-${wrap_no}`;
        const data = await getIfCached(search_term);
        if (!data) return; // Exit if no matches, so don't add any styling
        wrap.classList.add("wp-lookup");
        tooltip.show(wrap, {
          content: data.excerpt.replace(/(<([^>]+)>)/ig, ''), // Remove HTML tags
          placement: "top",
          fallbackPlacements: ["bottom"],
          triggers: ["hover"],
        })
        wrap_no++;
      }
    } else {
      return;
    }
  });
});

async function getIfCached(search_term) {
  const searchItem = sessionStorage.getItem(search_term);
  if (searchItem) return searchItem;
  const res = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/page?q=${search_term}`);
  const data = await res.json();
  if (data["pages"].length === 0) return null;
  sessionStorage.setItem(search_term, data["pages"][0]);
  return data["pages"][0];
}
