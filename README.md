# 📰 News Detector Bot

A multi-source Python news monitoring bot that fetches, filters, stores, and tracks trending news articles in real time.

## 🚀 Features

- 🔍 Fetches news from multiple RSS sources (BBC, CNN, Reuters, Hacker News)
- 🕒 Filters articles from the last 24 hours
- 📊 Saves top 10 trending news in:
  - TXT
  - JSON
  - CSV
- 📈 Tracks trending headlines across refresh cycles
- 🔔 Desktop notifications for new top news
- 🧾 Daily merged summary generation
- 🖥️ Optional GUI display using Tkinter

---

## 🛠️ Tech Stack

- Python 3
- feedparser
- plyer
- tabulate
- colorama
- tkinter

---

## 📂 Project Structure

News Detector Bot/
├── main.py
├── News/
│ └── (auto-generated files)
├── requirements.txt
└── .gitignore

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/news-detector-bot.git
cd news-detector-bot

### 2️⃣ Create virtual environment
bash
Copy code
python -m venv venv

### 3️⃣ Activate virtual environment
Windows

bash
Copy code
venv\Scripts\activate

### 4️⃣ Install dependencies
bash
Copy code
pip install -r requirements.txt

### ▶️ Run the Bot
bash
Copy code
python main.py
The bot refreshes every 30 minutes and stores outputs automatically.

📌 Future Improvements
-Web dashboard (Streamlit / Flask)
-News categorization using NLP
-Sentiment analysis
-Email or WhatsApp alerts
-Docker support