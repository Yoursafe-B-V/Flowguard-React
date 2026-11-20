import type React from 'react'
import { FlowguardElements } from './flowguard/FlowguardElements'
import type { FlowguardCheckout, FlowguardStyles } from './flowguard/types'

const styles: FlowguardStyles = {
  input: {
    base: {
      fontSize: '16px',
    },
  },
}

export const checkout: FlowguardCheckout = {
  sessionId: 'YOUR_SESSION_ID_HERE',
}

export function ExampleFlowguardForm({ sessionId = checkout.sessionId }: FlowguardCheckout) {
  return (
    <FlowguardElements
      sessionId={sessionId}
      cardNumberTarget="#card-number"
      cvvTarget="#cvv"
      cardholderTarget="#cardholder"
      expDateTarget="#exp-date"
      priceTarget="#price"
      styles={styles}
      debug
    >
      {({ hostRef, status, error, submit }) => (
        <form
          ref={hostRef as React.RefObject<HTMLFormElement>}
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <div id="card-number" />
          <div id="cvv" />
          <div id="cardholder" />
          <div id="exp-date" />
          <div id="price" />

          <button type="submit" disabled={status !== 'ready'}>
            Pay
          </button>

          {error && <p>{error}</p>}
        </form>
      )}
    </FlowguardElements>
  )
}
