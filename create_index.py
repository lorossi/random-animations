"""This script creates the list of animations urls and embeds it into the index page."""

from glob import glob


def create_urls(
    base_url="https://lorossi.github.com/random-animations/",
) -> list[tuple[str, str]]:
    """Create urls for each animation."""
    folders = [f for f in glob("animations/*") if "template" not in f]
    urls = []
    for f in folders:
        if "template" in f:
            continue

        urls.append((f.split("/")[-1], base_url + f))
    return urls


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

    # print(content[container_start + len(container_str) : container_end])
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
