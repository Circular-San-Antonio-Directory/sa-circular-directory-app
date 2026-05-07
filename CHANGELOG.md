# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3]
- Migrate the runMigration scripts to typecript

## [1.0.2]
- Fixed sell and donate action icons not appearing. The Airtable "Corresponding Action" values ("Sell my Items", "Drop Off") didn't match the keys in `CORRESPONDING_ACTION_TO_ACTION_NAME`, causing both rows to be silently skipped in `getActions()`.

## [1.0.0] 

## [1.0.1]
- Enforcing semantic versioning

---

[Unreleased]: https://github.com/gabrielkilly/sa-circular-directory-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/gabrielkilly/sa-circular-directory-app/releases/tag/v1.0.0
