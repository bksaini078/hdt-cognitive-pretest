# HDT Cognitive Pretest

Static, route-personalized web interface for the cognitive pretest of the Consent-First Human Digital Twin Marketplace expert questionnaire.

## Current status

The participant-information screen identifies the researcher, institution, and contact email before presenting the consent affirmation. Keep any separately required signed consent record outside this repository.

## Data behavior

- Questionnaire responses remain in the browser until the participant or researcher downloads the JSON response package.
- Every required answer must be completed before the participant continues. Use `OE` when a rating is outside the participant's expertise and `None` when a required comment has nothing to add.
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
