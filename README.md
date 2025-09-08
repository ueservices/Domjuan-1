# Domjuan-1 Project

A Python project demonstrating best practices for code quality, testing, and CI/CD with GitHub Actions.

## Features

- Clean Python code with type hints and proper documentation
- Comprehensive test suite using pytest
- Automated CI/CD pipeline with GitHub Actions
- Code quality tools (flake8, black)
- Follows PEP 8 style guidelines

## Project Structure

```
.
├── .github/workflows/
│   └── ci.yml              # GitHub Actions CI workflow
├── utils.py                # Main utility functions
├── test_utils.py           # Test suite
├── requirements.txt        # Python dependencies
├── .flake8                 # Flake8 configuration
├── pyproject.toml          # Black configuration
├── BEST_PRACTICES.md       # Development best practices guide
└── README.md               # This file
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ueservices/Domjuan-1.git
   cd Domjuan-1
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the main utility script:
```bash
python utils.py
```

## Testing

Run the test suite:
```bash
pytest -v
```

Run tests with coverage:
```bash
pytest --cov=utils --cov-report=html
```

## Code Quality

Format code with black:
```bash
black .
```

Lint code with flake8:
```bash
flake8 .
```

## CI/CD

This project uses GitHub Actions for continuous integration. The workflow:

- Tests on multiple Python versions (3.8, 3.9, 3.10, 3.11)
- Runs on Ubuntu latest
- Includes caching for faster builds
- Checks code formatting and linting
- Runs the full test suite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass and code is properly formatted
5. Submit a pull request

## Best Practices

See [BEST_PRACTICES.md](BEST_PRACTICES.md) for detailed guidelines on:
- Python code quality
- GitHub Actions & workflows
- Security practices
- General software engineering

## License

This project is open source and available under the MIT License.