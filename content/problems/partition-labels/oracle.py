def partitionLabels(s):
    out, start = [], 0
    while start < len(s):
        end = start
        while any(ch in s[end + 1:] for ch in set(s[start:end + 1])):
            end += 1
        out.append(end - start + 1)
        start = end + 1
    return out
