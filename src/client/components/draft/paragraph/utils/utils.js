"use strict";
exports.__esModule = true;
var lodash_1 = require("lodash");
var draft_js_1 = require("draft-js");
var immutable_1 = require("immutable");
var text_selection_1 = require("../../../rich_text/utils/text_selection");
/**
 * Helpers for draft-js Paragraph component setup
*/
/**
 * blockRenderMap determines how HTML blocks are rendered in
 * draft's Editor component. 'unstyled' is equivalent to <p>.
 *
 * Element is 'div' because draft nests <div> tags with text,
 * and <p> tags cannot have nested children.
*/
exports.blockRenderMap = immutable_1["default"].Map({
    'unstyled': {
        element: 'div'
    }
});
/**
 * Default allowedStyles for Paragraph component
 */
var paragraphStyleMap = [
    { label: 'B', name: 'BOLD' },
    { label: 'I', name: 'ITALIC' }
];
/**
 * Returns styleMap from nodeNames
 * Used to attach node-names to props.allowedStyles
 */
exports.styleMapFromNodes = function (allowedStyles) {
    if (allowedStyles === void 0) { allowedStyles = ['B', 'I']; }
    var styleMap = [];
    allowedStyles.map(function (style) {
        switch (style.toUpperCase()) {
            case 'B':
            case 'BOLD': {
                styleMap.push({ label: 'B', name: 'BOLD' });
                break;
            }
            case 'I':
            case 'ITALIC': {
                styleMap.push({ label: 'I', name: 'ITALIC' });
                break;
            }
        }
    });
    return styleMap;
};
/**
 * Returns the names of allowed styles
 * Used for key commands, TextNav, and draft-convert
 */
exports.styleNamesFromMap = function (styles) {
    if (styles === void 0) { styles = paragraphStyleMap; }
    return lodash_1.map(styles, 'name');
};
/**
 * Returns the nodeNames for allowed styles
 * Used for draft-convert
 */
exports.styleNodesFromMap = function (styles) {
    if (styles === void 0) { styles = paragraphStyleMap; }
    return lodash_1.map(styles, 'label');
};
/**
 * Extend keybindings to open link input
 */
exports.keyBindingFn = function (e) {
    if (draft_js_1.KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 75) {
        // command + k
        return 'link-prompt';
    }
    else {
        // Use draft or browser default handling
        return draft_js_1.getDefaultKeyBinding(e);
    }
};
/**
 * Prevents consecutive empty paragraphs
 */
exports.handleReturn = function (e, editorState) {
    var _a = text_selection_1.getSelectionDetails(editorState), anchorOffset = _a.anchorOffset, isFirstBlock = _a.isFirstBlock;
    if (isFirstBlock || anchorOffset) {
        // If first block, no chance of empty block before
        // If anchor offset, the block is not empty
        return 'not-handled';
    }
    else {
        // Return handled to avoid creating empty blocks
        e.preventDefault();
        return 'handled';
    }
};
/**
 * Merges a state created from pasted text into editorState
 */
exports.insertPastedState = function (pastedState, editorState) {
    var blockMap = pastedState.getCurrentContent().getBlockMap();
    // Merge blockMap from pasted text into existing content
    var modifiedContent = draft_js_1.Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap);
    // Create a new editorState from merged content
    return draft_js_1.EditorState.push(editorState, modifiedContent, 'insert-fragment');
};
