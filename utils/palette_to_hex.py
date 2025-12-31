"""Convert the Adobe XML palette from the clipboard to a list of hex color values.

The output is printed to the console and also copied back to the clipboard.
"""

import re

import pyperclipfix


def from_adobe_xml(xml_content: str) -> list[str]:
    """Parse an Adobe XML palette and return a list of hex color strings."""
    rgb_pattern = re.compile(r"rgb='([0-9A-Fa-f]{6})'")
    return [f"#{color}" for color in re.findall(rgb_pattern, xml_content)]


def from_coolors_url(url: str) -> list[str]:
    """Parse a Coolors.co URL and return a list of hex color strings."""
    rgb_pattern = re.compile(r"palette/([0-9A-Fa-f\-]+)")
    return [f"#{color}" for color in re.findall(rgb_pattern, url)[0].split("-")]


def main() -> None:
    """Script entry point."""
    clipboard_content = pyperclipfix.paste()
    if clipboard_content.strip().startswith("<palette>"):
        colors = from_adobe_xml(clipboard_content)
    elif "coolors.co" in clipboard_content:
        colors = from_coolors_url(clipboard_content)
    else:
        print("Unrecognized palette format in clipboard.")
        return

    output = str(colors)
    print(output)
    pyperclipfix.copy(output)


if __name__ == "__main__":
    main()
