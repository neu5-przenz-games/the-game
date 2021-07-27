export default class UISkills {
  constructor() {
    const [skillsWrapper] = document.getElementsByClassName("skills");
    this.skillsWrapper = skillsWrapper;
  }

  setSkills(skills) {
    this.skillsWrapper.textContent = "";

    const fragment = new DocumentFragment();

    skills.forEach(({ name, levelName, progressInPerc }) => {
      const div = document.createElement("div");
      div.classList.add("skills__skill");
      div.innerText = `${name}: ${levelName}`;

      const skillProgressBarDiv = document.createElement("div");
      const skillProgressBarWrapperDiv = document.createElement("div");
      skillProgressBarWrapperDiv.classList.add("skills__progressbar-wrapper");
      skillProgressBarDiv.classList.add("skills__progressbar");
      skillProgressBarDiv.style.width = `${progressInPerc}%`;

      skillProgressBarWrapperDiv.appendChild(skillProgressBarDiv);
      div.appendChild(skillProgressBarWrapperDiv);

      fragment.appendChild(div);
    });

    this.skillsWrapper.appendChild(fragment);
  }
}
