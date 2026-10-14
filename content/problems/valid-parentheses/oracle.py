def isValid(s):
    previous = None
    while previous != s:
        previous = s
        s = s.replace("()", "").replace("[]", "").replace("{}", "")
    return s == ""
