export default class GameItem {
  constructor({ name, displayName, imgURL = "", type }) {
    this.name = name;
    this.displayName = displayName;
    this.imgURL = imgURL;
    this.type = type;
  }
}
