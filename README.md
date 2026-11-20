# Flowguard React

React checkout that mounts Yoursafe Flowguard card fields on your own page. The buyer stays on your site. Card data stays in the Flowguard frames.

The product guides are on [Yoursafe integrations](https://integrations.yoursafe.com/en/flowguard/overview):

- [Getting Started](https://integrations.yoursafe.com/en/getting-started/flowguard) covers domain approval, the server session, and a test payment.
- [SDK](https://integrations.yoursafe.com/en/flowguard) is the reference for Elements, targets, and styles.
- [API](https://integrations.yoursafe.com/en/flowguard-api) is the reference for `POST /purchase/start` and `POST /subscription/start`.

## What the page receives

Your server starts the purchase or subscription and returns a session id. That is the only value this checkout needs:

```ts
{
  sessionId: string
}
```

`FlowguardCheckout` in `flowguard/types.d.ts` is that object. Pass it to `ExampleFlowguardForm`. The example ships with `YOUR_SESSION_ID_HERE` so you can see the shape before a real session exists. The browser does not create the session and does not hold the merchant signature key.

## Add the SDK

Load the Flowguard script before your application code. It has to be a deferred module so `flowguard:loaded` can fire.

```html
<script src="https://flowguard.yoursafe.com/js/flowguard.js" type="module" defer></script>
```

`localhost` can load the SDK without domain approval. Every other origin must be registered on the Flowguard website in the Control Center. `www.example.com` and `example.com` are different registrations.

## Mount the form

Copy `flowguard/` into your app and render `ExampleFlowguardForm`. The component places five empty elements on the page and tells Flowguard which one receives which field:

| Target | Field |
| --- | --- |
| `#card-number` | Card number |
| `#cvv` | CVV |
| `#cardholder` | Cardholder name |
| `#exp-date` | Expiry date |
| `#price` | Price |

Put `hostRef` on your `<form>`. On submit, call `submit()` from the render callback. The Pay button stays disabled until `status` is `ready`. `status` moves through `idle`, `initializing`, `mounting`, `ready`, and `error`. While the fields are mounting, `error` is `null`. If mounting fails, `error` is the message from the SDK.

`styles` is optional. The example sets the input font size. `placeholders` can set the hint text for each field. `debug` logs each status change.

`remove()` tears the fields down. `FlowguardElements` calls it when the component unmounts or when `sessionId` changes, then mounts a new instance.

## Files

- `Example.tsx` is a checkout form. It takes `{ sessionId }` and renders `FlowguardElements` inside a form.
- `flowguard/FlowguardElements.tsx` mounts the five fields into your elements, waits for `flowguard:ready`, and gives the form `submit` and `remove`.
- `flowguard/useFlowguard.ts` waits for the SDK script, constructs `window.Flowguard`, and keeps that instance for submit and remove.
- `flowguard/types.d.ts` describes `FlowguardCheckout`, the Elements config, style options, and the SDK object on `window`.
