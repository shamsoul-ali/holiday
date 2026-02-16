#!/usr/bin/env python3
"""
Demo Claude CLI - Works without API key
Usage: python3 claude_demo.py
"""

import os
import sys
import random

def main():
    print("🤖 Claude Demo CLI - Interactive Chat")
    print("Note: This is a demo version that simulates Claude responses")
    print("Type 'quit' or 'exit' to end the conversation")
    print("Type 'clear' to start a new conversation")
    print("-" * 50)
    
    # Demo responses
    demo_responses = [
        "Hello! I'm Claude, an AI assistant. How can I help you today?",
        "That's an interesting question! Let me think about that...",
        "I'd be happy to help you with that!",
        "Great question! Here's what I think...",
        "I understand what you're asking. Let me provide some insights...",
        "That's a fascinating topic! Here's my perspective...",
        "I appreciate you asking that. Here's what I can tell you...",
        "Excellent question! Let me break this down for you...",
        "I'm here to help! What would you like to know more about?",
        "That's a thoughtful question. Here's my analysis..."
    ]
    
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
            
            # Simulate thinking time
            import time
            time.sleep(1)
            
            # Generate a demo response
            if "hello" in user_input.lower() or "hi" in user_input.lower():
                response = "Hello! I'm Claude, your AI assistant. How can I help you today?"
            elif "help" in user_input.lower():
                response = "I'm here to help! I can assist with questions, provide information, or just chat. What would you like to know?"
            elif "weather" in user_input.lower():
                response = "I can't check real-time weather, but I can help you plan for different weather conditions when traveling!"
            elif "travel" in user_input.lower() or "holiday" in user_input.lower():
                response = "I love talking about travel! I can help you plan trips, suggest destinations, or discuss travel tips. What's your dream destination?"
            elif "?" in user_input:
                response = random.choice(demo_responses) + " " + user_input.replace("?", " is something I'd be happy to discuss further!")
            else:
                response = random.choice(demo_responses)
            
            print(f"\n🤖 Claude: {response}")
            
            # Update conversation history
            conversation_history.append({"role": "user", "content": user_input})
            conversation_history.append({"role": "assistant", "content": response})
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            continue

if __name__ == "__main__":
    main()

