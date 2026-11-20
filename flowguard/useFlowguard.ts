import { useCallback, useRef } from 'react'
import type { FlowguardElementsConfig, FlowguardInstance } from './types'

const FLOWGUARD_SCRIPT_TAG =
  '<script src="https://flowguard.yoursafe.com/js/flowguard.js" type="module" defer></script>'

function waitForFlowguardSdk(timeoutMs = 5000): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Flowguard SDK is only available in the browser.'),
    )
  }

  // The loaded event fires once, when the module is evaluated. If this runs
  // after that, window.Flowguard is already set and the event will not fire again.
  if (typeof window.Flowguard !== 'undefined') return Promise.resolve()

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup()
      reject(
        new Error(
          'Flowguard SDK not found on window after waiting. ' +
            'Make sure the Flowguard script tag is included before your app code and has loaded.' +
            `\n\n${FLOWGUARD_SCRIPT_TAG}`,
        ),
      )
    }, timeoutMs)

    const onLoaded = () => {
      cleanup()
      if (typeof window.Flowguard === 'undefined') {
        reject(
          new Error(
            'flowguard:loaded fired, but window.Flowguard is missing. ' +
              `Include the SDK as a module:\n\n${FLOWGUARD_SCRIPT_TAG}`,
          ),
        )
        return
      }
      resolve()
    }

    const cleanup = () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('flowguard:loaded', onLoaded)
    }

    window.addEventListener('flowguard:loaded', onLoaded, { once: true })
  })
}

async function initializeFlowguard(
  elementsConfig: FlowguardElementsConfig,
): Promise<FlowguardInstance> {
  if (typeof window === 'undefined') {
    throw new Error('Flowguard SDK is only available in the browser.')
  }

  await waitForFlowguardSdk()

  const instance = new window.Flowguard!(elementsConfig)
  return instance
}


export function useFlowguard() {
  const instanceRef = useRef<FlowguardInstance | null>(null)

  const init = useCallback(async (config: FlowguardElementsConfig) => {
    const instance = await initializeFlowguard(config)
    instanceRef.current = instance
    return instance
  }, [])

  const submit = useCallback(async () => {
    const instance = instanceRef.current
    if (!instance) {
      throw new Error('Flowguard has not been initialized yet.')
    }

    await Promise.resolve(instance.submit())
  }, [])

  const remove = useCallback(async () => {
    const instance = instanceRef.current
    if (!instance) return

    await Promise.resolve(instance.remove())
    instanceRef.current = null
  }, [])

  return {
    init,
    submit,
    remove,
  }
}

