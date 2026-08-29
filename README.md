# Tapsi payment transition pages

A mobile-first interactive prototype for the browser pages around Tapsi's IPG flow.

## Included states

- Redirect: token acquisition and transition to the payment gateway
- Capture: browser-initiated payment capture after the IPG callback
- Result: successful or unsuccessful payment callback
- Normal and slow timing states for redirect and capture
- Three visual candidates: A (minimal), B (journey), and C (instruction-first)

## Run locally

Serve the directory with any static web server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Demo controls

Use the **کنترل نمونه** button to switch between screens, visual candidates, results, and the slow state.

The current state is encoded in query parameters, so views can be linked directly:

```text
?screen=redirect&variant=a
?screen=redirect&variant=a&slow=1
?screen=capture&variant=b&slow=1
?screen=result&variant=c&result=success
?screen=result&variant=c&result=failure
```

## JavaScript controller

The page exposes a small controller for product integration:

```js
window.paymentTransition.setScreen("redirect");
window.paymentTransition.setScreen("capture");
window.paymentTransition.setScreen("result");
window.paymentTransition.setSlow(true);
window.paymentTransition.setResult("success");
window.paymentTransition.setVariant("a");
```

To automatically show slow messaging after a threshold:

```js
window.paymentTransition.startAutoSlow(7000);
```

Or use `?autoSlow=7000` in the URL.

The exit warning during capture is opt-in for the prototype through `?guard=1`. Modern mobile browsers may show their own generic warning text and do not guarantee that the warning will appear.

The final **بازگشت به تپسی** button uses a `tapsi://` URL supplied through the `returnUrl` query parameter. Other URL schemes are rejected. Without an allowed deep link, the prototype displays an explanatory message instead of attempting navigation.

## Deployment

The included GitHub Actions workflow publishes the static project to GitHub Pages whenever `main` is updated. It also requests Pages enablement for a new repository.
