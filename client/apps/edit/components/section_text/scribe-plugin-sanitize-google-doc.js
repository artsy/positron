//
// A [Scribe](https://github.com/guardian/scribe) plugin cleaning html pasted
// from Google docs. Some code copied from The Guardian's sematic elements:
// https://github.com/guardian/scribe-plugin-formatter-html-ensure-semantic-elements
//
(function() {

  var scribePluginSanitizeGoogleDoc = function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('sanitize', formatter);
    }
  }

  // Recursively traverse the tree replacing styled spans with their more
  // appropriate bold, italics, etc. tags.
  var traverse = function(parentNode) {
    var el = parentNode.firstElementChild;
    var nextSibling;
    while (el) {
        nextSibling = el.nextElementSibling;
        traverse(el);
        if(el.nodeName == 'SPAN') {
          // TURN THESE INTO Bs, Is, EMs, or STRONGs
        }
        el = nextSibling;
    }
  }

  var formatter = function (html) {
    if (typeof html === 'string') {
        var node = document.createElement('div');
        node.innerHTML = html;
        traverse(node);
        return node.innerHTML;
    } else {
        traverse(html);
        return html
    }
  }

  // Export for CommonJS & window global. TODO: AMD
  if (typeof module != 'undefined') {
    module.exports = scribePluginSanitizeGoogleDoc;
  } else {
    window.scribePluginSanitizeGoogleDoc = scribePluginSanitizeGoogleDoc;
  }
})();