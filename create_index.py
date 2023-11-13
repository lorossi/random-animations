"""This script creates the list of animations urls and embeds it into the index page."""

from glob import glob


def create_urls() -> list[tuple[str, str]]:
    """Create urls for each animation."""
    return sorted(
        (
            (folder.split("/")[-1].replace("-", " ").lower(), folder)
            for folder in glob("animations/*")
        ),
        key=lambda x: x[0],
    )  # this is a one-liner, but at what cost?


def indent(n: int) -> str:
    """Return n tabs."""
    return "\t" * n


def base_indent(content: str) -> int:
    """Return the number of tabs before the first non-empty line."""
    return (len(content) - len(content.lstrip())) // 3


def embed_urls(urls: list[str]) -> None:
    """Embed the urls in the page."""
    with open("index_template.html") as f:
        content = f.read()

    links_line = [f for f in content.split("\n") if "{{ LINKS }}" in f][0]
    base = base_indent(links_line)

    new_content = ""
    for name, url in urls:
        new_content += "\n"
        new_content += f'{indent(base+1)}<a href="{url}">{name}</a>'
    new_content += f"\n{indent(base)}"

    content = content.replace("{{ LINKS }}", new_content)

    with open("index.html", "w") as f:
        f.write(content)


def main():
    """Script entry point."""
    urls = create_urls()
    embed_urls(urls)


if __name__ == "__main__":
    main()
