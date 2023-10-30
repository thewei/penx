import { Box } from '@fower/react'
import { Editor, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { useDebouncedCallback } from 'use-debounce'
import { NodeEditor } from '@penx/editor'
import { PenxEditor } from '@penx/editor-common'
import { isAstChange } from '@penx/editor-queries'
import { useNode, useNodes } from '@penx/hooks'
import { insertEmptyListItem, ListContentElement } from '@penx/list'
import { db } from '@penx/local-db'
import { store } from '@penx/store'

function listPlugin(editor: any) {
  editor.onClickBullet = async (element: ListContentElement) => {
    const node = await db.getNode(element.id)
    store.selectNode(node)
  }
  return editor
}

export function NodeContent() {
  const { nodes } = useNodes()
  const { node, nodeService } = useNode()

  const debouncedSaveNodes = useDebouncedCallback(async (value: any[]) => {
    // has title
    if (value[1]) {
      nodeService.savePage(node.raw, value[1], value[0])
    } else {
      nodeService.savePage(node.raw, value[0])
    }
  }, 500)

  function handleEnterKeyInTitle(editor: PenxEditor) {
    insertEmptyListItem(editor, { at: [0, 0] })

    ReactEditor.focus(editor)
    Transforms.select(editor, Editor.start(editor, [0]))
  }

  if (!node.id || !nodes.length) return null

  return (
    <Box relative>
      <Box mx-auto maxW-800>
        <NodeEditor
          plugins={[listPlugin]}
          content={nodeService.getEditorValue()}
          onChange={(value, editor) => {
            if (isAstChange(editor)) {
              debouncedSaveNodes(value)
            }
          }}
        />
      </Box>
    </Box>
  )
}
