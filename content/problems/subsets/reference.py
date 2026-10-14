def subsets(nums):
    out, path = [], []
    def dfs(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            dfs(i + 1)
            path.pop()
    dfs(0)
    return out
