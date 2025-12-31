"""Convert the Adobe XML palette from the clipboard to a list of hex color values.

The output is printed to the console and also copied back to the clipboard.
"""

import re

import pyperclipfix


def main() -> None:
    """Script entry point."""
    xml_content = pyperclipfix.paste()
    rgb_pattern = re.compile(r"rgb='([0-9A-Fa-f]{6})'")
    hex_colors = [f"#{color}" for color in re.findall(rgb_pattern, xml_content)]
    print(hex_colors)
    pyperclipfix.copy(str(hex_colors))


if __name__ == "__main__":
    main()
