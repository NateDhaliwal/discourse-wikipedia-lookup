import { apiInitializer } from "discourse/lib/api";
import DTooltipInstance from "discourse/float-kit/lib/d-tooltip-instance";

export default apiInitializer((api) => {
  api.decorateCookedElement(async (post) => {
    const tooltip = api.container.lookup("service:tooltip");
    const wp_wraps = post.querySelectorAll("[data-wrap=\"wikipedia-lookup\"]");
    let wrap_no = 0;
    if (wp_wraps.length > 0) {
      for (const wrap of wp_wraps) {
        const search_term = wrap.textContent;
        wrap.id = `wikipedia-lookup-${wrap_no}`;
        const res = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/page?q=${search_term}`);
        const data = await res.json();
        if (data.pages.length === 0) return; // Exit if no matches, so don't add any styling
        wrap.classList.add("wp-lookup");
        tooltip.show(post, {
          identifier: `wikipedia-lookup-${wrap_no}`,
          content: data.excerpt
        })
        wrap_no++;
      }
    } else {
      return;
    }
  });
});
