"""This script loads animations from the animations folder."""

from __future__ import annotations

import os
import re
import warnings
from functools import cached_property
from glob import glob
from typing import Generator


class Animation:
    """Represents a folder containing animations and font files."""

    def __init__(self, path: str) -> None:
        """Initialize the Folder with its path."""
        self.path = path

    @cached_property
    def uses_fonts(self) -> bool:
        """Check if the folder uses embedded font files in its animation code."""
        full_path = os.path.join(self.path, "**", "*.js")
        for animation_file in glob(full_path, recursive=True):
            with open(animation_file, "r", encoding="utf-8") as f:
                content = f.read()
                if any(keyword in content for keyword in ["fillText", "strokeText"]):
                    return True
        return False

    @cached_property
    def has_index(self) -> bool:
        """Check if the folder contains an index.html file."""
        index_path = os.path.join(self.path, "index.html")
        return os.path.isfile(index_path)

    @cached_property
    def has_style(self) -> bool:
        """Check if the folder contains a css folder."""
        css_path = os.path.join(self.path, "css")
        return os.path.isdir(css_path)

    @cached_property
    def fonts(self) -> list[str]:
        """Get a list of embedded font files in the folder."""
        font_extensions = ["*.ttf", "*.otf", "*.woff", "*.woff2"]
        font_files = []
        for font_ext in font_extensions:
            full_path = os.path.join(self.path, "**", font_ext)
            found_files = glob(full_path, recursive=True)
            font_files.extend(found_files)
        return font_files

    @cached_property
    def name(self) -> str:
        """Get the folder name."""
        parts = self.path.split(os.sep)
        return parts[-1]

    @cached_property
    def title(self) -> str | None:
        """Get the title of the animation in the folder."""
        if not self.has_index:
            return None
        index_path = os.path.join(self.path, "index.html")
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
            r_title = re.search(r"<title>(.*?)</title>", content)
            if r_title is not None:
                return r_title.group(1).strip()
        return None

    @cached_property
    def description(self) -> str | None:
        """Get the description of the animation in the folder."""
        if not self.has_index:
            return None
        index_path = os.path.join(self.path, "index.html")
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
            r_description = re.search(
                r'<meta name="description" content="(.*?)"',
                content,
            )
            if r_description is not None:
                return r_description.group(1).strip()
        return None

    @cached_property
    def preview(self) -> str | None:
        """Get the preview image of the animation in the folder."""
        previews = list(glob(os.path.join(self.path, "*.png")))
        if len(previews) == 0:
            warnings.warn(
                f"Folder '{self.name}' does not have any preview images.",
            )
            return None
        if len(previews) > 1:
            previews.sort()
            warnings.warn(
                f"Folder '{self.name}' has multiple preview images. "
                f"Using the first one: '{previews[0]}'.",
            )

        return previews[0]

    @cached_property
    def style_uses_fonts(self) -> bool:
        """Check if the css files reference any font files."""
        if not self.has_style:
            return False
        if not self.fonts:
            return False

        css_path = os.path.join(self.path, "css", "**", "*.css")
        for css_file in glob(css_path, recursive=True):
            with open(css_file, "r", encoding="utf-8") as f:
                content = f.read()
                for font_file in self.fonts:
                    font_name = os.path.basename(font_file)
                    if font_name in content:
                        return True

        return False

    @cached_property
    def has_js(self) -> bool:
        """Check if the folder contains a js folder."""
        js_path = os.path.join(self.path, "js")
        return os.path.isdir(js_path)

    @cached_property
    def has_favicon(self) -> bool:
        """Check if the folder contains a favicon.ico file."""
        favicon_path = os.path.join(self.path, "favicon.ico")
        return os.path.isfile(favicon_path)

    @cached_property
    def uses_favicon(self) -> bool:
        """Check if the index.html file references favicon.ico."""
        full_path = os.path.join(self.path, "index.html")
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
            if "favicon.ico" in content:
                return True

        return False

    def validate_index(self) -> bool:
        """Check if the index.html file has valid title and description."""
        clear_folder = self.name.strip().upper().replace("-", " ")
        return clear_folder == self.title and clear_folder == self.description

    def check_issues(self) -> bool:
        """Check if the folder has any issues with fonts or structure."""
        issues_found = False
        if not self.has_index:
            print(f"Folder '{self.name}' is missing index.html file.")
            issues_found = True
        if self.has_index and not self.validate_index():
            issues_found = True
            print(
                f"Folder '{self.name}' has invalid title or description in index.html."
            )

        if self.fonts and not self.uses_fonts:
            print(
                f"Folder '{self.name}' has embedded font files but does not use them."
            )
            issues_found = True
        if not self.fonts and self.uses_fonts:
            print(f"Folder '{self.name}' uses fonts but has no embedded font files.")
            issues_found = True

        if not self.has_style:
            print(f"Folder '{self.name}' is missing css folder.")
            issues_found = True

        if self.fonts and not self.style_uses_fonts:
            print(
                f"Folder '{self.name}' has embedded font files but css does not reference them."
            )
            issues_found = True

        if not self.has_js:
            print(f"Folder '{self.name}' is missing js folder.")
            issues_found = True

        if self.has_favicon and not self.uses_favicon:
            print(f"Folder '{self.name}' has favicon.ico but does not use it.")
            issues_found = True

        if not self.has_favicon and self.uses_favicon:
            print(f"Folder '{self.name}' uses favicon.ico but it is missing.")
            issues_found = True

        if not self.preview:
            print(f"Folder '{self.name}' is missing preview image.")
            issues_found = True

        return issues_found


class AnimationsLoader:
    """Class to load folders from the animations folder."""

    animations_folder = "animations"

    @staticmethod
    def load_animations() -> Generator[Animation, None, None]:
        """Load all folders from the animations folder."""
        full_path = os.path.join(
            AnimationsLoader.animations_folder,
            "*",
        )
        for folder in sorted(glob(full_path)):
            yield Animation(folder)
