from core.load_env import get_openai_client

client = get_openai_client()


# def get_news_summary(news_content: str):
    
#     response = client.chat.completions.create(
#         model="gpt-4o",
#         messages=[
#             {"role": "system", "content": "Summarize trading news clearly"},
#             {"role": "user", "content": news_content}
#         ]
#     )

#     return response.choices[0].message.content.strip()


def get_news_summary(news_content: str):

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional financial news analyst. "
                    "Your task is to generate a concise, structured summary "
                    "of a complete news article related to financial markets. "
                    "Focus only on key trading-relevant information such as: "
                    "main event, companies/assets involved, market impact, "
                    "investor sentiment, and potential short-term implications. "
                    "Ignore fluff and commentary."
                )
            },
            {
                "role": "user",
                "content": (
                    "Below is the full news article. "
                    "Summarize it clearly in 3–5 sentences, "
                    "highlighting trading-relevant insights.\n\n"
                    f"{news_content}"
                )
            }
        ],
        temperature=0.3
    )

    return response.choices[0].message.content.strip()