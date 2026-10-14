def solveNQueens(n):
    out, cols, diag, anti, place = [], set(), set(), set(), []
    def dfs(r):
        if r == n:
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in place])
            return
        for c in range(n):
            if c in cols or r - c in diag or r + c in anti:
                continue
            cols.add(c); diag.add(r - c); anti.add(r + c); place.append(c)
            dfs(r + 1)
            cols.remove(c); diag.remove(r - c); anti.remove(r + c); place.pop()
    dfs(0)
    return out
