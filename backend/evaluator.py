from typing import Any, List


def evaluate_grid(grid: List[List[Any]]) -> int:
    """Very simple evaluator for PoC. Looks for a SUM or value in any cell.

    Rules:
    - If any cell starts with '=' we give base 10 points.
    - If a cell contains 'sum' (case-insensitive) give +10.
    - If there are numeric results totaling > 100 across grid, give +10.
    - Cap at 40.
    """
    score = 0
    has_formula = any(str(cell).strip().startswith('=') for row in grid for cell in row if cell is not None)
    if has_formula:
        score += 10
    has_sum = any('sum' in str(cell).lower() for row in grid for cell in row if cell is not None)
    if has_sum:
        score += 10
    total_numeric = 0
    for row in grid:
        for cell in row:
            try:
                total_numeric += float(cell)
            except Exception:
                pass
    if total_numeric > 100:
        score += 10
    # effort bonus
    filled = sum(1 for row in grid for cell in row if str(cell).strip())
    if filled > 10:
        score += 10
    return min(40, score)

