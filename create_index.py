"""This script creates the list of animations urls and embeds it into the index page."""

from glob import glob


def create_urls() -> list[tuple[str, str]]:
    """Create urls for each animation."""
    folders = [folder for folder in glob("animations/*") if "template" not in folder]
    urls = []
    for folder in folders:
        if "template" in folder:
            continue

        name = folder.split("/")[-1].replace("-", " ").lower()
        urls.append((name, folder))

    return sorted(urls, key=lambda x: x[0])


def embed_urls(urls: list[str], container_class="animations-list") -> None:
    """Embed the urls in the page."""
    with open("index.html") as f:
        content = f.read()

    new_content = "<ul>"
    for name, url in urls:
        new_content += "\n"
        new_content += f'<li><a href="{url}">{name}</a></li>'
    new_content += "\n</ul>"

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
