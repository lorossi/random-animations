"""This script checks for titles and description in all the files called index.html."""

import re
import sys
from glob import glob


def format_title(title: str) -> str:
    """Format the title to be comparable."""
    clean = title.strip().lower()
    return re.sub(r"\s+|-|_|\d+", "", clean)


def get_folder(file: str) -> str:
    """Get the folder name of the file."""
    return format_title(file.split("/")[-2])


def get_title(content: str) -> str:
    """Get the title of the page."""
    r = re.search(r"<title>(.*?)</title>", content)
    if r is None:
        return ""
    return format_title(r.group(1))


def get_description(content: str) -> str:
    """Get the description of the page."""
    r = re.search(r'meta name="description" content="(.*?)"', content)
    if r is None:
        return ""
    return format_title(r.group(1))


def main() -> None:
    """Check the titles and descriptions of all the files."""
    something_found = False
    for path in glob("animations/**/index.html"):
        with open(path) as f:
            content = f.read()

        folder = get_folder(path)
        title = get_title(content)
        description = get_description(content)

        if title == "TEMPLATE":
            print(f"{path}: Title not changed")
            something_found = True
        elif title != folder:
            print(
                f"{path}: Title not consistent with folder name ({folder} vs {title})"
            )
            something_found = True

        if description == "TEMPLATE":
            print(f"{path}: Description not changed")
            something_found = True
        elif description != folder:
            print(
                f"{path}: Description not consistent with folder name "
                f"({folder} vs {description})"
            )
            something_found = True

    if something_found:
        sys.exit(1)
    else:
        print("All file titles and description are consistent")


if __name__ == "__main__":
    main()
