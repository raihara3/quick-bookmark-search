let searchContainer = null;
let isSearchOpen = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleSearch') {
    if (isSearchOpen) {
      closeSearch();
    } else {
      openSearch();
    }
  }
});

function openSearch() {
  if (searchContainer) return;
  
  searchContainer = document.createElement('div');
  searchContainer.id = 'quick-bookmark-search';
  searchContainer.innerHTML = `
    <div class="qbs-overlay"></div>
    <div class="qbs-modal">
      <input type="text" class="qbs-input" placeholder="Search bookmarks..." autofocus>
      <div class="qbs-results"></div>
    </div>
  `;
  
  document.body.appendChild(searchContainer);
  isSearchOpen = true;
  
  const input = searchContainer.querySelector('.qbs-input');
  const overlay = searchContainer.querySelector('.qbs-overlay');
  
  input.focus();
  
  overlay.addEventListener('click', closeSearch);
  
  document.addEventListener('keydown', handleGlobalKeydown);
  
  initializeSearch();
}

function closeSearch() {
  if (searchContainer) {
    searchContainer.remove();
    searchContainer = null;
    isSearchOpen = false;
    document.removeEventListener('keydown', handleGlobalKeydown);
  }
}

function handleGlobalKeydown(event) {
  if (event.key === 'Escape') {
    closeSearch();
  }
}