import json
import re
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.config import get_settings
from app.utils.rate_limiter import rate_limiter


def get_llm() -> ChatGroq:
    settings = get_settings()
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0.3,
        max_tokens=4096,
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=3, min=5, max=30),
    retry=retry_if_exception_type(Exception),
    reraise=True,
)
async def rate_limited_llm_call(
    system_prompt: str,
    user_prompt: str,
) -> str:
    await rate_limiter.acquire()
    llm = get_llm()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]
    response = await llm.ainvoke(messages)
    return response.content


def parse_json_response(text: str, fallback_key: str = "result") -> dict | list:
    """Try to parse JSON from LLM response with multiple fallback strategies."""
    # Strategy 1: direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strategy 2: extract from code fences
    pattern = r"```(?:json)?\s*\n?(.*?)\n?\s*```"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Strategy 3: find first { or [ block
    for start_char, end_char in [('{', '}'), ('[', ']')]:
        start = text.find(start_char)
        if start != -1:
            depth = 0
            for i in range(start, len(text)):
                if text[i] == start_char:
                    depth += 1
                elif text[i] == end_char:
                    depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        break

    # Fallback: wrap raw text
    return {fallback_key: text}
