# LexiGuard AI: Intelligent Legal & Compliance for Banking

LexiGuard AI is a cutting-edge artificial intelligence solution designed to revolutionize legal and compliance operations within the banking industry. It provides a comprehensive suite of tools for automated document drafting and review, real-time compliance and risk flagging, and an unassailable audit trail with data lineage. The platform emphasizes clear governance, a thorough human review process, robust reporting controls, and efficient investigation workflow management. At its core, LexiGuard AI ensures data classification and minimization, operating within a well-defined AI Governance Operating Model to maintain trust, security, and regulatory adherence. The frontend is a visually stunning, intuitive web application, built on Cloudflare's edge network, ensuring lightning-fast performance and global availability.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/LexiGuard-20251015-034259)

## Key Features

*   **Automated Drafting & Review**: AI-assisted creation and review of legal documents, identifying discrepancies and facilitating collaboration.
*   **Compliance & Risk Flagging**: Real-time identification and flagging of non-compliant clauses and proactive risk management.
*   **Evidence and Audit Trail Architecture**: Secure, immutable records of all system activities, document changes, and AI interactions with full data lineage and comprehensive logging.
*   **Clear Governance**: Defined policies and procedures for AI usage and data handling.
*   **Thorough Review Process**: Human-in-the-loop mechanisms to ensure accuracy and legal soundness of AI-generated content.
*   **Reporting Controls**: Robust, customizable dashboards and reports on compliance metrics, risk exposure, and operational efficiency.
*   **Monitoring of Investigation Workflow and Case Management**: Comprehensive system for managing legal investigations, task assignment, and progress tracking.
*   **Data Classification and Minimization**: Policies and tools to categorize and reduce sensitive data exposure.
*   **AI Governance Operating Model**: A well-defined framework for managing AI models, data, and ethical considerations.

## Technology Stack

LexiGuard AI is built with a modern, high-performance stack:

**Frontend:**
*   **React 18**: A declarative, component-based JavaScript library for building user interfaces.
*   **Vite**: A fast development build tool for modern web projects.
*   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
*   **Shadcn/UI**: A collection of beautifully designed, accessible, and customizable React components built with Radix UI and Tailwind CSS.
*   **Framer Motion**: A production-ready motion library for React to power animations.
*   **Zustand**: A small, fast, and scalable bear-bones state-management solution.
*   **React Router DOM**: Declarative routing for React applications.
*   **Lucide React**: A collection of beautiful and customizable open-source icons.
*   **Recharts**: A composable charting library built on React components.

**Backend (Cloudflare Worker):**
*   **Hono**: A small, simple, and ultrafast web framework for the edge.
*   **Cloudflare Agents SDK**: For stateful agent management with persistent Durable Objects.
*   **Model Context Protocol (MCP) Client**: For real server integration and specialized tools.
*   **OpenAI SDK**: For AI model integration via Cloudflare AI Gateway.
*   **Durable Objects**: For persistent state management, conversation history, and custom data stores (e.g., `DocumentStore`, `AuditLog`, `ComplianceEngine`).

**Utilities:**
*   `clsx` & `tailwind-merge`: For constructing dynamic Tailwind CSS class strings.
*   `date-fns`: For date manipulation.
*   `zod`: For schema validation.
*   `react-hook-form`: For flexible and extensible forms with easy validation.
*   `immer`: For immutable state updates.
*   `uuid`: For generating unique IDs.

## Setup and Installation

To get LexiGuard AI up and running on your local machine, follow these steps:

### Prerequisites

*   **bun**: Ensure you have `bun` installed. If not, you can install it from [bun.sh](https://bun.sh/).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone [repositoryUrl]
    cd lexiguard-ai
    ```

2.  **Install dependencies**:
    ```bash
    bun install
    ```

### Environment Variables

The application requires certain environment variables for the Cloudflare Worker. Create a `.dev.vars` file in the root of your project (or configure them in `wrangler.toml` for deployment):

```
CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
CF_AI_API_KEY="your-cloudflare-ai-gateway-api-key"
SERPAPI_KEY="your-serpapi-key" # Required for web search tool
OPENROUTER_API_KEY="your-openrouter-api-key" # If using OpenRouter models
```
**Note**: Replace placeholders with your actual keys and IDs. `CF_AI_BASE_URL` and `CF_AI_API_KEY` are crucial for AI functionality.

## Development

To run the application in development mode:

```bash
bun dev
```

This will start the Vite development server and the Cloudflare Worker, accessible typically at `http://localhost:3000`. The frontend will automatically reload on changes.

## Usage

Upon starting the application, you will be directed to a mock login page. Use mock credentials (e.g., `user`/`password`) to authenticate. After successful login, you will land on the LexiGuard AI Dashboard, providing an overview of compliance status, active cases, and quick links to various modules:

*   **Dashboard**: High-level overview of legal and compliance landscape.
*   **Document Drafting & Review**: AI-assisted document creation and review.
*   **Compliance & Risk Management**: Configure rules and address flagged issues.
*   **Audit & Evidence Trail**: Inspect historical data and actions.
*   **Case Management**: Oversee legal investigations.
*   **Reporting & Analytics**: Data-driven insights and customizable reports.
*   **Settings & AI Governance**: Platform configuration, AI models, and user permissions.

**IMPORTANT**: There is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period.

## Deployment

LexiGuard AI is designed for deployment on Cloudflare Workers.

1.  **Build the project**:
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare Workers**:
    Ensure you are logged into Cloudflare Wrangler CLI (`bunx wrangler login`) and have your `wrangler.toml` configured with your Cloudflare account details and environment variables.

    ```bash
    bun run deploy
    ```

    This command will build your project and deploy it to your Cloudflare Workers account.

Alternatively, you can use the Cloudflare Deploy button:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/LexiGuard-20251015-034259)