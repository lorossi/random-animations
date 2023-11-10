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


def spacing(n: int) -> str:
    """Return n tabs."""
    return "\t" * n


def embed_urls(urls: list[str], container_class="animations-list") -> None:
    """Embed the urls in the page."""
    with open("index.html") as f:
        content = f.read()

    new_content = f"\n{spacing(4)}<ul>"
    for name, url in urls:
        new_content += "\n"
        new_content += f'{spacing(5)}<li><a href="{url}">{name}</a></li>'
    new_content += f"\n{spacing(4)}</ul>\n{spacing(3)}"

    container_str = f'<div class="{container_class}">'
    container_start = content.find(container_str)
    container_end = content.find("</div>")

    content = (
        content[: container_start + len(container_str)]
        + new_content
        + content[container_end:]
    )

    with open("index.html", "w") as f:
        f.write(content)


def main():
    """Script entry point."""
    urls = create_urls()
    embed_urls(urls)


if __name__ == "__main__":
    main()
