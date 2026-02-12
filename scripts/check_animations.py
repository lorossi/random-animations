"""This script checks for issues in the animation folders."""

from sys import exit

from load_animations import AnimationsLoader


def main() -> None:
    """Script entry point."""
    issue_found = False
    for folder in AnimationsLoader.load_animations():
        if folder.check_issues():
            issue_found = True

    print(f"Checked {AnimationsLoader.count_animations()} animations.")
    if issue_found:
        exit(1)

    print("All animations are correctly set up.")


if __name__ == "__main__":
    main()
