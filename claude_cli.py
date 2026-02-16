#!/usr/bin/env python3
"""
Simple Claude CLI - Interactive chat with Claude
Usage: python claude_cli.py
"""

import os
import sys
from anthropic import Anthropic

def main():
    # Check for API key
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ Error: ANTHROPIC_API_KEY environment variable not set")
        print("Please set your Anthropic API key:")
        print("export ANTHROPIC_API_KEY='your-api-key-here'")
        return
    
    # Initialize Anthropic client
    client = Anthropic(api_key=api_key)
    
    print("🤖 Claude CLI - Interactive Chat")
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
            
            # Build messages for Claude
            messages = conversation_history + [{"role": "user", "content": user_input}]
            
            print("🤖 Claude is thinking...")
            
            # Get response from Claude
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                messages=messages
            )
            
            claude_response = response.content[0].text
            print(f"\n🤖 Claude: {claude_response}")
            
            # Update conversation history
            conversation_history.append({"role": "user", "content": user_input})
            conversation_history.append({"role": "assistant", "content": claude_response})
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
