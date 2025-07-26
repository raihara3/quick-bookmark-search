chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-search') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleSearch' });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchBookmarks') {
    searchBookmarks(request.query).then(results => {
      sendResponse({ results });
    });
    return true;
  }
});

async function searchBookmarks(query) {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  const bookmarks = await getAllBookmarks();
  
  const titleExactMatches = [];
  const titlePartialMatches = [];
  const urlMatches = [];
  
  bookmarks.forEach(bookmark => {
    const lowerTitle = bookmark.title.toLowerCase();
    const lowerUrl = bookmark.url.toLowerCase();
    
    if (lowerTitle === lowerQuery) {
      titleExactMatches.push(bookmark);
    } else if (lowerTitle.includes(lowerQuery)) {
      titlePartialMatches.push(bookmark);
    } else if (lowerUrl.includes(lowerQuery)) {
      urlMatches.push(bookmark);
    }
  });
  
  return [...titleExactMatches, ...titlePartialMatches, ...urlMatches].slice(0, 10);
}

async function getAllBookmarks() {
  const bookmarkTreeNodes = await chrome.bookmarks.getTree();
  const bookmarks = [];
  
  function processNode(node) {
    if (node.url) {
      bookmarks.push({
        id: node.id,
        title: node.title,
        url: node.url
      });
    }
    
    if (node.children) {
      node.children.forEach(processNode);
    }
  }
  
  bookmarkTreeNodes.forEach(processNode);
  return bookmarks;
}