#!/usr/bin/env python3
"""
Simple Claude CLI - Interactive chat with Claude
Usage: python3 claude_simple.py
"""

import os
import sys
from anthropic import Anthropic

def main():
    print("🤖 Claude CLI - Starting...")
    
    # Check for API key
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ Error: ANTHROPIC_API_KEY environment variable not set")
        print("Please set your Anthropic API key:")
        print("export ANTHROPIC_API_KEY='your-api-key-here'")
        return
    
    print("✅ API key found!")
    
    try:
        # Initialize Anthropic client
        client = Anthropic(api_key=api_key)
        print("✅ Anthropic client initialized!")
    except Exception as e:
        print(f"❌ Error initializing client: {e}")
        return
    
    print("\n🤖 Claude CLI - Interactive Chat")
    print("Type 'quit' or 'exit' to end the conversation")
    print("Type 'clear' to start a new conversation")
    print("-" * 50)
    
    conversation_history = []
    
    while True:
        try:
            # Get user input
            user_input = input("\n👤 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
            elif user_input.lower() == 'clear':
                conversation_history = []
                print("🧹 Conversation cleared!")
                continue
            elif not user_input:
                continue
            
            print("🤖 Claude is thinking...")
            
            try:
                # Get response from Claude
                response = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1000,
                    messages=[{"role": "user", "content": user_input}]
                )
                
                claude_response = response.content[0].text
                print(f"\n🤖 Claude: {claude_response}")
                
            except Exception as e:
                print(f"❌ Error getting response: {e}")
                continue
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            continue

if __name__ == "__main__":
    main()
