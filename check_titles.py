"""This script checks for titles and description in all the files called index.html."""

from glob import glob


def check_default_title(content: str) -> bool:
    """Check if the default is present."""
    return "<title>TEMPLATE</title>" in content


def check_default_content(content: str) -> bool:
    """Check if the default is present."""
    return 'content="TEMPLATE"' in content


def list_files() -> list[str]:
    """List all the index.html files."""
    return glob("animations/**/index.html")


def open_file(path: str) -> str:
    """Open the file and return its content."""
    with open(path) as f:
        return f.read()


def main():
    """Script entry point."""
    for file in list_files():
        content = open_file(file)
        if check_default_title(content):
            print(f"Title not changed in {file}")
        if check_default_content(content):
            print(f"Description not changed in {file}")


if __name__ == "__main__":
    main()
