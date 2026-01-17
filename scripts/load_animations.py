"""This script loads animations from the animations folder."""

from __future__ import annotations

import os
import re
import warnings
from glob import glob
from typing import Generator


class Animation:
    """Class representing an animation."""

    title: str
    description: str
    folder: str
    preview: str | None

    def __init__(
        self,
        title: str,
        description: str,
        folder: str,
        preview: str | None,
    ) -> None:
        """Initialize the Animation object."""
        self.title = title
        self.description = description
        self.folder = folder
        self.preview = preview

    @staticmethod
    def from_folder(folder: str) -> Animation:
        """Create an Animation object from a folder."""
        with open(f"{folder}/index.html") as f:
            content = f.read()

        title = ""
        r_title = re.search(r"<title>(.*?)</title>", content)
        if r_title is not None:
            title = r_title.group(1).strip()

        r_description = re.search(
            r'<meta name="description" content="(.*?)"',
            content,
        )
        description = ""
        if r_description is not None:
            description = r_description.group(1).strip()

        previews = list(glob(f"{folder}/*.png"))
        if len(previews) == 0:
            warnings.warn(
                f"Animation '{folder}' does not have any preview images.",
            )
            preview = None
        elif len(previews) > 1:
            previews.sort()
            preview = previews[0]
            warnings.warn(
                f"Animation '{folder}' has multiple preview images. "
                f"Using the first one: '{preview}'.",
            )
        else:
            preview = previews[0]

        folder = os.path.basename(os.path.normpath(folder))
        return Animation(title, description, folder, preview)

    def validate_title(self) -> bool:
        """Check if the title is valid."""
        clean_folder = re.sub(r"\s+|-|_|\d+", "", self.folder.strip().lower())
        clean_title = re.sub(r"\s+|-|_|\d+", "", self.title.strip().lower())
        return clean_folder == clean_title

    def validate_description(self) -> bool:
        """Check if the description is valid."""
        clean_folder = re.sub(r"\s+|-|_|\d+", "", self.folder.strip().lower())
        clean_description = re.sub(r"\s+|-|_|\d+", "", self.description.strip().lower())
        return clean_folder == clean_description

    def validate_previews(self) -> bool:
        """Check if there is at least one preview image."""
        return self.preview is not None

    def __lt__(self, other: Animation) -> bool:
        """Less than comparison based on folder name."""
        return self.title < other.title


class AnimationsLoader:
    """Class to load animations from the animations folder."""

    @staticmethod
    def load_animations() -> Generator[Animation, None, None]:
        """Load all animations from the animations folder."""
        for folder in glob("animations/*"):
            yield Animation.from_folder(folder)
