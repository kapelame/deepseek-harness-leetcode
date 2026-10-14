def exist(board, word):
    rows, cols = len(board), len(board[0])
    paths = [[(r, c)] for r in range(rows) for c in range(cols) if board[r][c] == word[0]]
    for k in range(1, len(word)):
        nxt = []
        for path in paths:
            r, c = path[-1]
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in path and board[nr][nc] == word[k]:
                    nxt.append(path + [(nr, nc)])
        paths = nxt
    return bool(paths)
