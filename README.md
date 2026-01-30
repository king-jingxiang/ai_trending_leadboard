# AI Trending Leaderboard

A platform to track, analyze, and visualize AI-related GitHub trending projects.

## Project Structure

- `crawler/`: Python project for fetching data from GitHub and analyzing it with Gemini.
- `web/`: React + Vite frontend for visualizing the data.
- `.github/workflows/`: GitHub Actions for automation.

## Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Cloudflare R2 or S3 compatible storage
- GitHub Token
- Gemini API Key

### Crawler (Data Collection)

1.  Navigate to `crawler/`:
    ```bash
    cd crawler
    pip install -r requirements.txt
    ```

2.  Set up environment variables (`.env`):
    ```env
    GITHUB_TOKEN=your_github_token
    GEMINI_API_KEY=your_gemini_key
    S3_ENDPOINT_URL=...
    S3_ACCESS_KEY_ID=...
    S3_SECRET_ACCESS_KEY=...
    S3_BUCKET_NAME=ai-trending-data
    ```

3.  Run the crawler:
    ```bash
    python -m crawler.main
    ```

### Web UI (Visualization)

1.  Navigate to `web/`:
    ```bash
    cd web
    npm install
    ```

2.  Run development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

## Deployment

- **Data**: Automatically runs daily via GitHub Actions (`.github/workflows/crawler.yml`) and saves JSON to S3/R2.
- **Frontend**: Automatically deploys to GitHub Pages on push to main (`.github/workflows/deploy-web.yml`).

## Configuration

Configure the S3 bucket URL in `web/src/lib/api.ts` or via `VITE_DATA_URL` environment variable during build.
