"""This script checks the animations for required files and valid metadata."""

from __future__ import annotations

from sys import exit

from load_animations import AnimationsLoader


def main() -> None:
    """Script entry point."""
    all_valid = True
    animations = AnimationsLoader.load_animations()

    for animation in animations:
        if not animation.validate_title():
            print(
                f"Animation '{animation.folder}' "
                f"has an invalid title: '{animation.title}'",
            )
            all_valid = False

        if not animation.validate_description():
            print(
                f"Animation '{animation.folder}' ",
                f"has an invalid description: '{animation.description}'",
            )
            all_valid = False

        if not animation.validate_previews():
            print(
                f"Animation '{animation.folder}' does not have any preview images.",
            )
            all_valid = False

    if all_valid:
        print("All animations are valid!")
    else:
        print("Some animations have invalid metadata.")
        exit(1)


if __name__ == "__main__":
    main()
