def letterCombinations(digits):
    keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    if not digits:
        return []
    out, path = [], []
    def dfs(i):
        if i == len(digits):
            out.append("".join(path))
            return
        for ch in keys[digits[i]]:
            path.append(ch)
            dfs(i + 1)
            path.pop()
    dfs(0)
    return out
