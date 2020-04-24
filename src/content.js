import { handleContentMessage } from "@cliqz/autoconsent";

browser.runtime.onMessage.addListener(handleContentMessage);

browser.runtime.sendMessage({
  type: "frame",
  url: window.location.href,
});
