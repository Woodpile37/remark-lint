/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module blockquote-indentation
 * @fileoverview
 *   Warn when block quotes are indented too much or too little.
 *
 *   Options: `number` or `'consistent'`, default: `'consistent'`.
 *
 *   `'consistent'` detects the first used indentation and will warn when
 *   other block quotes use a different indentation.
 *
 * @example {"name": "ok.md", "setting": 4}
 *
 *   >   Hello
 *
 *   Paragraph.
 *
 *   >   World
 *
 * @example {"name": "ok.md", "setting": 2}
 *
 *   > Hello
 *
 *   Paragraph.
 *
 *   > World
 *
 * @example {"name": "not-ok.md", "label": "input"}
 *
 *   >  Hello
 *
 *   Paragraph.
 *
 *   >   World
 *
 *   Paragraph.
 *
 *   > World
 *
 * @example {"name": "not-ok.md", "label": "output"}
 *
 *   5:5: Remove 1 space between block quote and content
 *   9:3: Add 1 space between block quote and content
 */

import {lintRule} from 'unified-lint-rule'
import plural from 'pluralize'
import {visit} from 'unist-util-visit'
import {pointStart} from 'unist-util-position'
import {generated} from 'unist-util-generated'

const remarkLintBlockquoteIndentation = lintRule(
  'remark-lint:blockquote-indentation',
  blockquoteIndentation
)

export default remarkLintBlockquoteIndentation

function blockquoteIndentation(tree, file, option) {
  let preferred = typeof option === 'number' ? option : null

  visit(tree, 'blockquote', (node) => {
    if (generated(node) || node.children.length === 0) {
      return
    }

    if (preferred) {
      const diff = preferred - check(node)

      if (diff !== 0) {
        const abs = Math.abs(diff)

        file.message(
          (diff > 0 ? 'Add' : 'Remove') +
            ' ' +
            abs +
            ' ' +
            plural('space', abs) +
            ' between block quote and content',
          pointStart(node.children[0])
        )
      }
    } else {
      preferred = check(node)
    }
  })
}

function check(node) {
  return pointStart(node.children[0]).column - pointStart(node).column
}
