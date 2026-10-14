import itertools
def generateParenthesis(n):
    def valid(s):
        depth = 0
        for ch in s:
            depth += 1 if ch == "(" else -1
            if depth < 0:
                return False
        return depth == 0
    return ["".join(p) for p in itertools.product("()", repeat=2 * n) if valid(p)]
