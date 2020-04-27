import AutoConsent from "@cliqz/autoconsent";

const tabLoaded = {};
function waitForTabLoaded(id) {
  return new Promise((resolve) => {
    tabLoaded[id] = resolve;
  });
}

window.consent = new AutoConsent(browser, browser.tabs.sendMessage);

fetch('/rules/rules.json').then(res => res.json())
.then(rules => {
  Object.keys(rules.consentomatic).forEach((name) => {
    window.consent.addConsentomaticCMP(name, rules.consentomatic[name])
  })
  rules.autoconsent.forEach((rule) => {
    window.consent.addCMP(rule);
  })
});

async function munchIt(url, sender) {
  const tabId = sender.tab.id;
  await waitForTabLoaded(tabId);
  const tab = await consent.checkTab(tabId);
  await tab.checked;

  const result = {
    site: url,
    url: tab.url.href,
    reconsent: tab.getCMPName(),
  }

  if (tab.getCMPName() !== null) {
    try {
      result.reconsentCMPShown = await tab.isPopupOpen();
      if (result.reconsentCMPShown) {
        await tab.doOptOut();
      }
    } catch (e) {
      console.error("Cookiemunch error=" + e);
      result.reconsentFailure = e.toString();
    }
  }
  return result;
}

browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete' && tabLoaded[tabId]) {
    tabLoaded[tabId]();
  }
});

browser.webNavigation.onDOMContentLoaded.addListener(
  window.consent.onFrame.bind(window.consent),
  { url: [{ schemes: ['http', 'https'] }]},
);

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "frame") {
    munchIt(message.url, sender).then(result => {
      console.log("Cookiemunch[b] result=" + JSON.stringify(result));
    });
  }
});
