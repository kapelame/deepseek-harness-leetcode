def partition(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
    out, path = [], []
    def dfs(i):
        if i == n:
            out.append(path[:])
            return
        for j in range(i, n):
            if pal[i][j]:
                path.append(s[i:j + 1])
                dfs(j + 1)
                path.pop()
    dfs(0)
    return out
