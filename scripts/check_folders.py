"""This script checks for folders with embedded font files and whether they use them."""

import os
from glob import glob
from sys import exit


class Folder:
    """Represents a folder containing animations and font files."""

    def __init__(self, path: str) -> None:
        """Initialize the Folder with its path."""
        self.path = path

    @property
    def uses_fonts(self) -> bool:
        """Check if the folder uses embedded font files in its animation code."""
        full_path = os.path.join(self.path, "**", "*.js")
        for animation_file in glob(full_path, recursive=True):
            with open(animation_file, "r", encoding="utf-8") as f:
                content = f.read()
                if any(keyword in content for keyword in ["fillText", "strokeText"]):
                    return True
        return False

    @property
    def has_index(self) -> bool:
        """Check if the folder contains an index.html file."""
        index_path = os.path.join(self.path, "index.html")
        return os.path.isfile(index_path)

    @property
    def has_style(self) -> bool:
        """Check if the folder contains a css folder."""
        css_path = os.path.join(self.path, "css")
        return os.path.isdir(css_path)

    @property
    def has_js(self) -> bool:
        """Check if the folder contains a js folder."""
        js_path = os.path.join(self.path, "js")
        return os.path.isdir(js_path)

    @property
    def has_favicon(self) -> bool:
        """Check if the folder contains a favicon.ico file."""
        favicon_path = os.path.join(self.path, "favicon.ico")
        return os.path.isfile(favicon_path)

    @property
    def uses_favicon(self) -> bool:
        """Check if the index.html file references favicon.ico."""
        full_path = os.path.join(self.path, "index.html")
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
            if "favicon.ico" in content:
                return True

        return False

    @property
    def fonts(self) -> list[str]:
        """Get a list of embedded font files in the folder."""
        font_extensions = ["*.ttf", "*.otf", "*.woff", "*.woff2"]
        font_files = []
        for font_ext in font_extensions:
            full_path = os.path.join(self.path, "**", font_ext)
            found_files = glob(full_path, recursive=True)
            font_files.extend(found_files)
        return font_files

    @property
    def name(self) -> str:
        """Get the folder name."""
        parts = self.path.split(os.sep)
        if len(parts) >= 2:
            return os.path.join(parts[0], parts[1])
        return ""


def main() -> None:
    """Script entry point."""
    issue_found = False
    for folder_path in glob(os.path.join("animations", "*")):
        folder = Folder(folder_path)

        if folder.fonts and not folder.uses_fonts:
            issue_found = True
            print(
                f"Folder '{folder.name}' has embedded font files but does not use them:"
            )
        elif not folder.fonts and folder.uses_fonts:
            issue_found = True
            print(f"Folder '{folder.name}' uses fonts but has no embedded font files.")

        if not folder.has_index:
            issue_found = True
            print(f"Folder '{folder.name}' is missing index.html file.")

        if not folder.has_style:
            issue_found = True
            print(f"Folder '{folder.name}' is missing css folder.")

        if not folder.has_js:
            issue_found = True
            print(f"Folder '{folder.name}' is missing js folder.")

        if folder.has_favicon and not folder.uses_favicon:
            issue_found = True
            print(f"Folder '{folder.name}' has favicon.ico but does not use it.")
        elif not folder.has_favicon and folder.uses_favicon:
            issue_found = True
            print(f"Folder '{folder.name}' uses favicon.ico but it is missing.")

    if issue_found:
        exit(1)

    print("All folders are correctly set up.")


if __name__ == "__main__":
    main()
