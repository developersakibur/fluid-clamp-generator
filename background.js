chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-clamp") {
    await chrome.action.openPopup();
  }
  if (command === "copy-and-close") {
    chrome.runtime.sendMessage({ action: "COPY_AND_CLOSE" });
  }
  if (command === "switch-radio") {
    chrome.runtime.sendMessage({ action: "SWITCH_RADIO" });
  }
});