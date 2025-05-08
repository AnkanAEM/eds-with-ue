export function updateUrlQuery(key, value) {
  if ('URLSearchParams' in window) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    history.pushState(null, '', url);
  }
}

export function getUrlParameter(key) {
  const params = new URL(window.location).searchParams;
  return params.get(key) !== '' && params.get(key) !== undefined ? params.get(key) : null;
}

export default function updateFilters(filters, facetCategory, value, isChecked) {
  if (isChecked) {
    if (filters[facetCategory] !== null && filters[facetCategory] !== undefined && filters[facetCategory] !== '') {
      filters[facetCategory] += `,${value}`;
    } else {
      filters[facetCategory] = value;
    }
  } else {
    filters[facetCategory] = filters[facetCategory].split(',').filter((el) => el !== value).join(',');
  }
}
