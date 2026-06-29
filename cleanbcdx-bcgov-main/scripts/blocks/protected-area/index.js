import { registerBlockType } from '@wordpress/blocks'
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor'
import { PanelBody, TextControl, TextareaControl, ToggleControl, SelectControl, Button, __experimentalUnitControl as UnitControl } from '@wordpress/components'
import { Fragment, useEffect } from '@wordpress/element'
import { useSelect } from '@wordpress/data'
import { useEntityProp } from '@wordpress/core-data'

const BLOCK_NAME = 'bcgovcleanbc/protected-area'
const PASSWORD_META_KEY = '_cleanbcdx_protected_area_password_map'
const WIDTH_UNITS = [
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
  { value: 'em', label: 'em' },
  { value: 'rem', label: 'rem' },
  { value: 'vw', label: 'vw' },
]
const HEADING_LEVEL_OPTIONS = [
  { label: 'H1', value: 'h1' },
  { label: 'H2', value: 'h2' },
  { label: 'H3', value: 'h3' },
  { label: 'H4', value: 'h4' },
  { label: 'H5', value: 'h5' },
  { label: 'H6', value: 'h6' },
]

const createInstanceId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `protected-area-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const flattenBlocks = (blocks = [], flat = []) => {
  blocks.forEach((block) => {
    flat.push(block)
    flattenBlocks(block.innerBlocks || [], flat)
  })

  return flat
}

const parsePasswordMap = (value) => {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value)
    return parsed && 'object' === typeof parsed ? parsed : {}
  } catch {
    return {}
  }
}

registerBlockType(BLOCK_NAME, {
  edit: ({ attributes, setAttributes, clientId }) => {
    const {
      instanceId,
      promptMessage = 'Enter the password to view this content.',
      promptHeading = 'Protected content',
      promptHeadingLevel = 'h2',
      promptWidth = '',
      promptJustification = 'left',
      showBorder = true,
      allowPageUnlock = false,
    } = attributes

    const { postId, postType, duplicateInstanceCount } = useSelect((select) => {
      const editorStore = select('core/editor')
      const blockEditorStore = select('core/block-editor')
      const allBlocks = flattenBlocks(blockEditorStore.getBlocks())

      return {
        postId: editorStore.getCurrentPostId(),
        postType: editorStore.getCurrentPostType(),
        duplicateInstanceCount: instanceId
          ? allBlocks.filter((block) => BLOCK_NAME === block.name && instanceId === block.attributes.instanceId).length
          : 0,
      }
    }, [clientId, instanceId])

    const [meta = {}, setMeta] = useEntityProp('postType', postType || 'page', 'meta', postId)
    const passwordMap = parsePasswordMap(meta?.[PASSWORD_META_KEY])
    const passwordEntry = instanceId ? passwordMap[instanceId] || {} : {}
    const passwordDraft = passwordEntry.plain || ''
    const hasStoredPassword = Boolean(passwordEntry.hash)

    useEffect(() => {
      if (!instanceId) {
        setAttributes({ instanceId: createInstanceId() })
      }
    }, [instanceId])

    useEffect(() => {
      if (instanceId && duplicateInstanceCount > 1) {
        const nextInstanceId = createInstanceId()

        setAttributes({ instanceId: nextInstanceId })

        if (passwordEntry.hash || passwordEntry.plain) {
          setMeta({
            ...meta,
            [PASSWORD_META_KEY]: JSON.stringify({
              ...passwordMap,
              [nextInstanceId]: passwordEntry,
            }),
          })
        }
      }
    }, [duplicateInstanceCount, instanceId, meta, passwordEntry, passwordMap, setAttributes, setMeta])

    const updatePasswordEntry = (nextEntry) => {
      if (!instanceId) {
        return
      }

      const nextPasswordMap = { ...passwordMap }

      if (!nextEntry || (!nextEntry.hash && !nextEntry.plain)) {
        delete nextPasswordMap[instanceId]
      } else {
        nextPasswordMap[instanceId] = nextEntry
      }

      setMeta({
        ...meta,
        [PASSWORD_META_KEY]: JSON.stringify(nextPasswordMap),
      })
    }

    const handlePasswordChange = (value) => {
      if (!instanceId) {
        return
      }

      if (!value) {
        updatePasswordEntry(null)
        return
      }

      updatePasswordEntry({
        ...(passwordEntry.hash ? { hash: passwordEntry.hash } : {}),
        plain: value,
      })
    }

    let passwordStatus = 'No password is set yet. This block remains public on the front end until one is saved.'

    if (passwordEntry.plain) {
      passwordStatus = 'This password is saved for editors and will be used to unlock this block on the public site.'
    } else if (hasStoredPassword) {
      passwordStatus = 'This block already has a password hash saved from the previous version. Enter a new password here if you want it to display in clear text for editors.'
    }

    const blockProps = useBlockProps({
      className: 'cleanbcdx-protected-area-block',
      style: {
        outline: '1px dashed #8c8f94',
        outlineOffset: '0.5rem',
        marginBlock: '1rem',
      },
    })

    return (
      <Fragment>
        <InspectorControls>
          <PanelBody title="Protection Settings">
            <p>{passwordStatus}</p>
            <TextControl
              label="Content Password"
              type="text"
              value={passwordDraft}
              help="Save the password here. Clear the field or use the button below to remove protection."
              onChange={handlePasswordChange}
            />
            <ToggleControl
              label="Allow unlock from other protected areas on this page"
              checked={allowPageUnlock}
              help="When enabled, this block will also open after any other password-protected area on the same page is successfully unlocked."
              onChange={(value) => setAttributes({ allowPageUnlock: value })}
            />
            {hasStoredPassword && (
              <Button
                isDestructive
                variant="secondary"
                onClick={() => updatePasswordEntry(null)}
              >
                Remove password
              </Button>
            )}
          </PanelBody>

          <PanelBody title="Prompt Settings" initialOpen={false}>
            <TextControl
              label="Protected heading"
              value={promptHeading}
              onChange={(value) => setAttributes({ promptHeading: value })}
              placeholder="Protected content"
            />
            <SelectControl
              label="Heading level"
              value={promptHeadingLevel}
              help="Controls the semantic heading level used by the protected-area prompt."
              options={HEADING_LEVEL_OPTIONS}
              onChange={(value) => setAttributes({ promptHeadingLevel: value || 'h2' })}
            />
            <TextareaControl
              label="Prompt message"
              value={promptMessage}
              onChange={(value) => setAttributes({ promptMessage: value })}
            />
            <UnitControl
              label="Content width"
              value={promptWidth}
              units={WIDTH_UNITS}
              help="Applies a width constraint to the protected-area form only. Leave blank to use the default width."
              onChange={(value) => setAttributes({ promptWidth: value || '' })}
            />
            <SelectControl
              label="Justification"
              value={promptJustification}
              options={[
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ]}
              onChange={(value) => setAttributes({ promptJustification: value || 'left' })}
            />
            <ToggleControl
              label="Show border"
              checked={showBorder}
              help="Adds or removes the visible prompt border on the protected-area form."
              onChange={(value) => setAttributes({ showBorder: value })}
            />
          </PanelBody>
        </InspectorControls>

        <div { ...blockProps }>
          <div
            style={ {
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#50575e',
              marginBottom: '12px',
              backgroundColor: '#fff',
              border: '1px dotted #ccc',
            } }
          >
            <span
              className="dashicons dashicons-lock"
              aria-hidden="true"
              style={ {
                fontSize: '16px',
                width: '16px',
                height: '16px',
              } }
            />
            <span>
              Protected Area: visitors will only see blocks inside after entering the matching password.
            </span>
          </div>

          <InnerBlocks templateLock={ false } />
        </div>
      </Fragment>
    )
  },
  save: () => <InnerBlocks.Content />,
})
