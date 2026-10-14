import re
def decodeString(s):
    pattern = re.compile(r"(\d+)\[([a-z]*)\]")
    while True:
        expanded = pattern.sub(lambda m: m.group(2) * int(m.group(1)), s)
        if expanded == s:
            return s
        s = expanded
