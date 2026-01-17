"""This module creates the website in the specified destination folder."""

import argparse
import os
import random
import shutil

from load_animations import AnimationsLoader
from PIL import Image


def build_index() -> None:
    """Create the index.html file from the template."""
    with open("homepage/index_template.html") as f:
        template = f.read()

    animations_html = ""
    default_preview = "./assets/placeholder.png"

    animations = sorted(AnimationsLoader.load_animations())
    delay = 0
    next_skip = random.randint(3, 4)

    for i, animation in enumerate(animations):
        preview = animation.preview if animation.preview else default_preview
        delay += random.uniform(0.05, 0.15)
        animations_html += (
            f'<a href="/animations/{animation.folder}">'
            f'<div class="animation" style="animation-delay: {delay}s">'
            f'<img class="preview" src="{preview}">'
            f'<div class="description"><p>{animation.title}'
            "</p></div></div></a>"
        )
        if (i + 1) % next_skip == 0:
            animations_html += '<div class="animation-spacer"></div>'
            next_skip = random.randint(1, 3)

    index_content = template.replace("{{ ANIMATIONS }}", animations_html)
    with open("homepage/index.html", "w") as f:
        f.write(index_content)

    print("Created index.html file")


def build_structure(destination: str) -> None:
    """Create the website in the dest/ folder."""
    if not os.path.exists(destination):
        os.mkdir(destination)

    shutil.copytree("homepage", f"{destination}/", dirs_exist_ok=True)
    os.remove(f"{destination}/index_template.html")
    print(f"Created website in {destination}/ folder")


def build_animations(destination: str) -> None:
    """Copy animations and their preview images to the destination folder."""
    for animation in AnimationsLoader.load_animations():
        if animation.preview is None:
            continue
        img = Image.open(animation.preview)
        img = img.resize((300, int(300 * img.height / img.width)))
        dest_folder = f"{destination}/animations/{animation.folder}"
        os.makedirs(dest_folder, exist_ok=True)
        img.save(f"{dest_folder}/{os.path.basename(animation.preview)}")

        shutil.copytree(
            f"animations/{animation.folder}",
            f"{destination}/animations/{animation.folder}",
            dirs_exist_ok=True,
        )

    print(f"Copied preview images to {destination}/animations/")


def build_website(destination: str = "dist") -> None:
    """Build the complete website in the destination folder."""
    build_index()
    build_structure(destination)
    build_animations(destination)


def main() -> None:
    """Script entry point."""
    parser = argparse.ArgumentParser(
        description="Create the website in the dist/ folder.",
    )
    parser.add_argument(
        "--destination",
        type=str,
        default="dist",
        help="Destination folder for the website",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed for animation selection",
    )
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    build_website(args.destination)


if __name__ == "__main__":
    main()
