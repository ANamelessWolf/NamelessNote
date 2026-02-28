const ALLOWED_TAGS = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'UL',
  'OL',
  'LI',
  'A',
  'P',
  'DIV',
  'BR'
])

const isSafeHref = (href) => {
  if (!href) return false
  const value = href.trim().toLowerCase()
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('/') ||
    value.startsWith('#')
  )
}

const sanitizeNode = (node, doc) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.textContent || '')
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return doc.createDocumentFragment()
  }

  const tagName = node.tagName.toUpperCase()
  const fragment = doc.createDocumentFragment()

  if (!ALLOWED_TAGS.has(tagName)) {
    Array.from(node.childNodes).forEach((child) => {
      fragment.appendChild(sanitizeNode(child, doc))
    })
    return fragment
  }

  const cleanEl = doc.createElement(tagName.toLowerCase())

  if (tagName === 'A') {
    const href = node.getAttribute('href') || ''
    if (isSafeHref(href)) {
      cleanEl.setAttribute('href', href)
      cleanEl.setAttribute('rel', 'noopener noreferrer')
      cleanEl.setAttribute('target', '_blank')
    }
  }

  Array.from(node.childNodes).forEach((child) => {
    cleanEl.appendChild(sanitizeNode(child, doc))
  })

  return cleanEl
}

export const sanitizeRichText = (value = '') => {
  const doc = document.implementation.createHTMLDocument('')
  const root = doc.createElement('div')
  root.innerHTML = value

  const out = doc.createElement('div')
  Array.from(root.childNodes).forEach((child) => {
    out.appendChild(sanitizeNode(child, doc))
  })

  const hasFormattingTags = out.querySelector('*') !== null
  if (!hasFormattingTags) {
    return (out.textContent || '').trim()
  }

  return out.innerHTML.trim()
}
