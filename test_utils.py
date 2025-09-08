#!/usr/bin/env python3
"""
Test suite for utils.py following pytest best practices.
This demonstrates proper test structure, fixtures, and test coverage.
"""

import pytest
from utils import greet_user, calculate_sum


class TestGreetUser:
    """Test cases for the greet_user function."""

    def test_greet_user_default_greeting(self):
        """Test greeting with default message."""
        result = greet_user("Alice")
        assert result == "Hello, Alice!"

    def test_greet_user_custom_greeting(self):
        """Test greeting with custom message."""
        result = greet_user("Bob", "Hi")
        assert result == "Hi, Bob!"

    def test_greet_user_empty_name(self):
        """Test greeting with empty name."""
        result = greet_user("")
        assert result == "Hello, !"

    def test_greet_user_none_greeting(self):
        """Test that None greeting defaults to Hello."""
        result = greet_user("Charlie", None)
        assert result == "Hello, Charlie!"


class TestCalculateSum:
    """Test cases for the calculate_sum function."""

    def test_calculate_sum_positive_numbers(self):
        """Test sum of positive numbers."""
        result = calculate_sum([1, 2, 3, 4, 5])
        assert result == 15.0

    def test_calculate_sum_negative_numbers(self):
        """Test sum of negative numbers."""
        result = calculate_sum([-1, -2, -3])
        assert result == -6.0

    def test_calculate_sum_mixed_numbers(self):
        """Test sum of mixed positive and negative numbers."""
        result = calculate_sum([1, -2, 3, -4])
        assert result == -2.0

    def test_calculate_sum_empty_list(self):
        """Test sum of empty list."""
        result = calculate_sum([])
        assert result == 0.0

    def test_calculate_sum_single_number(self):
        """Test sum of single number."""
        result = calculate_sum([42.5])
        assert result == 42.5

    def test_calculate_sum_floats(self):
        """Test sum of floating point numbers."""
        result = calculate_sum([1.1, 2.2, 3.3])
        assert result == pytest.approx(6.6, rel=1e-9)


@pytest.fixture
def sample_numbers():
    """Fixture providing sample numbers for testing."""
    return [1, 2, 3, 4, 5]


def test_integration_greet_and_sum(sample_numbers):
    """Integration test using both functions together."""
    greeting = greet_user("Test User")
    total = calculate_sum(sample_numbers)

    assert "Test User" in greeting
    assert total == 15.0
