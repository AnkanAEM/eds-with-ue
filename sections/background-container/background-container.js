export default async function decorate(block) {
  console.log('decorate background-container block section', block);
  // Clear block content
  block.classList.add('background-container');
  // block.append(backgroundDiv, contentDiv);
}
