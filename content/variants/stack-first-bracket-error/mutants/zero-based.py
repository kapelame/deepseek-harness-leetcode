def firstBracketError(s):
    partner = {")": "(", "]": "[", "}": "{"}
    stack = []
    for index, ch in enumerate(s):
        if ch in partner:
            if not stack or stack[-1] != partner[ch]:
                return index
            stack.pop()
        else:
            stack.append(ch)
    return 0 if not stack else len(s)
