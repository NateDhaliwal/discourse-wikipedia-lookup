import { concat } from "@ember/helper";
import { trustHTML } from "@ember/template";
import { apiInitializer } from "discourse/lib/api";
import DTooltip from "discourse/float-kit/components/d-tooltip";

export default apiInitializer((api) => {
  const tooltip = api.container.lookup("service:tooltip");
  api.decorateCookedElement(async (post, helper) => {
    const wp_wraps = post.querySelectorAll("[data-wrap=\"wikipedia-lookup\"]");
    if (wp_wraps.length > 0) {
      for (const wrap of wp_wraps) {
        const search_term = wrap.textContent;
        wrap.innerHTML = "";
        const data = await getIfCached(search_term);
        if (data === null) continue;
        const excerpt = data.excerpt.replace(/(<([^>]+)>)/ig, '').trim();

        helper.renderGlimmer(wrap, <template>
          <DTooltip @interactive={{true}} @placement="right" class="wp-lookup">
            <:trigger>
              {{search_term}}
            </:trigger>
            <:content>
              <div>
                <p>
                  Full page at 
                  <a href="https://wikipedia.org/wiki/{{data.key}}" target="_blank" rel="noopener noreferrer">
                    https://wikipedia.org/wiki/{{data.key}}
                  </a>
                </p>
                <p>
                  {{excerpt}}...
                </p>
              </div>
            </:content>
          </DTooltip>
        </template>);
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
