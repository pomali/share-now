// Create the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'get-from-share-now',
    title: 'Get from Share Now',
    contexts: ['editable'],
  });
});

// Open the QR receiver page in a popup window when the menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'get-from-share-now') {
    const receiverUrl =
      chrome.runtime.getURL(`receiver/index.html`) + `?tabId=${tab.id}`;
    chrome.windows.create({
      url: receiverUrl,
      type: 'popup',
      width: 460,
      height: 620,
    });
  }
});

// Relay fill messages from the receiver page to the target tab
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'fill') {
    chrome.tabs.sendMessage(message.tabId, {
      action: 'fill',
      text: message.text,
    });
    sendResponse({ success: true });
  }
});
