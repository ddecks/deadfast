let pagefind;

async function initSearch() {
  if (!pagefind) {
    try {
      pagefind = await import("/pagefind/pagefind.js");
    } catch (error) {
      console.error("Pagefind not found. Make sure to run 'npm run build' first.");
      return false;
    }
  }
  return true;
}

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if (searchInput && searchResults) {
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
      return;
    }

    const searchReady = await initSearch();
    if (!searchReady) {
      searchResults.innerHTML = '<div class="no-results">Search not available in development mode</div>';
      searchResults.style.display = 'block';
      return;
    }

    const search = await pagefind.search(query);
    
    if (search.results.length > 0) {
      const results = await Promise.all(
        search.results.slice(0, 8).map(async (result) => {
          const data = await result.data();
          return `
            <div class="search-result">
              <h4><a href="${data.url}">${data.meta.title}</a></h4>
              <p>${data.excerpt}</p>
            </div>
          `;
        })
      );
      searchResults.innerHTML = results.join('');
      searchResults.style.display = 'block';
    } else {
      searchResults.innerHTML = '<div class="no-results">No results found</div>';
      searchResults.style.display = 'block';
    }
  });

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-banner')) {
      searchResults.style.display = 'none';
    }
  });
}
