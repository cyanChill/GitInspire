from datetime import date, timedelta

# Used to serialize the lists that may occur via relations in a SQLAlchemy
# object.
def serialize_sqlalchemy_objs(sqlalchemy_objs):
    return [item.as_dict() for item in sqlalchemy_objs]


# Lowercases and replace space with an underscore
def normalizeStr(str):
    return str.lower().strip().replace(" ", "_")


def isXMonthOld(datetimeObj, months):
    time_threshold = date.today() - timedelta(days=months * 30)
    dateObj_date = date(datetimeObj.year, datetimeObj.month, datetimeObj.day)
    return dateObj_date < time_threshold


# Use to sort the languages of a repository from the GitHub API from
# most used language to least used
def filterLangs(langDict):
    if len(langDict) == 0:
        return []

    sortedLang = sorted(langDict.items(), key=lambda x: x[1], reverse=True)
    # 1st index in array is the primary language
    return [x[0] for x in sortedLang]
