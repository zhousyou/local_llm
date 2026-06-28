
from openai import OpenAI
from dotenv import load_dotenv
import os



load_dotenv()
API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
model = 'qwen3.7-plus'

client = OpenAI(
        api_key= API_KEY,
        base_url=BASE_URL
    )

def stream_response(user_input, response_id):
    
    stream = client.responses.create(
        model = model,
        input = user_input,
        previous_response_id=response_id,
        stream = True
    )

    print("Assistant:", end = '', flush=True)
    current_response_id = response_id

    for event in stream:
        if event.type == "response.output_item.added":
            if event.item.type == "reasoning":
                print("\nStarting Thinking:\n")
            elif event.item.type == "message":
                print("\nStarting Answering:\n")
        elif event.type == "response.reasoning_summary_text.delta":
            print(event.delta, end = '', flush= True)
        elif event.type == "response.output_text.delta":
            print(event.delta, end = '', flush=True)
        elif event.type == "response.completed":
            current_response_id = event.response.id
    print()
    return current_response_id

def print_help():
    print(
        """
可用命令：
    /exit   退出对话
    /clear  清空当前对话上下文
    /history显示当前已维持的轮数
    /help   显示帮助
        """.strip()
    )


def main():
    print(f"Model:{model}")
    print(f"与{model}模型进行多轮对话，输入/help查看命令。\n")

    response_id = None
    turn_count = 0
    # use_stream = True

    while True:
        usr_input = input("You: ").strip()
        if not usr_input:
            continue
        if usr_input == "/exit":
            print("ByeBye")
            break
        elif usr_input == "/clear":
            turn_count = 0
            response_id = None
            print("会话上下文已清空")
            continue
        elif usr_input == "/history":
            print(f"当前已经维持{turn_count}轮上下文")
            continue
        elif usr_input == "/help":
            print_help()
            continue

        response_id = stream_response(usr_input, response_id)
        turn_count +=1

if __name__ == "__main__":
    main()
        

