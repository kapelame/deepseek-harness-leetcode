def longestValidParentheses(s):
    def valid(t):
        depth = 0
        for ch in t:
            depth += 1 if ch == "(" else -1
            if depth < 0:
                return False
        return depth == 0
    best = 0
    for i in range(len(s)):
        for j in range(i + 2, len(s) + 1, 2):
            if valid(s[i:j]):
                best = max(best, j - i)
    return best
