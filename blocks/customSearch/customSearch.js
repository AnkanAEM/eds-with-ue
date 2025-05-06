export default function decorate(block) {
    let headingText, queryUrl;
    const facetProperties = ["customTags"];
    const facetsWithCount = {};
    [...block.children].forEach((child, n) => {
        switch (n) {
            case 0:
                headingText = child.textContent.trim();
                break;
            case 1:
                queryUrl = child.textContent.trim();
                break;
            default:
                break;
        }
    })

    initSearch();

    async function initSearch() {
        queryUrl = window.location.protocol + "//" + window.location.host + queryUrl;
        let allIndexes = await fetchIndexes(queryUrl);
        // createFacets(allIndexes);
        buildSearch(headingText, block);

        //Fetch all the child pages
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

        function buildSearch(headingText, block) {
            const container = document.createElement('div');
            container.className = 'search-container';

            // Create heading element
            const heading = document.createElement('h2');
            heading.className = 'search-heading';
            heading.textContent = headingText || 'Search';

            // Create search input wrapper
            const searchInputWrapper = document.createElement('div');
            searchInputWrapper.className = 'search-input-wrapper';

            // Create search input
            const searchInput = document.createElement('input');
            searchInput.type = 'search';
            searchInput.className = 'search-input';
            searchInput.placeholder = 'Search...';
            searchInput.setAttribute('aria-label', 'Search');

            // Create search button
            const searchButton = document.createElement('button');
            searchButton.className = 'search-button';
            searchButton.textContent = 'Search';

            searchInputWrapper.appendChild(searchInput);
            searchInputWrapper.appendChild(searchButton)

            // Create results list
            const resultsDiv = document.createElement('ul');
            resultsDiv.className = 'search-results';

            // Append elements to container
            container.appendChild(heading);
            container.appendChild(searchInputWrapper);
            container.appendChild(resultsDiv);

            block.textContent = '';
            block.append(container);

            // Handle search
            const handleSearch = () => {
                const searchTerm = searchInput.value.trim().toLowerCase();

                if (searchTerm.length >= 1) {
                    filterResults(searchTerm, null , resultsDiv); // Your filtering logic
                } else {
                    resultsDiv.innerHTML = '';
                }
            };

            // Add event listeners
            // searchInput.addEventListener('input', handleSearch);
            searchButton.addEventListener('click', handleSearch);
        }

        function filterResults(searchTerm, selectedFacets, resultsDiv) {
            let finalResults = new Set();
            let searchTermsArray = searchTerm.split(" ");
            console.log({ searchTermsArray });
            allIndexes.forEach(item => {
                searchTermsArray.forEach(term => {
                    if(item["description"] !=null && item["description"] != '' && item["description"].toLowerCase().includes(term)  || item["title"]!=null && item["title"]!='' && item["title"].toLowerCase().includes(term)){
                        finalResults.add(item);
                    }
                })
            })
            console.log(finalResults);
            resultsDiv.innerHTML = "";
            createFacets(finalResults);
            let facetsMarkup = buildFacetsMarkup(facetsWithCount);

            // Create wrapper for layout
            const layoutWrapper = document.createElement('div');
            layoutWrapper.className = 'search-layout';
            layoutWrapper.style.display = 'flex';
            layoutWrapper.style.gap = '2rem';

            // Create empty facet container (left side)
            const facetContainer = document.createElement('div');
            facetContainer.className = 'facet-column';
            facetContainer.style.flex = '0 0 250px'; // Fixed width
            facetContainer.appendChild(facetsMarkup)

            // Create results container (right side)
            const resultContainer = document.createElement('div');
            resultContainer.className = 'results-column';
            resultContainer.style.flex = '1';

            // Append search results
            finalResults.forEach(item => {
                const card = document.createElement('div');
                card.className = 'search-result';

                const title = document.createElement('h3');
                const link = document.createElement('a');
                link.href = item.path;
                link.textContent = item.title;
                title.appendChild(link);

                const description = document.createElement('p');
                description.textContent = item.description || 'No description available.';

                const image = document.createElement('img');
                image.src = item.thumbnail;
                image.alt = item.title;

                card.appendChild(image);
                card.appendChild(title);
                card.appendChild(description);

                resultContainer.appendChild(card);
            });

            // Add both columns to layout wrapper
            layoutWrapper.appendChild(facetContainer);
            layoutWrapper.appendChild(resultContainer);

            // Inject into the resultsDiv
            resultsDiv.innerHTML = ''; // Clear any existing content
            resultsDiv.appendChild(layoutWrapper);
        }

        function createFacets(results) {
            facetProperties.forEach(property => {
                let facetValues = {};
                results.forEach(currIndex => {
                    if (currIndex.hasOwnProperty(property)) {
                        if (currIndex[property] != ""); {
                            if (currIndex[property] != "") {
                                if (facetValues.hasOwnProperty(currIndex[property])) {
                                    facetValues[currIndex[property]] = facetValues[currIndex[property]] + 1;
                                } else {
                                    facetValues[currIndex[property]] = 1;
                                }
                            }
                        }
                    }
                })
                facetsWithCount[property] = facetValues;
            })
            console.log(facetsWithCount);
        }

        function buildFacetsMarkup(facetData) {
            let emptyFlag = true;
            const facetContainer = document.createElement('div');
            facetContainer.className = 'facet-container';
            debugger;
            Object.entries(facetData).forEach(([facetCategory, facets]) => {
                const fieldset = document.createElement('fieldset');
                fieldset.className = 'facet-group';

                const legend = document.createElement('legend');
                legend.textContent = facetCategory;
                fieldset.appendChild(legend);

                Object.entries(facets).forEach(([value, count]) => {
                    const label = document.createElement('label');
                    label.className = 'facet-item';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = facetCategory;
                    checkbox.value = value;

                    // Event listener for now
                    checkbox.addEventListener('change', (e) => {
                        const isChecked = e.target.checked;
                        console.log(`[Facet Changed] ${facetCategory} -> ${value} = ${isChecked}`);
                    });

                    const text = document.createElement('span');
                    text.textContent = ` ${value} (${count})`;

                    label.appendChild(checkbox);
                    label.appendChild(text);
                    fieldset.appendChild(label);
                });

                Array.from(fieldset.children).forEach(el => {
                    if(el.tagName == "LABEL"){
                        emptyFlag = false;
                        
                    }
                });
                !emptyFlag ? facetContainer.appendChild(fieldset) : '';

            });

            return facetContainer;
        }
          
    }

}
