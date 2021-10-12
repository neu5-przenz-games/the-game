const createBtn = ({ classNames = [], datasets = [], text = "" }) => {
  const btn = document.createElement("button");
  btn.classList.add(...classNames);
  datasets.forEach(({ name, value }) => {
    btn.dataset[name] = value;
  });
  btn.textContent = text;

  return btn;
};

export { createBtn };
