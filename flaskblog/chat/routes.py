from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from openai import APIConnectionError, RateLimitError, AuthenticationError, APIStatusError
from flaskblog.chat.service import ask_llm

chat = Blueprint('chat', __name__)
conversations = {}

@chat.route("/chat/message", methods=["POST"])
@login_required
def message():
    data = request.get_json(silent=True) or {}
    text = (data.get("message") or "").strip()
    if not text:
        return jsonify(error="Message cannot be empty."), 400
    if len(text) > 2000:
        return jsonify(error="Message too long (max 2000 characters)."), 400

    history = conversations.setdefault(current_user.id, [])
    history.append({"role": "user", "content": text})
    try:
        reply = ask_llm(history, current_user)
    except RateLimitError:
        history.pop(); return jsonify(error="Too many requests. Try again shortly."), 429
    except AuthenticationError:
        history.pop(); return jsonify(error="Server API key problem."), 500
    except APIConnectionError:
        history.pop(); return jsonify(error="Could not reach the model provider."), 502
    except APIStatusError as e:
        history.pop(); return jsonify(error=f"Provider error ({e.status_code})."), 502

    history.append({"role": "assistant", "content": reply})
    return jsonify(reply=reply)

@chat.route("/chat/reset", methods=["POST"])
@login_required
def reset():
    conversations.pop(current_user.id, None)
    return jsonify(ok=True)