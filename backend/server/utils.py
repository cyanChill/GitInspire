# Used to serialize the lists that may occur via relations in a SQLAlchemy
# object.
def serialize_sqlalchemy_objs(sqlalchemy_objs):
    return [item.as_dict() for item in sqlalchemy_objs]

# Lowercases and replace space with an underscore
def normalizeStr(str):
    return str.lower().strip().replace(" ", "_")
