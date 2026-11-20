# Flowguard React

React checkout that mounts Yoursafe Flowguard card fields from a session id.

Load the SDK before the app:

```html
<script src="https://flowguard.yoursafe.com/js/flowguard.js" type="module" defer></script>
```

The page receives one value:

```ts
{
  sessionId: string
}
```

`sessionId` is the id returned by `POST /purchase/start` or `POST /subscription/start`. Pass it to `ExampleFlowguardForm`.

Copy `flowguard/` into the app and render `ExampleFlowguardForm` from `Example.tsx`.

`localhost` can load the SDK without domain approval. Register every other origin that will load it.
