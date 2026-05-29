# Attention Labs Web

## Launch check-in

The launch check-in interface lives at `/check-in`.

It is fully client-side so it works well on Azure Static Web Apps:

- Upload an RSVP CSV in the browser
- Search by guest name, email, company, title, notes, or RSVP status
- Mark guests as checked in
- Export the updated attendance CSV
- Persist the imported list and check-in state in browser local storage on that device

## Local run

```bash
npm run dev
```

Then open `http://localhost:3000/check-in`.

## Azure deploy

This repo is configured for static export via Next.js.

```bash
npm run build
```

Deploy the generated `out/` directory to Azure Static Web Apps or any static host.
