"""This module creates the website in the specified destination folder."""

import argparse
import os
import random
import shutil
import warnings

from jinja2 import Environment, FileSystemLoader
from load_animations import Animation, AnimationsLoader
from PIL import Image


def png_to_webp(animation: Animation) -> str:
    """Convert a PNG image to WEBP format and return the new path."""
    if animation.preview is None:
        raise ValueError("Animation does not have a preview image.")

    if not animation.preview.endswith(".png"):
        raise ValueError("Preview image is not a PNG file.")

    return animation.preview.replace(".png", ".webp")


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

        # copy the folder to the destination
        dest_folder = os.path.join(destination, animation.folder)
        shutil.copytree(
            animation.folder,
            dest_folder,
            dirs_exist_ok=True,
        )

        # Load the image
        img = Image.open(animation.preview)
        # Check if the image is square
        if abs(1 - (img.height / img.width)) > 0.1:
            warnings.warn(
                f"Preview image for animation '{animation.folder}' "
                "is not approximately square.",
            )

        # resize the image to have a width of 500 pixels
        img = img.resize((500, 500))

        # rename the image as wepb
        old_name = os.path.basename(animation.preview)
        new_name = old_name.replace(".png", ".webp")
        # save the image as webp and remove the png
        img.save(f"{dest_folder}/{new_name}", "WEBP")
        os.remove(f"{dest_folder}/{old_name}")

    print(f"Copied preview images to {destination}/animations/")


def build_index(destination: str, randomize: bool = False) -> None:
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
        # replace the preview with webp version
        preview = png_to_webp(animation) or default_preview
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
    with open(f"{destination}/index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Created index.html file")


def build_website(
    destination: str = "dist",
    randomize: bool = False,
    seed: int | None = None,
) -> None:
    """Build the complete website in the destination folder."""
    if seed is not None:
        random.seed(seed)

    build_structure(destination=destination)
    build_animations(destination=destination)
    build_index(destination=destination, randomize=randomize)


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
