"""This script checks for folders with embedded font files and whether they use them."""

from sys import exit

from scripts.load_animations import AnimationsLoader


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
