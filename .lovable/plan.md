

## Fix: Vercel SPA Routing Issue

The problem is that Vercel doesn't know how to handle client-side routes. When you refresh on a route like `/tools`, Vercel looks for a file at that path, finds nothing, and returns "Not Found." The fix is a `vercel.json` config that rewrites all requests to `index.html`.

### Changes

**Create `vercel.json`** in the project root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

That's it — one file. After deploying with this config, all routes will be handled by React Router.

