"""This script checks for titles and description in all the files called index.html."""

import re
from glob import glob


def check_page_title(title: str, folder: str) -> bool:
    """Check if the page title is consistent with the folder name."""
    clean_folder = folder.split("/")[-1].replace("-", " ").lower()
    clean_title = title.replace("-", " ").lower()
    return clean_folder == clean_title


def check_page_description(description: str, folder: str) -> bool:
    """Check if the page description is consistent with the folder name."""
    clean_folder = folder.split("/")[-1].replace("-", " ").lower()
    clean_description = description.replace("-", " ").lower()
    return clean_folder == clean_description


def get_folder(file: str) -> str:
    """Get the folder name of the file."""
    return file.split("/")[-2]


def get_title(content: str) -> str:
    """Get the title of the page."""
    r = re.search(r"<title>(.*?)</title>", content)
    if r is None:
        return ""
    return r.group(1)


def get_description(content: str) -> str:
    """Get the description of the page."""
    r = re.search(r'meta name="description" content="(.*?)"', content)
    if r is None:
        return ""
    return r.group(1)


def list_files() -> list[str]:
    """List all the index.html files."""
    return glob("animations/**/index.html")


def open_file(path: str) -> str:
    """Open the file and return its content."""
    with open(path) as f:
        return f.read()


def main() -> None:
    """Check the titles and descriptions of all the files."""
    anything_found = False
    for file in list_files():
        content = open_file(file)

        folder = get_folder(file)
        title = get_title(content)
        description = get_description(content)

        if title == "TEMPLATE":
            print(f"{file}: Title not changed")
            anything_found = True
        elif not check_page_title(title, folder):
            print(f"{file}: Title not consistent with folder name")
            anything_found = True

        if description == "TEMPLATE":
            print(f"{file}: Description not changed")
            anything_found = True
        elif not check_page_description(description, folder):
            print(f"{file}: Description not consistent with folder name")
            anything_found = True

    if not anything_found:
        print("All file titles and description are consistent")


if __name__ == "__main__":
    main()
