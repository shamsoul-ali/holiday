#!/usr/bin/env python3
"""
Environment Comparison Script
Run this in both projects to compare setups
"""

import sys
import os
import subprocess

def check_environment():
    print("🔍 Environment Analysis")
    print("=" * 50)
    
    # Python info
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Path: {sys.path[0]}")
    
    # Check virtual environment
    venv = os.getenv('VIRTUAL_ENV')
    if venv:
        print(f"Virtual Environment: {venv}")
    else:
        print("Virtual Environment: None")
    
    # Check API key
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if api_key:
        print(f"API Key: {api_key[:20]}...")
    else:
        print("API Key: Not set")
    
    # Try to import anthropic
    try:
        import anthropic
        print(f"Anthropic SDK Version: {anthropic.__version__}")
        
        # Check available methods
        client = anthropic.Anthropic(api_key=api_key or "dummy")
        methods = [attr for attr in dir(client) if not attr.startswith('_')]
        print(f"Available methods: {methods}")
        
    except ImportError as e:
        print(f"Anthropic SDK: Not installed - {e}")
    except Exception as e:
        print(f"Anthropic SDK Error: {e}")
    
    print("=" * 50)

if __name__ == "__main__":
    check_environment()

