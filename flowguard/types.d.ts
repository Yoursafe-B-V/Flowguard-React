export interface FlowguardInstance {
  submit: () => void | Promise<void>
  remove: () => void | Promise<void>
}

export interface FlowguardStyles {
  input?: {
    base?: Partial<CSSStyleDeclaration>,
    error?: Partial<CSSStyleDeclaration>,
    focused?: Partial<CSSStyleDeclaration>,
    touched?: Partial<CSSStyleDeclaration>,
    disabled?: Partial<CSSStyleDeclaration>,
  }
  price?: {
    base?: Partial<CSSStyleDeclaration>,
    title?: Partial<CSSStyleDeclaration>,
    value?: Partial<CSSStyleDeclaration>,
  }
}

/** What the checkout page receives. The server has already started the session. */
export interface FlowguardCheckout {
  sessionId: string
}

export interface FlowguardElementsConfig {
  sessionId: string
  cardNumber: { target: string; placeholder?: string }
  cvv: { target: string; placeholder?: string }
  cardholder: { target: string; placeholder?: string }
  expDate: { target: string; placeholder?: string }
  price: { target: string; placeholder?: string }
  styles?: FlowguardStyles
}

export interface FlowguardSdkError {
  errorCode?: string
  errorDescription?: string
}

export interface FlowguardErrorEventDetail {
  error?: FlowguardSdkError
}

export interface FlowguardConstructor {
  new (config: FlowguardElementsConfig): FlowguardInstance
}

declare global {
  interface Window {
    Flowguard?: FlowguardConstructor
  }
}

export {}
