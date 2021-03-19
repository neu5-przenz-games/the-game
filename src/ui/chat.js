export default class UIChat {
  constructor(playerName) {
    this.playerName = playerName;
    const [chatInput] = document.getElementsByClassName("chat__input");
    this.chatInput = chatInput;
    const [chatMessages] = document.getElementsByClassName("chat__messages");
    this.chatMessages = chatMessages;
  }

  get message() {
    return this.chatInput.value;
  }

  addMessage(name, message, delimeter = ":", classString = null) {
    const entry = document.createElement("li");
    if (classString) {
      entry.classList.add(classString);
    }
    entry.appendChild(
      document.createTextNode(`${name}${delimeter} ${message}`)
    );
    this.chatMessages.appendChild(entry);
  }

  addOwnMessage() {
    this.addMessage("You", this.message);
  }

  addServerMessage(message) {
    this.addMessage("*", message, "", "chat-message__server");
  }

  clearInput() {
    this.chatInput.value = "";
  }
}
