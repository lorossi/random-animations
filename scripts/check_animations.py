"""This script checks for issues in the animation folders."""

from sys import exit

from load_animations import AnimationsLoader


def main() -> None:
    """Script entry point."""
    issue_found = False
    folders = AnimationsLoader.load_animations()
    for folder in folders:
        if folder.check_issues():
            issue_found = True

    if issue_found:
        exit(1)

    print("All folders are correctly set up.")


if __name__ == "__main__":
    main()
