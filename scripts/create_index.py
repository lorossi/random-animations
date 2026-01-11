"""This script creates the list of animations urls and embeds it into the index page."""

from glob import glob
from urllib import parse


def create_urls() -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    """Create urls for each animation."""
    folders = []
    skipped = []
    for folder in glob("animations/*"):
        name = folder.split("/")[-1].replace("-", " ").lower()
        parsed_folder = parse.quote(folder)

        base_list = skipped if "WIP" in folder else folders
        base_list.append((name, parsed_folder))

    return sorted(folders, key=lambda x: x[0]), sorted(skipped, key=lambda x: x[0])


def indent(n: int) -> str:
    """Return n tabs."""
    return "\t" * n


def base_indent(content: str) -> int:
    """Return the number of tabs before the first non-empty line."""
    return (len(content) - len(content.lstrip())) // 3


def embed_urls(urls: list[tuple[str, str]]) -> int:
    """Embed the urls in the page."""
    with open("homepage/index_template.html") as f:
        content = f.read()

    links_line = [f for f in content.split("\n") if "{{ LINKS }}" in f][0]
    base = base_indent(links_line)

    new_content = ""
    for name, url in urls:
        new_content += "\n"
        new_content += f'{indent(base + 1)}<a href="{url}">{name}</a>'
    new_content += f"\n{indent(base)}"

    content = content.replace("{{ LINKS }}", new_content)

    content = content.replace("{{ COUNT }}", str(len(urls)))

    with open("homepage/index.html", "w") as f:
        f.write(content)

    return len(content)


def main() -> None:
    """Script entry point."""
    urls, skipped = create_urls()
    print(f"Created {len(urls)} urls and skipped {len(skipped)} WIP animations")
    for name, _ in skipped:
        print(f"\t- skipped {name}")
    embedded = embed_urls(urls)
    print(f"Embedded {len(urls)} urls in {embedded} characters")


if __name__ == "__main__":
    main()
