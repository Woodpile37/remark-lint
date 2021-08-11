/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module checkbox-content-indent
 * @fileoverview
 *   Warn when list item checkboxes are followed by too much whitespace.
 *
 * @example {"name": "ok.md", "gfm": true}
 *
 *   - [ ] List item
 *   +  [x] List Item
 *   *   [X] List item
 *   -    [ ] List item
 *
 * @example {"name": "not-ok.md", "label": "input", "gfm": true}
 *
 *   - [ ] List item
 *   + [x]  List item
 *   * [X]   List item
 *   - [ ]    List item
 *
 * @example {"name": "not-ok.md", "label": "output", "gfm": true}
 *
 *   2:7-2:8: Checkboxes should be followed by a single character
 *   3:7-3:9: Checkboxes should be followed by a single character
 *   4:7-4:10: Checkboxes should be followed by a single character
 */

import {lintRule} from 'unified-lint-rule'
import {location} from 'vfile-location'
import {visit} from 'unist-util-visit'
import {pointStart, pointEnd} from 'unist-util-position'
import {generated} from 'unist-util-generated'

const remarkLintCheckboxContentIndent = lintRule(
  'remark-lint:checkbox-content-indent',
  (tree, file) => {
    const value = String(file)
    const loc = location(file)

    visit(tree, 'listItem', (node) => {
      // Exit early for items without checkbox.
      if (typeof node.checked !== 'boolean' || generated(node)) {
        return
      }

      // A list item cannot be checked and empty, according to GFM, but
      // theoretically it makes sense to get the end if that were possible.
      const point =
        /* c8 ignore next 2 */
        node.children.length === 0
          ? pointEnd(node)
          : pointStart(node.children[0])

      // Assume we start with a checkbox, because well, `checked` is set.
      const match = /\[([\t xX])]/.exec(
        value.slice(point.offset - 4, point.offset + 1)
      )

      // Failsafe to make sure we don‘t crash if there actually isn’t a checkbox.
      /* c8 ignore next */
      if (!match) return

      // Move past checkbox.
      const initial = point.offset
      let final = initial

      while (/[\t ]/.test(value.charAt(final))) final++

      if (final - initial > 0) {
        file.message('Checkboxes should be followed by a single character', {
          start: loc.toPoint(initial),
          end: loc.toPoint(final)
        })
      }
    })
  }
)

export default remarkLintCheckboxContentIndent
