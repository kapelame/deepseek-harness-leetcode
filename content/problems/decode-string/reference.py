def decodeString(s):
    stack, current, num = [], "", 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == "[":
            stack.append((current, num))
            current, num = "", 0
        elif ch == "]":
            outer, count = stack.pop()
            current = outer + current * count
        else:
            current += ch
    return current
