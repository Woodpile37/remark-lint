/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module code-block-style
 * @fileoverview
 *   Warn when code blocks do not adhere to a given style.
 *
 *   Options: `'consistent'`, `'fenced'`, or `'indented'`, default: `'consistent'`.
 *
 *   `'consistent'` detects the first used code block style and warns when
 *   subsequent code blocks uses different styles.
 *
 *   ## Fix
 *
 *   [`remark-stringify`](https://github.com/remarkjs/remark/tree/HEAD/packages/remark-stringify)
 *   formats code blocks using a fence if they have a language flag and
 *   indentation if not.
 *   Pass
 *   [`fences: true`](https://github.com/remarkjs/remark/tree/HEAD/packages/remark-stringify#optionsfences)
 *   to always use fences for code blocks.
 *
 *   See [Using remark to fix your Markdown](https://github.com/remarkjs/remark-lint#using-remark-to-fix-your-markdown)
 *   on how to automatically fix warnings for this rule.
 *
 * @example {"setting": "indented", "name": "ok.md"}
 *
 *       alpha();
 *
 *   Paragraph.
 *
 *       bravo();
 *
 * @example {"setting": "indented", "name": "not-ok.md", "label": "input"}
 *
 *   ```
 *   alpha();
 *   ```
 *
 *   Paragraph.
 *
 *   ```
 *   bravo();
 *   ```
 *
 * @example {"setting": "indented", "name": "not-ok.md", "label": "output"}
 *
 *   1:1-3:4: Code blocks should be indented
 *   7:1-9:4: Code blocks should be indented
 *
 * @example {"setting": "fenced", "name": "ok.md"}
 *
 *   ```
 *   alpha();
 *   ```
 *
 *   Paragraph.
 *
 *   ```
 *   bravo();
 *   ```
 *
 * @example {"setting": "fenced", "name": "not-ok-fenced.md", "label": "input"}
 *
 *       alpha();
 *
 *   Paragraph.
 *
 *       bravo();
 *
 * @example {"setting": "fenced", "name": "not-ok-fenced.md", "label": "output"}
 *
 *   1:1-1:13: Code blocks should be fenced
 *   5:1-5:13: Code blocks should be fenced
 *
 * @example {"name": "not-ok-consistent.md", "label": "input"}
 *
 *       alpha();
 *
 *   Paragraph.
 *
 *   ```
 *   bravo();
 *   ```
 *
 * @example {"name": "not-ok-consistent.md", "label": "output"}
 *
 *   5:1-7:4: Code blocks should be indented
 *
 * @example {"setting": "💩", "name": "not-ok-incorrect.md", "label": "output", "positionless": true}
 *
 *   1:1: Incorrect code block style `💩`: use either `'consistent'`, `'fenced'`, or `'indented'`
 */

import {lintRule} from 'unified-lint-rule'
import {visit} from 'unist-util-visit'
import {pointStart, pointEnd} from 'unist-util-position'
import {generated} from 'unist-util-generated'

const styles = {null: true, fenced: true, indented: true}

const remarkLintCodeBlockStyle = lintRule(
  'remark-lint:code-block-style',
  codeBlockStyle
)

export default remarkLintCodeBlockStyle

function codeBlockStyle(tree, file, option) {
  const value = String(file)
  let preferred =
    typeof option === 'string' && option !== 'consistent' ? option : null

  if (styles[preferred] !== true) {
    file.fail(
      'Incorrect code block style `' +
        preferred +
        "`: use either `'consistent'`, `'fenced'`, or `'indented'`"
    )
  }

  visit(tree, 'code', (node) => {
    if (generated(node)) {
      return
    }

    const initial = pointStart(node).offset
    const final = pointEnd(node).offset

    const current =
      node.lang || /^\s*([~`])\1{2,}/.test(value.slice(initial, final))
        ? 'fenced'
        : 'indented'

    if (preferred) {
      if (preferred !== current) {
        file.message('Code blocks should be ' + preferred, node)
      }
    } else {
      preferred = current
    }
  })
}
