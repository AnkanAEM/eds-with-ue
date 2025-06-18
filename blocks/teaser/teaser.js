export default function decorate(block) {
  const [imgDiv, textDiv, ctaUrlDiv, ctaTextDiv] = [...block.children];

  // Get image
  const picture = imgDiv.querySelector('picture');
  const imageAlt = imgDiv.querySelector('img')?.alt || '';

  // Get text
  const text = textDiv ? textDiv.innerHTML : '';

  // Get CTA
  const ctaUrl = ctaUrlDiv ? ctaUrlDiv.textContent.trim() : '';
  const ctaText = ctaTextDiv ? ctaTextDiv.textContent.trim() : '';

  // Build Teaser
  const teaser = document.createElement('div');
  teaser.className = 'teaser-block';
  if (picture) {
    const bg = document.createElement('div');
    bg.className = 'teaser-bg';
    bg.appendChild(picture);
    bg.setAttribute('aria-label', imageAlt);
    teaser.appendChild(bg);
  }

  const content = document.createElement('div');
  content.className = 'teaser-content';
  content.innerHTML = `<div class="teaser-text">${text}</div>`;

  if (ctaUrl && ctaText) {
    const cta = document.createElement('a');
    cta.href = ctaUrl;
    cta.className = 'teaser-cta';
    cta.textContent = ctaText;
    content.appendChild(cta);
  }

  teaser.appendChild(content);

  block.textContent = '';
  block.appendChild(teaser);
}
