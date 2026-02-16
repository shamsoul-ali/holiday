#!/usr/bin/env python3
"""
Test Claude API Connection
"""

import os
from anthropic import Anthropic

def test_claude():
    print("🔍 Testing Claude API Connection...")
    
    # Check API key
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ No API key found!")
        return False
    
    print(f"✅ API key found: {api_key[:20]}...")
    
    try:
        # Initialize client
        client = Anthropic(api_key=api_key)
        print("✅ Client initialized successfully")
        
        # Test with a simple request
        print("🔄 Testing API call...")
        response = client.completions.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens_to_sample=50,
            prompt="Human: Say 'Hello, I am working!' in one sentence.\n\nAssistant:"
        )
        
        print(f"✅ Success! Claude says: {response.completion}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_claude()

