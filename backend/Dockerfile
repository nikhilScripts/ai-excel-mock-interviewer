FROM python:3.11-slim

# Environment for reliable, small images
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PATH="/home/appuser/.local/bin:$PATH"

WORKDIR /app

# Install runtime deps
COPY requirements.txt ./
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Add app source
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthcheck using python (no extra deps)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD ["python","-c","import urllib.request,sys;\n\
\ntry:\n\
    r=urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2);\n\
    sys.exit(0 if r.status==200 else 1)\n\
except Exception:\n\
    sys.exit(1)"]

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
