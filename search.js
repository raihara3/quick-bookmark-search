let currentResults = [];
let selectedIndex = -1;

function initializeSearch() {
  const input = document.querySelector('.qbs-input');
  const resultsContainer = document.querySelector('.qbs-results');
  
  let debounceTimer;
  
  input.addEventListener('input', (event) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchBookmarks(event.target.value);
    }, 300);
  });
  
  input.addEventListener('keydown', handleSearchKeydown);
}

function searchBookmarks(query) {
  const resultsContainer = document.querySelector('.qbs-results');
  
  if (!query) {
    resultsContainer.innerHTML = '';
    currentResults = [];
    selectedIndex = -1;
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'searchBookmarks', query }, (response) => {
    if (response && response.results) {
      currentResults = response.results;
      selectedIndex = -1;
      displayResults(response.results);
    }
  });
}

function displayResults(results) {
  const resultsContainer = document.querySelector('.qbs-results');
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="qbs-no-results">No bookmarks found</div>';
    return;
  }
  
  resultsContainer.innerHTML = results.map((bookmark, index) => `
    <div class="qbs-result-item" data-index="${index}">
      <img class="qbs-favicon" src="https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}" alt="">
      <div class="qbs-result-content">
        <div class="qbs-title">${escapeHtml(bookmark.title)}</div>
        <div class="qbs-url">${escapeHtml(bookmark.url)}</div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.qbs-result-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      openBookmark(currentResults[index]);
    });
    
    item.addEventListener('mouseenter', () => {
      updateSelection(index);
    });
  });
}

function handleSearchKeydown(event) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (currentResults.length > 0) {
        updateSelection((selectedIndex + 1) % currentResults.length);
      }
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      if (currentResults.length > 0) {
        updateSelection(selectedIndex <= 0 ? currentResults.length - 1 : selectedIndex - 1);
      }
      break;
      
    case 'Enter':
      event.preventDefault();
      if (selectedIndex >= 0 && currentResults[selectedIndex]) {
        openBookmark(currentResults[selectedIndex]);
      }
      break;
  }
}

function updateSelection(newIndex) {
  const items = document.querySelectorAll('.qbs-result-item');
  
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.remove('selected');
    }
  });
  
  selectedIndex = newIndex;
  
  if (items[selectedIndex]) {
    items[selectedIndex].classList.add('selected');
    items[selectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

function openBookmark(bookmark) {
  chrome.runtime.sendMessage({ action: 'openTab', url: bookmark.url });
  window.open(bookmark.url, '_blank');
  closeSearch();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}