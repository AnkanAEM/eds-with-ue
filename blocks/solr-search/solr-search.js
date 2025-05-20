import updateFilters, { updateUrlQuery, getUrlParameter } from './helper.js';

export default function decorate(block) {
  let headingText;
  let queryUrl;
  [...block.children].forEach((child, n) => {
    switch (n) {
      case 0:
        headingText = child.textContent.trim();
        console.log('headingText', headingText);
        break;
      case 1:
        queryUrl = child.textContent.trim();
        console.log('queryUrl', queryUrl);
        break;
      default:
        break;
    }
  });
  
}
