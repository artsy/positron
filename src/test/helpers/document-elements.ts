/**
 * Creates required DOM elements and attaches them to the document.body.
 * Enzyme tests should use this function in setup so that tests referencing
 * these DOM elements directly don't err.
 */
let root: HTMLElement

export function SimulateDOMElements() {
  root = document.createElement("div")

  const yoastSnippet = document.createElement("div")
  yoastSnippet.setAttribute("id", "yoast-snippet")
  root.appendChild(yoastSnippet)

  const yoastOutput = document.createElement("div")
  yoastOutput.setAttribute("id", "yoast-output")
  root.appendChild(yoastOutput)

  const canvas = document.createElement("canvas")
  canvas.setAttribute("id", "canvas")
  root.appendChild(canvas)

  document.body.appendChild(root)
  return root
}

/**
 * Detaches DOM elements from document.body. Use this when cleaning up
 * Enzyme tests that use `SimulateDOMElements`.
 */
export function RemoveSimulatedDOMElements() {
  if (root && document.body.contains(root)) {
    document.body.removeChild(root)
  }
}
