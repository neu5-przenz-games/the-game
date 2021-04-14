export default (game) => {
  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && game.chat.message) {
      game.socket.emit("chatMessage", {
        text: game.chat.message,
      });
      game.chat.addOwnMessage();
      game.chat.clearInput();
    }
  });
};
