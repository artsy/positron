"use strict";
exports.__esModule = true;
var react_1 = require("react");
var draft_convert_1 = require("draft-convert");
var text_stripping_1 = require("../../../rich_text/utils/text_stripping");
var utils_1 = require("./utils");
/**
 * Helpers for draft-js Paragraph component data conversion
*/
exports.draftDefaultStyles = [
    'BOLD',
    'CODE',
    'ITALIC',
    'STRIKETHROUGH',
    'UNDERLINE'
];
/**
 * Convert HTML to Draft ContentState
 */
exports.convertHtmlToDraft = function (html, hasLinks, allowedStyles) {
    var cleanedHtml = text_stripping_1.stripGoogleStyles(html);
    return draft_convert_1.convertFromHTML({
        htmlToBlock: exports.htmlToBlock,
        htmlToEntity: hasLinks ? exports.htmlToEntity : undefined,
        // TODO: type currentStyle OrderedSet
        htmlToStyle: function (nodeName, _, currentStyle) {
            return exports.htmlToStyle(nodeName, currentStyle, allowedStyles);
        }
    })(cleanedHtml);
};
/**
 * Convert Draft ContentState to HTML
 */
exports.convertDraftToHtml = function (currentContent, allowedStyles, stripLinebreaks) {
    var styles = utils_1.styleNamesFromMap(allowedStyles);
    var html = draft_convert_1.convertToHTML({
        entityToHTML: exports.entityToHTML,
        styleToHTML: function (style) { return exports.styleToHTML(style, styles); },
        blockToHTML: exports.blockToHTML
    })(currentContent);
    if (stripLinebreaks) {
        return exports.stripParagraphLinebreaks(html);
    }
    else {
        return html;
    }
};
/**
 * convert Html elements to Draft blocks
 */
exports.htmlToBlock = function (nodeName, node) {
    if (['body', 'ul', 'ol', 'tr'].includes(nodeName)) {
        // Nested elements are empty, wrap their children instead
        return {};
    }
    else {
        // Return all elements as default block
        return {
            type: 'unstyled',
            element: 'div'
        };
    }
};
/**
 * convert Html links to Draft entities
 */
exports.htmlToEntity = function (nodeName, node, createEntity) {
    if (nodeName === 'a') {
        var data = { url: node.href };
        return createEntity('LINK', 'MUTABLE', data);
    }
};
/**
 * convert Html styles to Draft styles
 */
exports.htmlToStyle = function (nodeName, currentStyle, // TODO: type OrderedSet
allowedStyles) {
    var styleNodes = utils_1.styleNodesFromMap(allowedStyles);
    var styleNames = utils_1.styleNamesFromMap(allowedStyles);
    var isBlock = ['body', 'p', 'div'].includes(nodeName);
    var isAllowedNode = styleNodes.includes(nodeName.toUpperCase());
    if (isBlock || isAllowedNode) {
        return currentStyle;
    }
    else {
        // Remove draft default styles unless explicitly allowed
        var style_1 = currentStyle;
        exports.draftDefaultStyles.map(function (draftStyle) {
            var isAllowedStyle = styleNames.includes(draftStyle);
            if (!isAllowedStyle) {
                style_1 = style_1.remove(draftStyle);
            }
        });
        return style_1;
    }
};
/**
 * convert Draft styles to Html tags
 */
exports.styleToHTML = function (style, allowedStyles) {
    var isAllowed = allowedStyles.includes(style);
    var plainText = { start: '', end: '' };
    switch (style) {
        case 'BOLD':
            return isAllowed ? <b /> : plainText;
        case 'ITALIC':
            return isAllowed ? <i /> : plainText;
        default:
            return plainText;
    }
};
/**
 * convert Draft entities to Html links
 */
exports.entityToHTML = function (entity, text) {
    if (entity.type === 'LINK') {
        return <a href={entity.data.url}>{text}</a>;
    }
    return text;
};
/**
 * convert Draft blocks to Html elements
 */
exports.blockToHTML = function (block) {
    // TODO: Fix type switching from draft-convert to avoid weird if statement
    if (block.type === 'ordered-list-item') {
        return {
            start: '<p>',
            end: '</p>',
            nestStart: '',
            nestEnd: ''
        };
    }
    if (block.type === 'unordered-list-item') {
        return {
            start: '<p>',
            end: '</p>',
            nestStart: '',
            nestEnd: ''
        };
    }
    else {
        return {
            start: '<p>',
            end: '</p>'
        };
    }
};
/**
 * convert multiple paragraphs into one
 */
exports.stripParagraphLinebreaks = function (html) {
    return html.replace(/<\/p><p>/g, ' ');
};
