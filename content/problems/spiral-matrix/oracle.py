def spiralOrder(matrix):
    rows, cols = len(matrix), len(matrix[0])
    seen = [[False] * cols for _ in range(rows)]
    moves = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    i = j = d = 0
    out = []
    for _ in range(rows * cols):
        out.append(matrix[i][j])
        seen[i][j] = True
        ni, nj = i + moves[d][0], j + moves[d][1]
        if not (0 <= ni < rows and 0 <= nj < cols and not seen[ni][nj]):
            d = (d + 1) % 4
            ni, nj = i + moves[d][0], j + moves[d][1]
        i, j = ni, nj
    return out
