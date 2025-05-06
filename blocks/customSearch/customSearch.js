export default function decorate(block) {
    let headingText = '';
    let queryUrl = '';
    const facetProperties = ['customTags'];
    const facetsWithCount = {};
  
    [...block.children].forEach((child, n) => {
      if (n === 0) headingText = child.textContent.trim();
      if (n === 1) queryUrl = child.textContent.trim();
    });
  
    initSearch();
  
    async function initSearch() {
      queryUrl = `${window.location.protocol}//${window.location.host}${queryUrl}`;
      const allIndexes = await fetchIndexes(queryUrl);
      buildSearch(headingText, block);
  
      async function fetchIndexes(url) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.error('Failed to fetch index:', response.statusText);
            return [];
          }
  
          const json = await response.json();
          if (!json || !Array.isArray(json.data)) {
            console.error('Invalid or missing data in index file.');
            return [];
          }
  
          console.log(json.data);
          return json.data;
        } catch (error) {
          console.error('Error fetching index:', error);
          return [];
        }
      }
  
      function buildSearch(title, targetBlock) {
        const container = document.createElement('div');
        container.className = 'search-container';
  
        const heading = document.createElement('h2');
        heading.className = 'search-heading';
        heading.textContent = title || 'Search';
  
        const searchInputWrapper = document.createElement('div');
        searchInputWrapper.className = 'search-input-wrapper';
  
        const searchInput = document.createElement('input');
        searchInput.type = 'search';
        searchInput.className = 'search-input';
        searchInput.placeholder = 'Search...';
        searchInput.setAttribute('aria-label', 'Search');
  
        const searchButton = document.createElement('button');
        searchButton.className = 'search-button';
        searchButton.textContent = 'Search';
  
        searchInputWrapper.appendChild(searchInput);
        searchInputWrapper.appendChild(searchButton);
  
        const resultsDiv = document.createElement('ul');
        resultsDiv.className = 'search-results';
  
        container.appendChild(heading);
        container.appendChild(searchInputWrapper);
        container.appendChild(resultsDiv);
  
        targetBlock.textContent = '';
        targetBlock.appendChild(container);
  
        const handleSearch = () => {
          const searchTerm = searchInput.value.trim().toLowerCase();
  
          if (searchTerm.length >= 1) {
            filterResults(searchTerm, null, resultsDiv);
          } else {
            resultsDiv.innerHTML = '';
          }
        };
  
        searchButton.addEventListener('click', handleSearch);
      }
  
      function filterResults(searchTerm, selectedFacets, resultsDiv) {
        const finalResults = new Set();
        const searchTermsArray = searchTerm.split(/\s+/);
        console.log({ searchTermsArray });
  
        allIndexes.forEach((item) => {
          searchTermsArray.forEach((term) => {
            if (
              (item.description && item.description.toLowerCase().includes(term)) ||
              (item.title && item.title.toLowerCase().includes(term))
            ) {
              finalResults.add(item);
            }
          });
        });
  
        console.log(finalResults);
        resultsDiv.innerHTML = '';
        createFacets(Array.from(finalResults));
        const facetsMarkup = buildFacetsMarkup(facetsWithCount);
  
        const layoutWrapper = document.createElement('div');
        layoutWrapper.className = 'search-layout';
        layoutWrapper.style.display = 'flex';
        layoutWrapper.style.gap = '2rem';
  
        const facetContainer = document.createElement('div');
        facetContainer.className = 'facet-column';
        facetContainer.style.flex = '0 0 250px';
        facetContainer.appendChild(facetsMarkup);
  
        const resultContainer = document.createElement('div');
        resultContainer.className = 'results-column';
        resultContainer.style.flex = '1';
  
        finalResults.forEach((item) => {
          const card = document.createElement('div');
          card.className = 'search-result';
  
          const titleEl = document.createElement('h3');
          const link = document.createElement('a');
          link.href = item.path;
          link.textContent = item.title;
          titleEl.appendChild(link);
  
          const description = document.createElement('p');
          description.textContent = item.description || 'No description available.';
  
          const image = document.createElement('img');
          image.src = item.thumbnail;
          image.alt = item.title;
  
          card.appendChild(image);
          card.appendChild(titleEl);
          card.appendChild(description);
  
          resultContainer.appendChild(card);
        });
  
        layoutWrapper.appendChild(facetContainer);
        layoutWrapper.appendChild(resultContainer);
  
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(layoutWrapper);
      }
  
      function createFacets(results) {
        facetProperties.forEach((property) => {
          const facetValues = {};
          results.forEach((item) => {
            const value = item[property];
            if (value && value !== '') {
              facetValues[value] = (facetValues[value] || 0) + 1;
            }
          });
          facetsWithCount[property] = facetValues;
        });
        console.log(facetsWithCount);
      }
  
      function buildFacetsMarkup(facetData) {
        const facetContainer = document.createElement('div');
        facetContainer.className = 'facet-container';
  
        Object.entries(facetData).forEach(([facetCategory, facets]) => {
          const fieldset = document.createElement('fieldset');
          fieldset.className = 'facet-group';
  
          const legend = document.createElement('legend');
          legend.textContent = facetCategory;
          fieldset.appendChild(legend);
  
          let hasLabel = false;
  
          Object.entries(facets).forEach(([value, count]) => {
            const label = document.createElement('label');
            label.className = 'facet-item';
  
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = facetCategory;
            checkbox.value = value;
  
            checkbox.addEventListener('change', (e) => {
              const isChecked = e.target.checked;
              console.log(`[Facet Changed] ${facetCategory} -> ${value} = ${isChecked}`);
            });
  
            const text = document.createElement('span');
            text.textContent = ` ${value} (${count})`;
  
            label.appendChild(checkbox);
            label.appendChild(text);
            fieldset.appendChild(label);
            hasLabel = true;
          });
  
          if (hasLabel) {
            facetContainer.appendChild(fieldset);
          }
        });
  
        return facetContainer;
      }
    }
  }
  