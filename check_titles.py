"""This script checks for titles and description in all the files called index.html."""

import os
import re
from glob import glob


def check_default_title(content: str) -> bool:
    """Check if the default is present."""
    return "<title>TEMPLATE</title>" in content


def check_default_content(content: str) -> bool:
    """Check if the default is present."""
    return 'content="TEMPLATE"' in content


def check_page_title(content: str, folder: str) -> bool:
    """Check if the page title is consistent with the folder name."""
    clean_folder = folder.split("/")[-1].replace("-", " ").lower()
    page_title = re.search(r"<title>(.*?)</title>", content).group(1)
    clean_title = page_title.replace("-", " ").lower()
    return clean_title in clean_folder, clean_folder, clean_title


def list_files() -> list[str]:
    """List all the index.html files."""
    return glob("animations/**/index.html")


def open_file(path: str) -> str:
    """Open the file and return its content."""
    with open(path) as f:
        return f.read()


def main():
    """Script entry point."""
    for file in list_files():
        content = open_file(file)
        folder = os.path.dirname(file)

        default_title = check_default_title(content)
        default_content = check_default_content(content)
        title_valid, folder_title, page_title = check_page_title(content, folder)

        if any([default_title, default_content, not title_valid]):
            print(f"{file}:")
            if default_title:
                print("\tTitle not changed")
            if default_content:
                print("\tDescription not changed")
            if not title_valid and not (default_title or default_content):
                print(
                    f"\tTitle not consistent with folder name: "
                    f"page title: {page_title}, folder title: {folder_title}"
                )


if __name__ == "__main__":
    main()
