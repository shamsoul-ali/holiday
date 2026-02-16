#!/usr/bin/env python3
"""
Setup Claude API Key
"""

import os
import subprocess

def setup_claude():
    print("🔧 Claude API Setup")
    print("=" * 50)
    
    # Check current API key
    current_key = os.getenv('ANTHROPIC_API_KEY')
    if current_key:
        print(f"Current API key: {current_key[:20]}...")
        print("⚠️  This key appears to be invalid")
    else:
        print("❌ No API key found")
    
    print("\n📋 To get a new API key:")
    print("1. Go to https://console.anthropic.com/")
    print("2. Sign in to your account")
    print("3. Go to API Keys section")
    print("4. Create a new API key")
    print("5. Copy the new key")
    
    print("\n🔑 To set your new API key, run:")
    print("export ANTHROPIC_API_KEY='your-new-api-key-here'")
    
    print("\n💾 To make it permanent, add to ~/.zshrc:")
    print("echo \"export ANTHROPIC_API_KEY='your-new-api-key-here'\" >> ~/.zshrc")
    
    print("\n🧪 After setting the key, test with:")
    print("python3 test_claude.py")

if __name__ == "__main__":
    setup_claude()

