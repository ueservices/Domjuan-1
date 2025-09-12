# Domjuan-1 Project

A dual-language development project featuring a **Node.js portfolio website** with payment processing capabilities and **Python utility components** demonstrating best practices for code quality, testing, and CI/CD.

## Features

### Node.js Portfolio Website (Primary)
- 🎨 Modern, responsive design
- 💳 Stripe payment integration  
- 🔒 Secure payment processing
- 📱 Mobile-friendly interface
- ⚡ Fast loading times
- 🚀 Production-ready deployment

### Python Development Tools (Secondary)
- Clean Python code with type hints and proper documentation
- Comprehensive test suite using pytest
- Automated CI/CD pipeline with GitHub Actions
- Code quality tools (flake8, black)
- Follows PEP 8 style guidelines

## Services Offered (Portfolio Website)

1. **Website Development** - $500
   - Custom websites built with modern technologies
   
2. **E-commerce Solutions** - $1,200
   - Complete online store setup with payment processing
   
3. **Consultation** - $100
   - One-on-one consultation for your project

## Project Structure

```
.
├── Node.js Components (Primary)
│   ├── server.js           # Express server with Stripe integration
│   ├── package.json        # Node.js dependencies and scripts
│   ├── index.html          # Frontend portfolio website
│   ├── styles.css          # CSS styling
│   ├── script.js           # Frontend JavaScript
│   └── .env.example        # Environment template
├── Python Components (Secondary)  
│   ├── utils.py            # Python utility functions
│   ├── test_utils.py       # Test suite with pytest
│   ├── requirements.txt    # Python dependencies
│   ├── .flake8             # Flake8 configuration
│   └── pyproject.toml      # Black configuration
├── CI/CD Workflows
│   ├── .github/workflows/
│   │   ├── deploy.yml      # Node.js deployment pipeline
│   │   └── python-ci.yml   # Python testing and quality checks
│   └── .github/copilot-instructions.md  # Copilot configuration
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Node.js (version 18 or higher) 
- Python 3.8+ (for Python components)
- npm or yarn
- Stripe account for payment processing

### Node.js Setup (Primary)

1. Clone the repository:
```bash
git clone https://github.com/ueservices/Domjuan-1.git
cd Domjuan-1
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Stripe keys
```

4. Start the development server:
```bash
npm run dev
```

5. Visit `http://localhost:3000` to view the portfolio

### Python Setup (Optional)

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Python utilities:
```bash
python utils.py
```

## Testing

### Node.js Testing
```bash
npm test
npm audit --audit-level moderate
```

### Python Testing
```bash
pytest -v                    # Run test suite
black --check .              # Check code formatting
flake8 .                     # Lint code
```

## CI/CD

This project uses GitHub Actions for continuous integration:

### Node.js Pipeline (`deploy.yml`)
- Tests on Node.js versions 18.x, 20.x, 22.x
- Runs security audits
- Deploys to Heroku/Vercel on main branch

### Python Pipeline (`python-ci.yml`)  
- Tests on Python versions 3.8-3.11
- Runs code quality checks (flake8, black)
- Executes full test suite with pytest

## Production Deployment

### Environment Variables

Set the following in your production environment:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key  
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Set to "production"

### Deployment Platforms

The Node.js application is compatible with:
- Heroku (primary)
- Vercel
- Railway  
- Render
- DigitalOcean App Platform

## Payment Processing

Uses Stripe for secure payment processing:

1. Customers select a service
2. Payment modal opens with Stripe Elements
3. Secure payment processing
4. Confirmation and receipt

### Test Cards
- Success: `4242424242424242`
- Decline: `4000000000000002`

## Code Quality

### Node.js Commands
```bash
npm start           # Start production server
npm run dev         # Start development server
npm test            # Run tests
npm audit           # Security audit
```

### Python Commands
```bash
python utils.py     # Run utility demo
pytest -v           # Run test suite
black .             # Format code
flake8 .            # Lint code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass and code is properly formatted
5. Submit a pull request

## Best Practices

This project demonstrates:
- Modern full-stack development practices
- Proper CI/CD pipelines
- Security considerations (CSP, CORS, input validation)
- Code quality tooling
- Comprehensive testing strategies
- Multi-language project structure

## License

This project is open source and available under the MIT License.