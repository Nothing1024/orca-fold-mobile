import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import {
  PRESSABLE_TAGS,
  readAttribute,
  type Read
} from '../mobile-web-shell/pressable-control-source-reader'

/**
 * The phone header and the embedded session sidebar both expose the directory actions. Their
 * controls carried no role and no name, so a screen reader could not find them. The name is
 * computed from the same state, so the two sites must agree rather than each invent wording.
 *
 * A spread reads as unknown rather than absent: a control whose handler or whose accessibility
 * props arrive through one is a control this scan cannot judge, so it fails both rules and says so,
 * instead of passing quietly or reading as an unnamed control.
 */
const HEADER = 'src/host-screen/host-screen-header.tsx'
const SIDEBAR_ACTIONS = ['src/host-screen/HostSidebarWorkspacesHeader.tsx']
const MOBILE_ROOT = join(import.meta.dirname, '..', '..')

/**
 * One entry per directory control that moved out of the embedded toolbar into the session sidebar.
 * Keyed by the handler it presses, which is what makes two elements the same control.
 */
const SHARED_CONTROLS = [
  '() => actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/accounts`)',
  '() => actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/tasks`)'
]

/** Controls that live only in the wide sidebar now, each with a role and a name. */
const SIDEBAR_ONLY_CONTROLS = [
  '() => state.setShowFilterModal(true)',
  '() => state.setShowSortPicker(true)',
  '() => state.setShowGroupPicker(true)',
  '() => state.setShowSearch((s) => !s)',
  'actions.openNewWorktreeModal',
  'actions.openFloatingWorkspace'
]

type Control = { file: string; line: number; press: Read; role: Read; label: Read }

function controlsIn(relativePath: string): Control[] {
  const source = ts.createSourceFile(
    relativePath,
    readFileSync(join(MOBILE_ROOT, relativePath), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const found: Control[] = []
  function visit(node: ts.Node): void {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const element = ts.isJsxElement(node) ? node.openingElement : node
      if (PRESSABLE_TAGS.has(element.tagName.getText())) {
        const press = readAttribute(element, 'onPress')
        // A Pressable with no handler is decoration; one whose handler is spread in is a control.
        if (!press.known || press.value !== '') {
          found.push({
            file: relativePath,
            line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
            press,
            role: readAttribute(element, 'accessibilityRole'),
            label: readAttribute(element, 'accessibilityLabel')
          })
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return found
}

function show(read: Read): string {
  if (!read.known) {
    return 'spread'
  }
  return read.value || 'none'
}

/** The phone header starts at the second return. Everything above it is the wide sidebar. */
function phoneHeaderLine(): number {
  const source = readFileSync(join(MOBILE_ROOT, HEADER), 'utf8')
  const first = source.indexOf('return (')
  const second = source.indexOf('return (', first + 1)
  return source.slice(0, second).split('\n').length
}

function describeControl(control: Control): string {
  return `${control.file}:${control.line} press=${show(control.press)} role=${show(control.role)} label=${show(
    control.label
  )}`
}

const HEADER_CONTROLS = controlsIn(HEADER).filter((control) => control.file === HEADER)
const SIDEBAR_CONTROLS = [
  ...SIDEBAR_ACTIONS.flatMap(controlsIn),
  ...controlsIn(HEADER).filter((control) => control.line < phoneHeaderLine())
]

function soleLabel(controls: Control[], press: string): string | null {
  const matches = controls.filter((control) => control.press.known && control.press.value === press)
  const labels = [
    ...new Set(
      matches
        .filter((control) => control.label.known && control.label.value !== '')
        .map((control) => control.label.value)
    )
  ]
  return labels.length === 1 ? labels[0] : null
}

describe('directory controls keep a role and the same name on the phone and in the sidebar', () => {
  it('finds each shared control once in the phone header and once in the sidebar', () => {
    expect(
      SHARED_CONTROLS.filter(
        (press) => soleLabel(HEADER_CONTROLS, press) !== soleLabel(SIDEBAR_CONTROLS, press)
      )
    ).toEqual([])
  })

  it('keeps the wide-sidebar-only controls named once', () => {
    expect(
      SIDEBAR_ONLY_CONTROLS.filter((press) => soleLabel(SIDEBAR_CONTROLS, press) === null)
    ).toEqual([])
  })

  it('gives every pressable control the button role', () => {
    expect(
      [...HEADER_CONTROLS, ...SIDEBAR_CONTROLS]
        .filter((control) => !control.role.known || control.role.value !== 'button')
        .map(describeControl)
    ).toEqual([])
  })

  it('names every pressable control', () => {
    expect(
      [...HEADER_CONTROLS, ...SIDEBAR_CONTROLS]
        .filter((control) => !control.label.known || control.label.value === '')
        .map(describeControl)
    ).toEqual([])
  })
})
