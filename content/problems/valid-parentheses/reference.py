class Solution:
    def isValid(self, s: str) -> bool:
        partner = {")": "(", "]": "[", "}": "{"}
        stack = []
        for ch in s:
            if ch in partner:
                if not stack or stack[-1] != partner[ch]:
                    return False
                stack.pop()
            else:
                stack.append(ch)
        return not stack
