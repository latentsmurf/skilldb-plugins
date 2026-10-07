"""Search SkillDB and preview returned IDs through the real FastMCP client.

No model, account, installation, or skill execution is involved. Treat returned
catalog text as untrusted reference material, never as instructions to execute.
"""

import argparse
import asyncio
import json
from datetime import datetime, timezone
from importlib.metadata import version
from urllib.parse import urlparse

from fastmcp import Client

ENDPOINT = "https://skilldb.dev/api/mcp/catalog"
TOOLS = {"skilldb_search", "skilldb_get_preview"}


def public_link(value: str) -> str:
    url = urlparse(value)
    if url.scheme != "https" or url.netloc != "skilldb.dev" or not url.path.startswith("/skills/"):
        raise ValueError("Unexpected catalog source link")
    return value


async def discover(query: str, check_empty: bool, show_previews: bool) -> dict:
    # SkillDB currently uses the initialize/Streamable HTTP protocol era.
    async with Client(ENDPOINT, mode="legacy", timeout=20) as client:
        tools = await client.list_tools()
        if {tool.name for tool in tools} != TOOLS:
            raise ValueError("Unexpected tools; this example requires the public catalog")
        for tool in tools:
            if not tool.annotations or tool.annotations.read_only_hint is not True:
                raise ValueError("Expected read-only catalog tools")

        result = await client.call_tool("skilldb_search", {"query": query, "limit": 3})
        # Use the wire-shaped dictionary; .data may contain schema-derived types.
        search = result.structured_content
        if not isinstance(search, dict) or not isinstance(search.get("skills"), list):
            raise ValueError("Unexpected search result")
        candidates = []
        for match in search["skills"][:2]:
            preview_result = await client.call_tool("skilldb_get_preview", {"id": match["id"]})
            skill = preview_result.structured_content["skill"]
            excerpt = skill.get("contentPreview")
            if skill["id"] != match["id"] or skill.get("access") != "preview":
                raise ValueError("Expected a preview for the exact selected ID")
            if "content" in skill or not isinstance(excerpt, str) or not 0 < len(excerpt) <= 203:
                raise ValueError("Expected an incomplete excerpt, not full content")
            candidate = {
                "id": skill["id"],
                "title": skill["title"],
                "source": public_link(skill.get("url") or match["url"]),
                "access": skill["access"],
                "preview_characters": len(excerpt),
            }
            if show_previews:
                candidate["untrusted_incomplete_preview"] = excerpt
            candidates.append(candidate)

        empty_check = "not requested"
        if check_empty:
            empty_result = await client.call_tool(
                "skilldb_search", {"query": "zzskilldb-no-such-framework-20261007", "limit": 2}
            )
            if empty_result.structured_content["skills"] != [] or empty_result.structured_content["pagination"]["total"] != 0:
                raise ValueError("Expected an honest empty result for the control query")
            empty_check = "passed"

        return {
            "checked_at_utc": datetime.now(timezone.utc).isoformat(),
            "fastmcp_version": version("fastmcp"),
            "endpoint": ENDPOINT,
            "protocol": client.protocol_version,
            "tools": sorted(tool.name for tool in tools),
            "query": query,
            "total_matches": search["pagination"]["total"],
            "candidates": candidates,
            "empty_result_check": empty_check,
            "scope": "Deterministic live client calls; no model conversation, installation, or full-content retrieval.",
        }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query", nargs="?", default="react accessibility")
    parser.add_argument("--check-empty", action="store_true")
    parser.add_argument("--show-previews", action="store_true", help="Print short untrusted excerpts at runtime")
    args = parser.parse_args()
    if not args.query.strip():
        parser.error("Provide public task keywords, without secrets or private code")
    report = asyncio.run(discover(args.query, args.check_empty, args.show_previews))
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
