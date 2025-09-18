# Local Development Guide

This guide provides comprehensive instructions for setting up and working with the Portfolio Website project locally.

## Prerequisites

### Required Software
- **Node.js** (version 18.0.0 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)
- **VS Code** or your preferred code editor

### Recommended VS Code Extensions
- **GitHub Copilot** - AI pair programming
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting  
- **REST Client** - API testing
- **Thunder Client** - API testing alternative
- **Live Server** - Local development server (optional)

### External Services
- **Stripe Account** (free) - Get test API keys from [stripe.com](https://stripe.com)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/ueservices/Domjuan-1.git
cd Domjuan-1

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment Variables

Edit your `.env` file with your Stripe test keys:

```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Database or other service URLs
# DATABASE_URL=your_database_url_here
```

### 3. Get Your Stripe Keys

1. Go to [stripe.com](https://stripe.com) and create a free account
2. Navigate to **Developers > API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)
5. Add both keys to your `.env` file

### 4. Start Development Server

```bash
# Start with hot reload
npm run dev

# OR start without hot reload
npm start
```

Visit http://localhost:3000 to see your portfolio website.

## Development Workflow

### Daily Development

1. **Pull latest changes**:
   ```bash
   git pull origin main
   npm install  # Update dependencies if needed
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Make your changes** and test thoroughly

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: descriptive commit message"
   git push origin feature/your-feature-name
   ```

### Testing Your Changes

#### Payment Flow Testing
Use these Stripe test card numbers:

```javascript
// Success cases
4242424242424242  // Visa - Success
4000056655665556  // Visa (debit) - Success

// Error cases  
4000000000000002  // Generic decline
4000000000009995  // Insufficient funds
4000000000009987  // Lost card
4000000000000069  // Expired card
```

#### Manual Testing Checklist

- [ ] Homepage loads without errors
- [ ] All navigation links work
- [ ] Service cards display correctly
- [ ] Payment modal opens for each service
- [ ] Payment form validates inputs
- [ ] Test card payments complete successfully
- [ ] Error cards show appropriate messages
- [ ] Mobile responsive design works
- [ ] Console shows no JavaScript errors

#### Security Testing

```bash
# Run security audit
npm audit

# Check for vulnerabilities at moderate level or higher
npm audit --audit-level moderate

# Fix automatic vulnerabilities
npm audit fix
```

## Project Structure

```
Portfolio Website/
├── .env                    # Environment variables (DO NOT COMMIT)
├── .env.example           # Environment template
├── .github/               # GitHub configuration
│   ├── workflows/         # CI/CD workflows
│   └── copilot-instructions.md  # Copilot guidance
├── .gitignore            # Git ignore rules
├── server.js             # Express.js server & API
├── index.html            # Main portfolio page
├── script.js             # Client-side JavaScript
├── styles.css            # All CSS styling
├── package.json          # Node.js configuration
├── package-lock.json     # Dependency lockfile
├── Procfile              # Heroku deployment config
├── deploy.sh             # Production deployment script
├── README.md             # Main project documentation
├── SECURITY.md           # Security guidelines
├── BEST_PRACTICES.md     # Development best practices
└── DEVELOPMENT.md        # This file
```

## Available npm Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (placeholder - add real tests)
npm run build      # Build for production (static site)
npm audit          # Check for security vulnerabilities
npm fund           # Show funding information for dependencies
```

## Working with the Codebase

### Server-side Development (`server.js`)

The Express.js server handles:
- Static file serving
- Stripe payment processing
- API endpoints for services
- Security headers and CORS
- Error handling

Key endpoints:
- `GET /` - Serve homepage
- `GET /config.js` - Serve Stripe configuration
- `POST /create-payment-intent` - Process payments
- `POST /webhook` - Stripe webhook handler
- `GET /health` - Health check

### Client-side Development (`script.js`, `index.html`, `styles.css`)

Frontend components:
- Responsive navigation
- Service showcase
- Payment modal with Stripe Elements
- Smooth scrolling and animations
- Form validation and error handling

### Adding New Features

#### Adding a New Service

1. **Update service configuration** in `server.js`:
   ```javascript
   const SERVICES = {
     // ... existing services
     'new-service': {
       name: 'New Service Name',
       price: 25000, // $250.00 in cents
       description: 'Service description'
     }
   };
   ```

2. **Add service card** to `index.html`:
   ```html
   <div class="service-card">
     <h3>New Service Name</h3>
     <p>Service description</p>
     <div class="price">$250.00</div>
     <button onclick="openPaymentModal('new-service', 25000)">
       Purchase Now
     </button>
   </div>
   ```

3. **Test the payment flow** with test cards

#### Adding API Endpoints

1. **Follow existing patterns** in `server.js`
2. **Add input validation**
3. **Include error handling**
4. **Test with REST client**

Example:
```javascript
app.get('/api/example', async (req, res) => {
  try {
    // Validate input
    if (!req.query.param) {
      return res.status(400).json({ error: 'Missing required parameter' });
    }
    
    // Process request
    const result = await processRequest(req.query.param);
    
    // Return response
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Port already in use
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
# Or use different port
PORT=3001 npm run dev
```

#### Stripe errors
- Verify your API keys in `.env`
- Check you're using test keys (start with `pk_test_` and `sk_test_`)
- Ensure webhook secret is correct if using webhooks

#### Payment modal not opening
- Check browser console for JavaScript errors
- Verify Stripe.js is loaded (check network tab)
- Ensure service configuration matches server-side

#### CSS/styling issues  
- Clear browser cache
- Check for CSS syntax errors
- Verify CSS file is being served correctly

### Getting Help

1. **Check the browser console** for error messages
2. **Review server logs** in your terminal
3. **Verify environment variables** are set correctly
4. **Test with curl or Postman** for API issues
5. **Check Stripe dashboard** for payment-related issues

### Performance Tips

- Use browser dev tools to identify bottlenecks
- Optimize images for web
- Minimize HTTP requests
- Enable compression in production
- Use CDN for static assets

## Contributing

1. **Follow the coding standards** in `.github/copilot-instructions.md`
2. **Write tests** for new functionality
3. **Update documentation** for any changes
4. **Test payment flows** thoroughly
5. **Run security audit** before submitting PR

## Next Steps

After getting set up:

1. **Familiarize yourself** with the payment flow
2. **Test all features** manually  
3. **Review the security guidelines** in `SECURITY.md`
4. **Check out the best practices** in `BEST_PRACTICES.md`
5. **Start with small changes** to understand the codebase

## Production Deployment

See `README.md` for production deployment instructions to platforms like Heroku, Vercel, or other hosting providers.