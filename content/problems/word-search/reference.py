def exist(board, word):
    rows, cols = len(board), len(board[0])
    def dfs(r, c, k):
        if board[r][c] != word[k]:
            return False
        if k == len(word) - 1:
            return True
        saved, board[r][c] = board[r][c], "#"
        found = any(0 <= nr < rows and 0 <= nc < cols and dfs(nr, nc, k + 1)
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)))
        board[r][c] = saved
        return found
    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))
