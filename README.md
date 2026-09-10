# HDT Cognitive Pretest

Static, route-personalized web interface for the cognitive pretest of the Consent-First Human Digital Twin Marketplace expert questionnaire.

## Current status

This public deployment is a configuration preview, not yet an approved participant instrument. The app intentionally blocks consent and questionnaire entry while institution-specific participant-information fields remain incomplete.

Before participant use, update `participantInformation` in `data.mjs` with approved values for:

- researcher name;
- institution and contact email;
- ethics approval reference or formal not-required determination;
- withdrawal and deletion procedure;
- storage location and authorized access roles;
- retention period and deletion method; and
- data-protection contact or complaint route.

Do not replace these fields with assumptions. Keep any institution-required signed consent record outside this repository.

## Data behavior

- Questionnaire responses remain in the browser until the participant or researcher downloads the JSON response package.
- The app has no response API, database, analytics, cookies, advertising, or third-party scripts or fonts.
- GitHub Pages serves the application and may process access metadata, including IP addresses, under [GitHub's Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
- Never commit response exports, signed consent records, recruitment records, or direct identifiers to this repository.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Validation

```bash
node --check app.mjs
node --check data.mjs
```

After configuring the participant-information fields, test every route and verify that downloaded JSON records `delivery_mode` as `public-github-pages`.

## Deployment

The workflow in `.github/workflows/pages.yml` validates and deploys the repository root to GitHub Pages after pushes to `main`. In the repository settings, set **Pages > Source** to **GitHub Actions** if it is not selected automatically.
