# DebtCrusher

**A Smart Personal Finance Dashboard for Optimized Credit Card Debt Repayment**

## Abstract

DebtCrusher is an intelligent financial optimization platform that implements multiple debt reduction strategies through both deterministic algorithmic approaches and AI-powered recommendations. The system provides real-time financial planning capabilities, allowing users to visualize and compare different debt repayment strategies to minimize interest costs and accelerate debt elimination. Built with React and TypeScript, DebtCrusher combines classical optimization algorithms (Avalanche, Snowball) with modern Large Language Model (LLM) integration for adaptive financial planning.

## Table of Contents

- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Debt Optimization Strategies](#debt-optimization-strategies)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Technical Implementation](#technical-implementation)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Capabilities

- **Multi-Strategy Debt Optimization**: Implements four distinct repayment strategies
  - Avalanche Method (interest-rate prioritization)
  - Snowball Method (balance prioritization)
  - Even Distribution Method
  - AI-Powered Recommendations (via LM Studio integration)

- **Real-Time Financial Projections**:
  - Multi-month balance projections (configurable 1-12 months)
  - Cumulative interest calculation
  - Credit utilization tracking
  - Available credit forecasting

- **Interactive Debt Management**:
  - CRUD operations for credit card accounts
  - Dynamic payment allocation visualization
  - Safety spending recommendations
  - Minimum payment compliance validation

- **Data Persistence**:
  - Local file-based database via Vite middleware
  - Automatic state synchronization
  - JSON-based data storage

- **Intelligent Warnings System**:
  - High credit utilization alerts (>30%)
  - Budget deficit detection
  - Strategy compliance validation (for LLM mode)

## Technical Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.2.3 |
| Type System | TypeScript | 5.8.2 |
| Build Tool | Vite | 6.2.0 |
| Charting Library | Recharts | 3.6.0 |
| Icons | Lucide React | 0.562.0 |
| AI Integration | LM Studio (Local LLM) | API v1 |

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                     │
│  (React Components + State Management)               │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│              Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │   Solver     │  │  LM Studio   │  │     DB     ││
│  │  (Algo)      │  │  Integration │  │  Service   ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│              Data Persistence Layer                  │
│  (File System via Vite Middleware)                   │
└─────────────────────────────────────────────────────┘
```

## Debt Optimization Strategies

### 1. Avalanche Method

**Mathematical Model:**

```
Priority(card_i) = APR_i
Payment_extra(card_i) = {
  min(Remaining_Budget, Balance_i) if card_i has highest APR
  0 otherwise
}
```

**Optimality**: Minimizes total interest paid over the repayment period by targeting high-interest debt first.

**Time Complexity**: O(n log n) due to sorting by APR

### 2. Snowball Method

**Mathematical Model:**

```
Priority(card_i) = -Balance_i  (ascending order)
Payment_extra(card_i) = {
  min(Remaining_Budget, Balance_i) if card_i has lowest balance
  0 otherwise
}
```

**Psychological Advantage**: Provides quick wins through complete debt elimination, enhancing motivation.

**Time Complexity**: O(n log n) due to sorting by balance

### 3. Even Distribution Method

**Mathematical Model:**

```
Extra_per_card = ⌊(Remaining_Budget / n) × 100⌋ / 100
where n = number of active cards
```

**Characteristics**: Balanced approach with simplified mental accounting

**Time Complexity**: O(n)

### 4. LLM-Powered Optimization

**Approach**: Leverages local Large Language Models through LM Studio to generate context-aware payment allocations.

**Key Features**:
- Strategy compliance validation
- Constraint satisfaction verification
- Automatic fallback to deterministic algorithms on failure
- Zero-temperature sampling for reproducibility

**Validation Pipeline**:
```
LLM Response → JSON Parsing → Constraint Validation →
Strategy Compliance Check → Fallback Decision → Final Allocation
```

## Projection Algorithm

The system simulates month-by-month debt evolution using the following iterative process:

```typescript
for each month in [1, N]:
  1. Apply interest: Balance_i += (Balance_i × APR_i) / 12
  2. Pay minimums: Budget -= Σ min(Balance_i, MinPayment_i)
  3. Distribute surplus according to strategy
  4. Record state: (month, total_balance, interest_paid, card_balances)
```

**Termination Conditions**:
- Projection period reached (default: 6 months)
- All balances reach zero
- Budget exhausted

## System Requirements

### Development Environment

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- Modern web browser with ES2020 support

### Optional: LLM Integration

- LM Studio running locally
- Compatible model loaded (e.g., Llama 3, Mistral)
- Endpoint: `http://localhost:1234/v1/chat/completions`

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/melrefaiy2018/DebtCrusher.git
cd DebtCrusher
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Data Directory

The application will automatically create `data/db.json` on first run. You can also manually create it:

```bash
mkdir -p data
echo '{"profile":{"monthlyNetIncome":0},"cards":{},"lastUpdated":null}' > data/db.json
```

## Configuration

### Environment Variables (Optional)

Create `.env.local` in the root directory:

```env
# For future AI integrations
GEMINI_API_KEY=your_api_key_here
```

### LM Studio Setup (for AI Strategy)

1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a compatible language model
3. Start the local server on port 1234
4. Select "LLM" strategy in the application

## Usage

### Starting the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Basic Workflow

1. **Set Monthly Budget**: Enter your available monthly income for debt repayment
2. **Add Credit Cards**: Input details for each card:
   - Card name
   - Current balance
   - Credit limit
   - APR (Annual Percentage Rate)
   - Minimum payment
   - Payment due date
3. **Select Strategy**: Choose from Avalanche, Snowball, Even, or LLM
4. **Generate Plan**: The system automatically calculates optimal allocations
5. **Review Recommendations**:
   - View payment allocations per card
   - Check projected balances
   - Monitor interest costs
   - See safe spending limits

### Building for Production

```bash
npm run build
npm run preview
```

## API Documentation

### Internal API Endpoints

#### Database API

**GET** `/api/db`
- Returns complete database state
- Response: `{ profile, cards, lastUpdated }`

**POST** `/api/db`
- Updates database state
- Request Body: Complete database object
- Response: `{ success: true }`

### Data Models

#### CreditCard Interface

```typescript
interface CreditCard {
  id: string;                    // Unique identifier
  name: string;                  // Card name/issuer
  balance: number;               // Current balance ($)
  creditLimit: number;           // Maximum credit ($)
  apr: number;                   // Annual Percentage Rate (%)
  minPayment: number;            // Minimum monthly payment ($)
  dueDate: string;               // Payment due date (day of month)
  monthlyInterestAmount?: number; // Override calculated interest
}
```

#### OptimizationResult Interface

```typescript
interface OptimizationResult {
  allocations: CardRecommendation[];
  totalAvailableForDebt: number;
  totalMinPayments: number;
  remainingCash: number;
  strategyUsed: PaymentStrategy;
  isValid: boolean;
  warnings: string[];
  projections: ProjectionPoint[];
}
```

## Project Structure

```
DebtCrusher/
├── components/          # React UI components
│   ├── BudgetInput.tsx
│   ├── CardInput.tsx
│   ├── CardModal.tsx
│   ├── DebtsTable.tsx
│   ├── Header.tsx
│   ├── PaymentAllocationsTable.tsx
│   ├── PlanStatus.tsx
│   └── StrategyResults.tsx
├── services/            # Core business logic
│   ├── db.ts           # Database service layer
│   ├── lmStudio.ts     # LLM integration
│   └── solver.ts       # Optimization algorithms
├── data/               # Data persistence
│   └── db.json         # JSON database
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── vite.config.ts      # Build configuration
└── package.json        # Project metadata
```

## Development

### Key Components

#### Solver Service ([services/solver.ts](services/solver.ts))

Implements deterministic optimization algorithms:
- `calculateAllocations()`: Main allocation engine
- `generateProjections()`: Multi-month simulation
- Interest calculation with compound growth
- Strategy-specific payment distribution

#### LM Studio Service ([services/lmStudio.ts](services/lmStudio.ts))

Handles AI-powered recommendations:
- Prompt engineering for financial optimization
- JSON response parsing and validation
- Strategy compliance checking
- Automatic fallback mechanisms

#### Database Service ([services/db.ts](services/db.ts))

Manages data persistence:
- Asynchronous read/write operations
- State synchronization
- Error handling and recovery

### Adding New Strategies

To implement a custom debt repayment strategy:

1. Update `PaymentStrategy` type in [types.ts](types.ts)
2. Add strategy logic in [services/solver.ts](services/solver.ts):

```typescript
case 'custom':
  // Implement custom sorting/allocation logic
  const customSorted = [...cards].sort((a, b) => {
    // Your comparison logic
  });
  // Distribution logic...
  break;
```

3. Add UI option in [components/Header.tsx](components/Header.tsx)

### Running Tests

Currently, the project uses manual testing. Planned additions:
- Unit tests for optimization algorithms
- Integration tests for LLM service
- E2E tests for user workflows

## Technical Implementation

### Interest Calculation

Monthly interest is calculated using the standard credit card formula:

```
Monthly_Interest = (Balance × APR) / 12
New_Balance = Previous_Balance - Payment + Monthly_Interest
```

### Credit Utilization Tracking

```
Utilization_Ratio = (Current_Balance / Credit_Limit) × 100
Warning_Threshold = 30%  // Industry standard for credit score impact
```

### Budget Deficit Handling

When `Σ MinPayments > Available_Budget`:
- System marks plan as invalid
- Generates critical warning
- Still allocates payments proportionally for visibility
- Recommends budget adjustment

### LLM Constraint Validation

The system validates LLM responses against hard constraints:
1. Sum of allocations ≤ available budget
2. Each allocation ≥ respective minimum payment
3. Each allocation ≤ respective card balance
4. Strategy adherence (statistical validation)

**Validation Metrics**:
- Avalanche: Correlation between extra payments and APR
- Snowball: Highest extra payment on smallest balance
- Even: Standard deviation of extra payments ≤ 10% of mean

## Performance Considerations

- **Calculation Complexity**: O(n log n) for sorted strategies, O(n) for even distribution
- **Projection Complexity**: O(m × n) where m = months, n = cards
- **Memory Usage**: O(m × n) for storing projection history
- **UI Updates**: Debounced at 500ms to prevent excessive recalculation

## Future Enhancements

- [ ] CSV/PDF export of payment schedules
- [ ] Multi-user support with authentication
- [ ] Cloud-based data synchronization
- [ ] Mobile application (React Native)
- [ ] Payment reminder notifications
- [ ] Historical tracking and analytics
- [ ] Integration with banking APIs
- [ ] Machine learning-based spending predictions
- [ ] Support for other debt types (student loans, mortgages)

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript strict mode guidelines
- Maintain type safety across all modules
- Document complex algorithms with comments
- Keep functions pure where possible
- Add JSDoc comments for public APIs

## License

This project is available for educational and personal use. For commercial applications, please contact the author.

## Citation

If you use DebtCrusher in academic research, please cite:

```bibtex
@software{debtcrusher2026,
  title={DebtCrusher: An Intelligent Credit Card Debt Optimization Platform},
  author={Mohamed Elrefaiy},
  year={2026},
  url={https://github.com/melrefaiy2018/DebtCrusher},
  version={0.0.0}
}
```

## Acknowledgments

- Debt avalanche and snowball methodologies based on established financial planning practices
- LM Studio for providing local LLM infrastructure
- React and TypeScript communities for excellent tooling
- Recharts for visualization capabilities

## Contact

For questions, suggestions, or collaboration opportunities:
- GitHub Issues: [https://github.com/melrefaiy2018/DebtCrusher/issues](https://github.com/melrefaiy2018/DebtCrusher/issues)
- Email: melrefaiy@utexas.edu

---

**Disclaimer**: This software is provided for informational purposes only and does not constitute financial advice. Users should consult with qualified financial advisors before making significant financial decisions.
