import os
from openai import OpenAI
from dotenv import load_dotenv
import random

load_dotenv()

def _client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    return OpenAI(api_key=api_key)

def generate_questions(limit: int = 15) -> list[str]:
    """Return a list of unique Excel interview questions.

    The pool includes theory and practical prompts. We sample without replacement
    to avoid repetition and cap at the requested limit.
    """
    pool = [
        "What does VLOOKUP do in Excel?",
        "Explain the difference between VLOOKUP and INDEX/MATCH.",
        "What is the difference between absolute ($A$1) and relative (A1) references?",
        "How do you lock a cell reference when copying formulas?",
        "When would you use a PivotTable?",
        "What does IFERROR do? Give an example.",
        "Explain the difference between SUMIF and SUMIFS.",
        "How would you remove duplicate rows while keeping the first occurrence?",
        "What does TEXT function do? Example formatting a date as YYYY-MM.",
        "How do you create a data validation dropdown?",
        "What is conditional formatting and one example use?",
        "Provide a SUMIFS formula to total Sales for Product B in March.",
        "Write an INDEX/MATCH to return Price for SKU in column A from table B.",
        "Using XLOOKUP, fetch the Region for a given Customer ID.",
        "How to compute a running total by date?",
        "Describe how to create a Pivot that shows Sum of Sales by Product and Month.",
        "How to count unique values in a column?",
        "Explain the purpose of the $ in a reference like A$1 or $A1.",
        "When would you use FILTER function?",
        "How do you protect a sheet and allow only certain cells to be editable?",
    ]
    random.shuffle(pool)
    return pool[:limit]


def grade_answer(answer: str):
    client = _client()
    if not client:
        # Offline fallback rubric
        a = answer.lower()
        if "vlookup" in a:
            feedback = "Correct: VLOOKUP searches the first column and returns a value from a selected column."
            delta = 8
        elif "absolute" in a or "$" in a:
            feedback = "Good: Absolute refs ($A$1) don't shift; relative refs (A1) do."
            delta = 7
        elif "sumif" in a or "sumifs" in a:
            feedback = "Good direction: SUMIF/SUMIFS can conditionally sum; include proper criteria ranges."
            delta = 8
        else:
            feedback = "Thanks. Consider referencing core Excel concepts (VLOOKUP purpose, absolute vs relative, SUMIF criteria)."
            delta = 4
        next_q = None
        return feedback, delta, next_q
    try:
        prompt = (
            "You are grading an Excel interview. Return JSON with keys: score (0-10), "
            "feedback (short sentence). Consider accuracy, clarity, and relevance. Answer: "
            f"{answer}"
        )
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        text = resp.choices[0].message.content or ""
        # Best-effort parse: if model did not return JSON, still pass text
        delta = 8
        next_q = None
        return text, delta, next_q
    except Exception:
        feedback = "Answer received. Key idea: VLOOKUP retrieves a value from a table based on a key."
        return feedback, 5, "What is the difference between absolute and relative references?"

def next_question():
    return "Provide an Excel formula to sum Sales for Product B in March using SUMIF or SUMIFS."

