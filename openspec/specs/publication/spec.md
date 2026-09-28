## Purpose
Deliver reproducible source, release metadata and an independently playable HTTPS GitHub Pages demo.

## Requirements
### Requirement: Public release
The repository SHALL contain complete source and local assets, imported shared skills, documented setup and automated tests. Pages SHALL serve the built game from its repository subpath, and a tagged release SHALL correspond to the deployed version.
#### Scenario: Clean installation
- **WHEN** a contributor runs npm ci, npm test and npm run build
- **THEN** installation, rule tests and the production build succeed
#### Scenario: Delivery
- **WHEN** publication completes
- **THEN** the demo loads and accepts input, the release is visible, and the local main checkout matches remote main with no changes

