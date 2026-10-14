def combinationSum2(candidates, target):
    candidates = sorted(candidates)
    out, path = [], []
    def dfs(start, remain):
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:
                break
            path.append(candidates[i])
            dfs(i + 1, remain - candidates[i])
            path.pop()
    dfs(0, target)
    return out
