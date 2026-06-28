import os
import sys
import urllib.request
import urllib.error
import json
from dotenv import load_dotenv
from openai import OpenAI, APIError, APIConnectionError, RateLimitError

load_dotenv()

API_KEY = os.getenv("LOCAL_API_KEY")
BASE_URL = os.getenv("LOCAL_BASE_URL")
MODEL = os.getenv("LOCAL_MODEL_NAME")

# 前端调试服务器地址，与 chat-ui/vite.config.ts 中的 /api/debug 代理对应
DEBUG_API_URL = os.getenv("DEBUG_API_URL", "http://localhost:3001/api/debug/log")
ENABLE_DEBUG_LOG = os.getenv("ENABLE_DEBUG_LOG", "true").lower() in ("1", "true", "yes")

# --------------------------------------------------------------------------- #
# 使用 OpenAI Responses API 实现的多轮对话 CLI
# 对话上下文由 OpenAI 通过 previous_response_id 自动维护，无需本地 messages
# 同时把运行日志推送到前端 DebugPage 的终端调试界面
# --------------------------------------------------------------------------- #

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL,
)


def debug_log(content: str, log_type: str = "stdout", silent: bool = False):
    """把日志内容推送到前端调试服务器，同时在本地终端打印。"""
    if not silent:
        print(content)

    if not ENABLE_DEBUG_LOG:
        return

    try:
        payload = json.dumps({"content": content, "type": log_type}).encode("utf-8")
        req = urllib.request.Request(
            DEBUG_API_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=2):
            pass
    except Exception:
        # 调试服务器未启动时不影响主流程
        pass


def stream_response(user_input: str, previous_response_id: str | None = None):
    """流式调用 responses API，逐字输出并返回本次 response id。"""
    debug_log(f"[请求] model={MODEL} previous_response_id={previous_response_id}", "info", silent=True)

    try:
        stream = client.responses.create(
            model=MODEL,
            input=user_input,
            previous_response_id=previous_response_id,
            stream=True,
            reasoning={"effort":"none"}
        )
    except (APIConnectionError, RateLimitError, APIError) as e:
        debug_log(f"[请求失败] {type(e).__name__}: {e}", "error")
        return previous_response_id

    print("Assistant: ", end="", flush=True)

    full_text = ""
    thinking_text = ""
    current_response_id = previous_response_id
    thinking_started = False
    content_started = False

    for event in stream:
        # 把每个 event 的完整 JSON 推送到前端调试界面
        try:
            event_json = event.model_dump_json()
        except AttributeError:
            event_json = json.dumps(str(event), ensure_ascii=False)
        debug_log(f"[event] type={event.type} json={event_json}", "info", silent=True)

        # 正式的回复文本增量
        if event.type == "response.output_text.delta":
            delta = event.delta
            if not content_started:
                content_started = True
                # 如果前面有思考内容，先换行再输出正式回复
                if thinking_started:
                    print("\n回复：", end="", flush=True)
            print(delta, end="", flush=True)
            full_text += delta

        # 某些模型/平台会在 reasoning_content 中返回思考过程
        elif event.type == "response.reasoning_content_item.delta" or \
             event.type == "response.reasoning.delta":
            delta = event.delta
            if not thinking_started:
                thinking_started = True
                print("\n思考：", end="", flush=True)
            print(delta, end="", flush=True)
            thinking_text += delta

        # 获取 response id 用于下一轮上下文衔接
        elif event.type == "response.created":
            if hasattr(event, "response") and event.response:
                current_response_id = event.response.id
        elif event.type == "response.completed":
            if hasattr(event, "response") and event.response:
                current_response_id = event.response.id

    print()  # 换行

    # 流式结束后，一次性把完整回复推送到前端调试界面
    # 本地终端已经实时打印过了
    if thinking_text:
        debug_log(f"[思考] {thinking_text}", "info", silent=True)
    debug_log(f"Assistant: {full_text}", "stdout", silent=True)

    # 兜底：如果流中没有拿到 id，再发一次非流式请求获取
    if current_response_id is None and full_text:
        try:
            fallback = client.responses.create(
                model=MODEL,
                input=user_input,
                previous_response_id=previous_response_id,
            )
            current_response_id = fallback.id
        except Exception as e:
            debug_log(f"[警告] 无法获取 response id，下一轮将丢失上下文: {e}", "error")

    return current_response_id


def non_stream_response(user_input: str, previous_response_id: str | None = None):
    """非流式调用 responses API，直接返回完整结果与 response id。"""
    debug_log(f"[请求] model={MODEL} previous_response_id={previous_response_id}", "info", silent=True)

    try:
        response = client.responses.create(
            model=MODEL,
            input=user_input,
            previous_response_id=previous_response_id,
        )
    except (APIConnectionError, RateLimitError, APIError) as e:
        debug_log(f"[请求失败] {type(e).__name__}: {e}", "error")
        return previous_response_id

    text = response.output_text
    print(f"Assistant: {text}")
    debug_log(f"Assistant: {text}", "stdout", silent=True)
    return response.id


def print_help():
    help_text = """
可用命令：
  /exit    退出对话
  /clear   清空当前会话上下文
  /history 显示当前已维持的轮数
  /help    显示本帮助
    """.strip()
    print(help_text)
    debug_log(help_text, "info", silent=True)


def main():
    debug_log(f"[启动] Model: {MODEL}", "info")
    debug_log("[启动] 使用 Responses API 进行多轮对话。输入 /help 查看命令。", "info")

    previous_response_id: str | None = None
    turn_count = 0
    use_stream = True  # 默认启用流式输出

    while True:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            debug_log("[退出] 用户中断", "info")
            print("\n再见！")
            break

        if not user_input:
            continue

        # 本地 input() 已经显示了 "You: xxx"，这里只推送到前端，避免终端重复打印
        debug_log(f"You: {user_input}", "stdout", silent=True)

        # 命令处理
        if user_input == "/exit":
            debug_log("[退出] 用户输入 exit", "info")
            print("再见！")
            break
        elif user_input == "/clear":
            previous_response_id = None
            turn_count = 0
            print("[会话上下文已清空]")
            debug_log("[会话上下文已清空]", "info", silent=True)
            continue
        elif user_input == "/history":
            msg = f"[当前已维持 {turn_count} 轮上下文]"
            print(msg)
            debug_log(msg, "info", silent=True)
            continue
        elif user_input == "/help":
            print_help()
            continue

        # 调用模型
        try:
            if use_stream:
                previous_response_id = stream_response(user_input, previous_response_id)
            else:
                previous_response_id = non_stream_response(user_input, previous_response_id)
            turn_count += 1
            debug_log(f"[状态] 当前已维持 {turn_count} 轮上下文", "info", silent=True)
        except Exception as e:
            debug_log(f"[错误] {type(e).__name__}: {e}", "error")


if __name__ == "__main__":
    main()
