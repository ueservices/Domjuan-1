#!/usr/bin/env python3
"""
Basic utility script following Python best practices.
This file demonstrates proper code structure, type hints, and documentation.
"""

from typing import List, Optional


def greet_user(name: str, greeting: Optional[str] = None) -> str:
    """
    Greet a user with a customizable greeting.

    Args:
        name: The name of the user to greet
        greeting: Optional custom greeting (defaults to "Hello")

    Returns:
        A formatted greeting message

    Examples:
        >>> greet_user("Alice")
        'Hello, Alice!'
        >>> greet_user("Bob", "Hi")
        'Hi, Bob!'
    """
    if greeting is None:
        greeting = "Hello"
    return f"{greeting}, {name}!"


def calculate_sum(numbers: List[float]) -> float:
    """
    Calculate the sum of a list of numbers.

    Args:
        numbers: List of numbers to sum

    Returns:
        The sum of all numbers in the list

    Examples:
        >>> calculate_sum([1, 2, 3])
        6.0
        >>> calculate_sum([])
        0.0
    """
    return sum(numbers)


def main() -> None:
    """Main function demonstrating the utility functions."""
    print(greet_user("Developer"))
    print(f"Sum of [1, 2, 3, 4, 5]: {calculate_sum([1, 2, 3, 4, 5])}")


if __name__ == "__main__":
    main()
