import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useFlowguard } from './useFlowguard'
import type {
  FlowguardElementsConfig,
  FlowguardErrorEventDetail,
  FlowguardStyles,
} from './types'

type FlowguardElementsStatus =
  | 'idle'
  | 'initializing'
  | 'mounting'
  | 'ready'
  | 'error'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function flowguardErrorMessage(event: Event, targetList: string): string {
  const detail = event instanceof CustomEvent ? event.detail : undefined
  const error =
    detail && typeof detail === 'object' && 'error' in detail
      ? (detail as FlowguardErrorEventDetail).error
      : undefined
  const description =
    typeof error?.errorDescription === 'string' ? error.errorDescription : null
  const code = typeof error?.errorCode === 'string' ? error.errorCode : null

  if (code && description) return `${code}: ${description}`
  if (description) return description
  if (code) return code

  return `Flowguard reported an error while mounting elements for targets: ${targetList}.`
}

async function waitForFlowguardReady(
  selectors: string[],
  signal?: AbortSignal,
  timeoutMs = 5000,
): Promise<void> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  await new Promise<void>((resolve, reject) => {
    const targetList = selectors.join(', ')

    const abortHandler = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }

    const readyHandler = () => {
      cleanup()
      resolve()
    }

    const errorHandler = (event: Event) => {
      cleanup()
      reject(new Error(flowguardErrorMessage(event, targetList)))
    }

    const timeoutId = window.setTimeout(() => {
      cleanup()
      reject(
        new Error(
          `Flowguard did not emit flowguard:ready within ${timeoutMs}ms for targets: ${targetList}.`,
        ),
      )
    }, timeoutMs)

    const cleanup = () => {
      window.clearTimeout(timeoutId)
      signal?.removeEventListener('abort', abortHandler)
      window.removeEventListener('flowguard:ready', readyHandler as EventListener)
      window.removeEventListener('flowguard:error', errorHandler as EventListener)
    }

    signal?.addEventListener('abort', abortHandler, { once: true })
    window.addEventListener('flowguard:ready', readyHandler as EventListener, {
      once: true,
    })
    window.addEventListener('flowguard:error', errorHandler as EventListener, {
      once: true,
    })
  })
}

export interface FlowguardElementsProps {
  sessionId: string
  cardNumberTarget: string
  cvvTarget: string
  cardholderTarget: string
  expDateTarget: string
  priceTarget: string
  placeholders?: {
    cardNumber?: string
    cvv?: string
    cardholder?: string
    expDate?: string
    price?: string
  }
  styles?: FlowguardStyles
  debug?: boolean
  children: (controls: {
    hostRef: React.RefObject<HTMLElement | null>
    status: FlowguardElementsStatus
    error: string | null
    submit: () => Promise<void>
    remove: () => Promise<void>
  }) => ReactNode
}

export function FlowguardElements({
  sessionId,
  cardNumberTarget,
  cvvTarget,
  cardholderTarget,
  expDateTarget,
  priceTarget,
  placeholders,
  styles,
  debug,
  children,
}: FlowguardElementsProps) {
  const { init, submit, remove } = useFlowguard()
  const hostRef = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<FlowguardElementsStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!hostRef.current) {
      return
    }

    let cancelled = false
    const abortController = new AbortController()

    const config: FlowguardElementsConfig = {
      sessionId,
      cardNumber: {
        target: cardNumberTarget,
        placeholder: placeholders?.cardNumber,
      },
      cvv: { target: cvvTarget, placeholder: placeholders?.cvv },
      cardholder: {
        target: cardholderTarget,
        placeholder: placeholders?.cardholder,
      },
      expDate: { target: expDateTarget, placeholder: placeholders?.expDate },
      price: { target: priceTarget, placeholder: placeholders?.price },
      styles,
    }

    async function setup() {
      setStatus('initializing')
      setError(null)
      if (debug) {
        // eslint-disable-next-line no-console
        console.log('[FlowguardElements] status=initializing', { sessionId })
      }

      try {
        // Clean up any previous instance before reinitializing
        await remove()
        const readyPromise = waitForFlowguardReady(
          [
            cardNumberTarget,
            cvvTarget,
            cardholderTarget,
            expDateTarget,
            priceTarget,
          ],
          abortController.signal,
        )
        await init(config)
        if (cancelled) return
        setStatus('mounting')
        if (debug) {
          // eslint-disable-next-line no-console
          console.log('[FlowguardElements] status=mounting', { sessionId })
        }

        await readyPromise
        if (cancelled) return

        setStatus('ready')
        if (debug) {
          // eslint-disable-next-line no-console
          console.log('[FlowguardElements] status=ready', { sessionId })
        }
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        const message =
          err instanceof Error ? err.message : 'Unknown Flowguard error'
        setError(message)
        if (debug) {
          // eslint-disable-next-line no-console
          console.log('[FlowguardElements] status=error', {
            sessionId,
            error: message,
          })
        }
      }
    }

    void setup()

    return () => {
      cancelled = true
      abortController.abort()
      void remove()
    }
  }, [
    hostRef.current,
    sessionId,
    cardNumberTarget,
    cvvTarget,
    cardholderTarget,
    expDateTarget,
    priceTarget,
    placeholders,
    styles,
    debug,
    init,
    remove,
  ])

  return (
    <>
      {children({
        hostRef,
        status,
        error,
        submit,
        remove,
      })}
    </>
  )
}

