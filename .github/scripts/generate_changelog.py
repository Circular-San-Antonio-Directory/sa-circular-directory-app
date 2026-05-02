#!/usr/bin/env python3
"""
Reads git log from env vars, calls local Ollama API to generate a
Keep-a-Changelog formatted entry, writes result to /tmp/changelog_entry.md.
"""

import os
import sys
import json
import requests
from datetime import date


OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"
OUTPUT_PATH = "/tmp/changelog_entry.md"


def main():
    current_tag = os.environ.get("CURRENT_TAG", "unknown")
    prev_tag = os.environ.get("PREV_TAG", "")
    git_log = os.environ.get("GIT_LOG", "").strip()
    today = date.today().isoformat()

    if not git_log:
        print("WARNING: No git log entries found. Writing minimal entry.")
        entry = f"## [{current_tag}] - {today}\n\nNo commits found for this release.\n\n"
        with open(OUTPUT_PATH, "w") as f:
            f.write(entry)
        return

    range_description = (
        f"from {prev_tag} to {current_tag}" if prev_tag else f"up to {current_tag} (first release)"
    )

    prompt = f"""You are a technical writer generating a CHANGELOG entry for the SA Circular Directory — a Next.js web app that helps users find circular economy businesses in San Antonio, TX.

Release: {current_tag} ({today})
Commit range: {range_description}

Raw git commits:
{git_log}

Instructions:
1. Group changes into Keep a Changelog sections (only include sections that have entries):
   - Added: new user-facing features
   - Changed: changes to existing behavior
   - Fixed: bug fixes
   - Removed: removed features
   - Security: security improvements
   - Infrastructure: deployment, CI, DB migrations, dependency updates, chores

2. Write clear, plain-English bullet points. Translate terse commit messages into readable descriptions.
   Example: "fix createDatabaseFromAirtableRecords script" → "Fixed a bug in the Airtable-to-database sync script that prevented records from being created"

3. Skip merge commits (starting with "Merge pull request" or "Merge branch") and WIP/in-progress commits.

4. Output ONLY the markdown entry. No preamble, no explanation. Start directly with the ## heading.

Output format:
## [{current_tag}] - {today}

### Added
- ...

### Fixed
- ...

### Infrastructure
- ...

Omit any section with no entries. End with a single blank line."""

    print(f"Calling Ollama ({MODEL}) for release {current_tag}...")

    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": False},
            timeout=300,
        )
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"ERROR: Ollama request failed: {e}", file=sys.stderr)
        sys.exit(1)

    data = response.json()
    entry = data.get("response", "").strip()

    if not entry:
        print("ERROR: Empty response from Ollama.", file=sys.stderr)
        sys.exit(1)

    if not entry.endswith("\n\n"):
        entry += "\n\n"

    with open(OUTPUT_PATH, "w") as f:
        f.write(entry)

    print(f"Entry written to {OUTPUT_PATH}")
    print("--- Preview ---")
    print(entry)


if __name__ == "__main__":
    main()
