export default class UISkills {
  constructor() {
    const [skillsWrapper] = document.getElementsByClassName("skills");
    this.skillsWrapper = skillsWrapper;
  }

  // @TODO: Make skills tab look nicer #239
  setSkills(skills) {
    this.skillsWrapper.textContent = "";

    const fragment = new DocumentFragment();

    skills.forEach(({ name, levelName, progressInPerc }) => {
      const div = document.createElement("div");
      div.classList.add("skills__skill");

      div.innerText = `${name}: ${levelName} ${progressInPerc}%`;

      fragment.appendChild(div);
    });

    this.skillsWrapper.appendChild(fragment);
  }
}
