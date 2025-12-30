# Python backend for OpenAI API
FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY openai_backend_proxy.py .

# Expose port (Railway will set $PORT)
ENV PORT=8080
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:$PORT/health')"

# Start the application
CMD ["sh", "-c", "uvicorn openai_backend_proxy:app --host 0.0.0.0 --port ${PORT:-8080}"]

