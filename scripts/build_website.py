"""This module creates the website in the specified destination folder."""

import argparse
import os
import shutil
import warnings
from datetime import datetime
from random import Random

from jinja2 import Environment, FileSystemLoader
from load_animations import Animation, AnimationsLoader
from PIL import Image


class WebsiteBuilder:
    """Class to build the website."""

    def __init__(self, destination: str, randomize: bool, seed: int | None) -> None:
        """Initialize the WebsiteBuilder."""
        self._destination = destination
        self._randomize = randomize

        if seed is None:
            seed = int(datetime.now().timestamp() * 1000)

        self._seed = seed
        self._random = Random(seed)

    def _png_to_webp(self, animation: Animation) -> str | None:
        """Get the webp version of the preview image if it exists."""
        if animation.preview is None:
            return None

        webp_preview = animation.preview.replace(".png", ".webp")
        webp_path = os.path.join(
            self._destination, animation.path, os.path.basename(webp_preview)
        )
        if os.path.isfile(webp_path):
            return webp_path.replace(self._destination + "/", "")

        return None

    def build_structure(self) -> None:
        """Create the website in the dest/ folder."""
        if not os.path.exists(self._destination):
            os.mkdir(self._destination)

        shutil.copytree(
            "homepage",
            f"{self._destination}/",
            dirs_exist_ok=True,
        )
        os.remove(f"{self._destination}/index_template.html")
        print(f"Created website in {self._destination}/ folder")

    def build_animations(self) -> None:
        """Copy animations and their preview images to the destination folder."""
        for animation in AnimationsLoader.load_animations():
            print(f"Processing animation: {animation.title}")
            if animation.preview is None:
                continue

            # copy the folder to the destination
            dest_folder = os.path.join(self._destination, animation.path)
            shutil.copytree(
                animation.path,
                dest_folder,
                dirs_exist_ok=True,
            )

            # Load the image
            img = Image.open(animation.preview)
            # Check if the image is square
            if abs(1 - (img.height / img.width)) > 0.1:
                warnings.warn(
                    f"Preview image for animation '{animation.title}' "
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

        print(f"Copied preview images to {self._destination}/animations/")

    def build_index(self) -> None:
        """Create the index.html file from the template."""
        env = Environment(loader=FileSystemLoader("homepage/"))
        template = env.get_template("index_template.html")

        html = ""
        default_preview = "./assets/placeholder.png"

        animations = list(AnimationsLoader.load_animations())
        if self._randomize:
            self._random.shuffle(animations)

        output = []

        for animation in animations:
            # replace the preview with webp version
            preview = self._png_to_webp(animation) or default_preview
            delay = self._random.uniform(0.1, 1)
            output.append(
                {
                    "path": animation.path,
                    "preview": preview,
                    "title": animation.title,
                    "delay": delay,
                }
            )

        html = template.render(animations=output)
        with open(f"{self._destination}/index.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Created index.html file")

    def build(self) -> None:
        """Build the complete website."""
        self.build_structure()
        self.build_animations()
        self.build_index()


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

    builder = WebsiteBuilder(
        destination=args.destination,
        randomize=args.randomize,
        seed=args.seed,
    )

    builder.build()


if __name__ == "__main__":
    main()
