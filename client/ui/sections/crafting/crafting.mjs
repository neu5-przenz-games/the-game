export class UICrafting {
  constructor({ name, craftingCb }) {
    const [craftingWrapper] = document.getElementsByClassName("crafting");
    this.craftingWrapper = craftingWrapper;

    this.craftingWrapper.onclick = (ev) => {
      const el = ev.target;
      const { id } = el.dataset;

      craftingCb({ id, name });
    };
  }

  setCrafting(crafting) {
    this.craftingWrapper.textContent = "";

    const fragment = new DocumentFragment();

    crafting.forEach(({ id, displayName }) => {
      const div = document.createElement("div");
      div.classList.add("crafting__receipt");

      const btn = document.createElement("button");
      btn.classList.add("crafting__receipt-button");
      btn.dataset.id = id;
      btn.innerText = `Make ${displayName}`;

      div.appendChild(btn);

      fragment.appendChild(div);
    });

    this.craftingWrapper.appendChild(fragment);
  }
}
