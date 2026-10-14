def generate(numRows):
    rows = [[1]]
    for _ in range(numRows - 1):
        prev = rows[-1]
        rows.append([1] + [prev[j - 1] + prev[j] for j in range(1, len(prev))] + [1])
    return rows
