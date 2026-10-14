def firstBracketError(s):
    opens = {"(": 0, "[": 0, "{": 0}
    partner = {")": "(", "]": "[", "}": "{"}
    for index, ch in enumerate(s):
        if ch in partner:
            if opens[partner[ch]] == 0:
                return index + 1
            opens[partner[ch]] -= 1
        else:
            opens[ch] += 1
    return 0 if sum(opens.values()) == 0 else len(s) + 1
