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
    def has_index(self) -> bool:
        """Check if the folder contains an index.html file."""
        index_path = os.path.join(self.path, "index.html")
        return os.path.isfile(index_path)

    @property
    def has_js(self) -> bool:
        """Check if the folder contains a js folder."""
        return len(self.js_files) > 0

    @property
    def has_css(self) -> bool:
        """Check if the folder contains a css folder."""
        return len(self.css_files) > 0

    @property
    def has_fonts(self) -> bool:
        """Check if the folder contains any font files."""
        return len(self.font_files) > 0

    @cached_property
    def font_files(self) -> list[str]:
        """Get a list of embedded font files in the folder."""
        font_extensions = ["*.ttf", "*.otf", "*.woff", "*.woff2"]
        font_files = []
        for font_ext in font_extensions:
            full_path = os.path.join(self.path, "**", font_ext)
            found_files = glob(full_path, recursive=True)
            font_files.extend(found_files)

        return font_files

    @cached_property
    def css_files(self) -> list[str]:
        """Get a list of css files in the folder."""
        full_path = os.path.join(self.path, "**", "*.css")
        return glob(full_path, recursive=True)

    @cached_property
    def js_files(self) -> list[str]:
        """Get a list of js files in the folder."""
        full_path = os.path.join(self.path, "**", "*.js")
        return glob(full_path, recursive=True)

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

    def _css_font_map(
        self,
        css_path: str,
    ) -> dict[str, str]:
        """Return the font file path if found in the css file."""
        with open(css_path, "r", encoding="utf-8") as f:
            content = f.read()

        pattern = re.compile(
            r"@font-face\s*\{[^}]*font-family:\s*([^;]+);[^}]*"
            r"src:\s*url\(([^)]+)\);[^}]*\}",
            re.IGNORECASE,
        )
        matches = pattern.findall(content)

        font_map = {}
        for match in matches:
            font_family = match[0].strip()
            font_path = match[1].strip()

            css_folder = os.path.dirname(css_path)

            full_relative_path = os.path.join(css_folder, font_path)
            font_path = os.path.normpath(full_relative_path)

            font_map[font_family] = font_path

        return font_map

    @cached_property
    def css_fonts_map(self) -> dict[str, str]:
        """Get a map of font file name (css) to font path."""
        font_map = {}
        for css_file in self.css_files:
            font_map.update(self._css_font_map(css_file))

        return font_map

    @cached_property
    def css_fonts(self) -> list[str]:
        """Get a map of font file name (css) to font path."""
        fonts = []
        for css_file in self.css_files:
            for font_path in self._css_font_map(css_file).values():
                fonts.append(font_path)

        return fonts

    def validate_index(self) -> tuple[bool, str | None, str | None]:
        """Check if the index.html file has valid title and description."""
        if not self.has_index:
            return False, None, None

        clear_folder = self.name.strip().upper().replace("-", " ")
        valid = clear_folder == self.title and clear_folder == self.description

        return valid, self.title, self.description

    def validate_css_fonts(self) -> tuple[list[str], list[str]]:
        """Check if all font files are referenced in the css files."""
        unused_fonts = []
        nonexisting_fonts = []
        for font in self.font_files:
            if font not in self.css_fonts:
                unused_fonts.append(font)

        for css_font in self.css_fonts:
            if css_font not in self.font_files:
                nonexisting_fonts.append(css_font)

        return unused_fonts, nonexisting_fonts

    def validate_js_fonts(self) -> list[str]:
        """Check if all font files are referenced in the js files."""
        used_fonts = {font: False for font in self.css_fonts_map.keys()}

        for js_file in self.js_files:
            with open(js_file, "r", encoding="utf-8") as f:
                content = f.read()

            for font_family in used_fonts.keys():
                if font_family in content:
                    used_fonts[font_family] = True

        return list(font for font, used in used_fonts.items() if not used)

    def check_issues(self) -> bool:
        """Check if the folder has any issues with fonts or structure."""
        issues_found = False

        if not self.has_index:
            print(f"Folder '{self.name}' is missing index.html file.")
            issues_found = True
        else:
            valid, title, description = self.validate_index()
            if not valid:
                issues_found = True
                print(
                    f"Folder '{self.name}' has invalid title or description in index.html: "
                    f"title='{title}', description='{description}'",
                )

        if not self.has_css:
            print(f"Folder '{self.name}' is missing css folder.")
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

        if self.has_fonts:
            unused_fonts, nonexisting_fonts = self.validate_css_fonts()
            for font in unused_fonts:
                print(f"Folder '{self.name}' has unused font file: '{font}'")
                issues_found = True
            for css_font in nonexisting_fonts:
                print(
                    f"Folder '{self.name}' references non-existing font file in css: "
                    f"'{css_font}'",
                )
                issues_found = True

            js_unused_fonts = self.validate_js_fonts()
            for font_family in js_unused_fonts:
                print(
                    f"Folder '{self.name}' has font '{font_family}' not used in js files.",
                )
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
