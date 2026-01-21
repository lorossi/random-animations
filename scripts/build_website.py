"""This module creates the website in the specified destination folder."""

import argparse
import os
import random
import shutil
import warnings

from jinja2 import Environment, FileSystemLoader
from load_animations import AnimationsLoader
from PIL import Image


def build_index(randomize: bool = False) -> None:
    """Create the index.html file from the template."""
    env = Environment(loader=FileSystemLoader("homepage/"))
    template = env.get_template("index_template.html")

    html = ""
    default_preview = "./assets/placeholder.png"

    animations = sorted(AnimationsLoader.load_animations())
    if randomize:
        random.shuffle(animations)

    output = []

    for animation in animations:
        preview = animation.preview if animation.preview else default_preview
        delay = random.uniform(0.1, 1)
        output.append(
            {
                "folder": animation.folder,
                "preview": preview,
                "title": animation.title,
                "delay": delay,
            }
        )

    html = template.render(animations=output)
    with open("homepage/index.html", "w", encoding="utf-8") as f:
        f.write(html)
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
        print(f"Processing animation: {animation.folder}")
        if animation.preview is None:
            continue

        img = Image.open(animation.preview)
        shutil.copytree(
            f"animations/{animation.folder}",
            f"{destination}/animations/{animation.folder}",
            dirs_exist_ok=True,
        )
        if abs(1 - (img.height / img.width)) > 0.1:
            warnings.warn(
                f"Preview image for animation '{animation.folder}' "
                "is not approximately square.",
            )

        img = img.resize((500, int(500 * img.height / img.width)))
        dest_folder = f"{destination}/animations/{animation.folder}"

        old_name = os.path.basename(animation.preview)
        new_name = old_name.replace(".png", ".webp")

        img.save(f"{dest_folder}/{new_name}", "WEBP")
        os.remove(f"{dest_folder}/{old_name}")

    print(f"Copied preview images to {destination}/animations/")


def build_website(
    destination: str = "dist",
    randomize: bool = False,
    seed: int | None = None,
) -> None:
    """Build the complete website in the destination folder."""
    if seed is not None:
        random.seed(seed)

    build_index(randomize=randomize)
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
        "--randomize",
        action="store_true",
        help="Randomize the order of animations on the homepage",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed for animation selection",
    )
    args = parser.parse_args()

    build_website(args.destination, args.randomize, args.seed)


if __name__ == "__main__":
    main()
