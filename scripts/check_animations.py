"""This script checks for issues in the animation folders."""

import warnings
from sys import exit

from load_animations import AnimationsLoader


def main() -> None:
    """Script entry point."""
    warnings.filterwarnings(action="ignore", module="load_animations")

    issues_found = False
    incomplete_animations = set()
    for animations in AnimationsLoader.load_animations():
        if animations.check_issues():
            issues_found = True
            incomplete_animations.add(animations.name)

    print(f"Checked {AnimationsLoader.count_animations()} animations.")
    if issues_found:
        print("The following animations have issues:")
        print(", ".join(sorted(incomplete_animations)))
        exit(1)

    print("All animations are correctly set up.")


if __name__ == "__main__":
    main()
