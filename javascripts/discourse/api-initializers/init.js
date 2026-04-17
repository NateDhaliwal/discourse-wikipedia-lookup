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

        const res = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(search_term)}`);
        let data = await res.json();
        
        if (data["pages"].length === 0) continue; // Exit if no matches, so don't add any styling
        data = data["pages"][0];
        wrap.classList.add("wp-lookup");
        const excerpt = data.excerpt.replace(/(<([^>]+)>)/ig, '');
        const content = `Full page at https://wikipedia.org/wiki/${data.key} \n\n ${excerpt}`;
        console.log(content);
        tooltip.show(wrap, {
          content: content,
          identifier: `wikipedia-lookup-${wrap_no}`
        })
        wrap_no++;
      }
    } else {
      return;
    }
  });
});
