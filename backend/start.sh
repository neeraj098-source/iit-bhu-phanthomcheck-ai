#!/bin/bash
echo "Installing tesseract..."
which tesseract || apt-get install tesseract-ocr -y 2>/dev/null || \
  brew install tesseract 2>/dev/null || echo "Install tesseract manually"
echo "Starting PhantomCheck AI backend..."
source venv/bin/activate 2>/dev/null || python3 -m venv venv && \
  source venv/bin/activate
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 --host 0.0.0.0
