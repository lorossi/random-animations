"""This script checks for issues in the animation folders."""

import warnings

from load_animations import AnimationsLoader


def main() -> None:
    """Script entry point."""
    warnings.filterwarnings(action="ignore", module="load_animations")

    issues_found = False
    issued_animations = set()
    for animations in AnimationsLoader.load_animations():
        if animations.check_issues():
            issues_found = True
            issued_animations.add(animations.name)

    print(f"Checked {AnimationsLoader.count_animations()} animations.")
    if issues_found:
        print("The following animations have issues:")
        print(", ".join(sorted(issued_animations)))
        raise RuntimeError("Some animations have issues. Please check the logs above.")

    print("All animations are correctly set up.")


if __name__ == "__main__":
    main()
