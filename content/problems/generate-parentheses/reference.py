def generateParenthesis(n):
    out = []
    def dfs(path, opened, closed):
        if len(path) == 2 * n:
            out.append(path)
            return
        if opened < n:
            dfs(path + "(", opened + 1, closed)
        if closed < opened:
            dfs(path + ")", opened, closed + 1)
    dfs("", 0, 0)
    return out
