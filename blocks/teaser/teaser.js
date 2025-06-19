export default function decorate(block) {
  const [imgDiv, textDiv, ctaDiv] = [...block.children];
  // Get image
  const picture = imgDiv.querySelector('picture');
  const image = imgDiv.querySelector('img');
  const imageAlt = image?.alt || '';

  // Get text
  const text = textDiv ? textDiv.textContent.trim() : '';
  // Get CTA
  const ctaUrl = ctaDiv ? ctaDiv.querySelector('a.button').getAttribute('href').trim() : '';
  const ctaText = ctaDiv ? ctaDiv.querySelector('a.button').text.trim() : '';

  // Build Teaser
  const teaser = document.createElement('div');
  teaser.className = 'teaser-block';
  if (picture && image) {
    const bg = document.createElement('div');
    bg.className = 'teaser-bg';
    bg.appendChild(picture);
    // Set teaser height to image's natural height after image loads
    image.onload = () => {
      teaser.style.height = image.naturalHeight + 'px';
    };
    // If already loaded
    if (image.complete) {
      teaser.style.height = image.naturalHeight + 'px';
    }
    teaser.appendChild(bg);
  }

  const content = document.createElement('div');
  content.className = 'teaser-content';

  if (text) {
    const teaserText = document.createElement('div');
    teaserText.className = 'teaser-text';
    teaserText.textContent = text;
    content.appendChild(teaserText);
  }

  if (ctaUrl && ctaText) {
    const cta = document.createElement('a');
    cta.href = ctaUrl;
    cta.className = 'teaser-cta-btn';
    cta.textContent = ctaText;
    cta.setAttribute('role', 'button');
    content.appendChild(cta);
  }

  teaser.appendChild(content);

  block.textContent = '';
  block.appendChild(teaser);
}
