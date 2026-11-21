/** Filters the animation cards, and updates the counter. */
const input = document.querySelector("#filter");
const count = document.querySelector("#count");
const empty = document.querySelector("#empty");
const cards = [...document.querySelectorAll(".animation")];

const label = (n) => `${n} animation${n === 1 ? "" : "s"}`;

const filter = () => {
  const query = input.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const match = card.dataset.title.includes(query);
    card.hidden = !match;
    if (match) visible++;
  }
  count.textContent =
    visible === cards.length
      ? label(cards.length)
      : `${visible} of ${label(cards.length)}`;
  empty.hidden = visible > 0;
};

input.addEventListener("input", filter);

// the filter only makes sense with JavaScript
document.querySelector("#search").hidden = false;
filter();
