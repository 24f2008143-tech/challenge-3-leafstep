<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/97838d53-e7b9-4dcd-93b8-f36f85f3da77

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Known Limitations

- **Single-User State Model**: Leafstep operates on a single-user local state architecture. State is read and written directly to a local JSON file (`state.json`), meaning concurrent multi-user environments are not supported. If multi-user support is required, the state logic should be migrated to a centralized database (such as Supabase, which has partial client setups prepared).
