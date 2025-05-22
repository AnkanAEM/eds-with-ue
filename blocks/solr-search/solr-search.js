export default function decorate(block) {
  let headingText = 'Search';
  let queryUrl = '';
  let facetFields = ['customTags_str', 'path'];
  let dynamicFields = ['title', 'customTags', 'thumbnail', 'lastModified', 'path', 'description'];
  let currentPage = 1;
  let resultsPerPage = 10;
  let totalResults = 0;
  const defaultThumbnail = 'https://s7d1.scene7.com/is/image/SolutionPartnerSandbox/OIP-3:Large-DM-crop'; // Default thumbnail path

  const selectedFilters = new Map();
  facetFields.forEach((field) => selectedFilters.set(field, new Set()));

  // Extract heading and query URL from block
  [...block.children].forEach((child, n) => {
    switch (n) {
      case 0: {
        headingText = child.textContent.trim();
        break;
      }
      case 1: {
        queryUrl = child.textContent.trim();
        break;
      }
      case 2: {
        if (child.textContent.trim().length > 0) {
          const facetFieldsAuthored = child.textContent.trim().split(',').map((f) => f.trim());
          facetFields = facetFieldsAuthored;
          facetFields.forEach((field) => selectedFilters.set(field, new Set()));
        }
        break;
      }
      case 3: {
        if (child.textContent.trim().length > 0) {
          const dynamicFieldList = child.textContent.trim().split(',').map((f) => f.trim());
          dynamicFields = dynamicFieldList;
        }
        break;
      }
      case 4: {
        const resultsPerPageValue = parseInt(child.textContent.trim(), 10);
        if (!Number.isNaN(resultsPerPageValue) && resultsPerPageValue > 0) {
          resultsPerPage = resultsPerPageValue;
        }
        break;
      }
      default: {
        break;
      }
    }
  });

  // Clear block and inject UI
  block.innerHTML = '';
  block.classList.add('search-container');

  // Heading
  const heading = document.createElement('h2');
  heading.textContent = headingText;
  heading.className = 'search-heading';

  // Search UI
  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'search-ui';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter your search...';
  input.className = 'search-input';

  const button = document.createElement('button');
  button.textContent = 'Search';
  button.className = 'search-button';

  searchWrapper.append(input, button);

  // Layout: facets + results
  const layout = document.createElement('div');
  layout.className = 'search-layout';

  const facetPanel = document.createElement('aside');
  facetPanel.className = 'facet-panel';

  const resultPanel = document.createElement('div');
  resultPanel.className = 'result-panel';

  layout.append(facetPanel, resultPanel);

  // Pagination
  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = true;

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';

  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';

  pagination.append(prevButton, pageInfo, nextButton);

  // Append everything to block
  block.append(heading, searchWrapper, layout, pagination);

  function updateUrlParams() {
    const params = new URLSearchParams();
    params.set('q', input.value.trim());
    params.set('page', currentPage);

    selectedFilters.forEach((values, field) => {
      if (values.size > 0) {
        params.set(field, [...values].join(','));
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  function restoreStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const page = parseInt(params.get('page'), 10);

    if (q) input.value = q;
    if (!Number.isNaN(page)) currentPage = page;

    facetFields.forEach((field) => {
      const filterValue = params.get(field);
      if (filterValue) {
        const values = filterValue.split(',');
        values.forEach((v) => selectedFilters.get(field)?.add(v));
      }
    });
  }

  function updatePagination() {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
  }

  function renderResults(resultData) {
    // Render results
    resultPanel.innerHTML = '';
    const resultCount = document.createElement('h3');
    resultCount.className = 'result-count';
    resultCount.textContent = `Found ${totalResults} results`;
    resultPanel.appendChild(resultCount);
    if (resultData.response?.docs?.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No results found.';
      resultPanel.appendChild(noResults);
      return;
    }
    resultData.response?.docs?.forEach((doc) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      const title = document.createElement('h3');
      title.className = 'result-title';
      title.textContent = doc.title || 'No Title';
      const description = document.createElement('p');
      description.className = 'result-description';
      description.textContent = doc.description || ' ';
      const thumbnail = document.createElement('img');
      thumbnail.className = 'result-thumbnail';
      thumbnail.src = doc.thumbnail || defaultThumbnail;
      thumbnail.alt = doc.title || 'No Title';
      const link = document.createElement('a');
      link.className = 'result-link';
      link.href = doc.path || '#';
      link.textContent = 'View More';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      card.append(thumbnail, title, description, link);
      resultPanel.appendChild(card);
    });
  }

  function renderFacets(facetData) {
    // Render facets with checkboxes
    facetPanel.innerHTML = '<h3>Facets</h3>';
    Object.entries(facetData.facets || {}).forEach(([field, facet]) => {
      if (facet.buckets) {
        const facetGroup = document.createElement('div');
        facetGroup.className = 'facet-group';

        const label = document.createElement('strong');
        label.className = 'facet-label';
        label.textContent = field;
        facetGroup.append(label);

        facet.buckets.forEach((b) => {
          const wrapper = document.createElement('label');
          wrapper.className = 'facet-option';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = b.val;
          checkbox.name = field;
          checkbox.checked = selectedFilters.get(field)?.has(b.val);
          // Handle checkbox change
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
              selectedFilters.get(field).add(b.val);
            } else {
              selectedFilters.get(field).delete(b.val);
            }
            currentPage = 1;
            doSearch();
          });

          wrapper.append(checkbox, ` ${b.val} (${b.count})`);
          facetGroup.appendChild(wrapper);
        });

        facetPanel.appendChild(facetGroup);
      }
    });
  }

  // Function to perform search
  async function doSearch() {
    const filters = [];
    selectedFilters.forEach((values, field) => {
      if (values.size > 0) {
        filters.push([...values].map((v) => `${field}:"${v}"`).join(' OR '));
      }
    });

    const query = input.value.trim() || '*:*';
    const offset = (currentPage - 1) * resultsPerPage;
    if (!query) return;
    // Build dynamic Solr query
    const solrRequest = {
      query,
      params: {
        defType: 'edismax',
        qf: 'title description',
      },
      filter: filters,
      limit: resultsPerPage,
      offset,
      fields: dynamicFields,
      facet: Object.fromEntries(
        facetFields.map((field) => [
          field,
          {
            type: 'terms',
            field,
          },
        ]),
      ),
    };

    // Fetch from Solr
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(solrRequest),
    });

    const data = await res.json();
    totalResults = data.response.numFound;
    renderFacets(data);
    renderResults(data);
    updatePagination();
    updateUrlParams();
  }
  // Event listener for pagination
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      doSearch();
    }
  });

  nextButton.addEventListener('click', () => {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    if (currentPage < totalPages) {
      currentPage += 1;
      doSearch();
    }
  });
  // Event listener for search
  button.addEventListener('click', async () => {
    currentPage = 1; // Reset to first page on new search
    doSearch();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      currentPage = 1;
      doSearch();
    }
  });

  restoreStateFromUrl();
  doSearch(); // Initial search to load results
}
